import { describe, it, expect, vi } from 'vitest'
import { render, waitFor, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import MapView from '../Components/MapView'

vi.mock('axios')

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  }
})

vi.mock('../Components/NavBar', () => ({
  default: () => <div data-testid="navbar">NavBar</div>
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  GeoJSON: () => <div data-testid="geojson-layer" />,
  CircleMarker: () => <div data-testid="circle-marker" />,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,

  useMapEvents: () => ({}),

  useMap: () => ({
    setView: vi.fn(),
    flyTo: vi.fn(),
    fitBounds: vi.fn(),
    getPane: vi.fn(() => document.createElement('div')),
    on: vi.fn(),
    off: vi.fn(),
  })
  
}))


vi.mock('../Components/Legend', () => ({
  default: ({ showStates }) => <div data-testid="legend" data-show-states={showStates}>Legend</div>
}))



vi.mock('../data/countries.json', () => ({ default: { type: 'FeatureCollection', features: [] } }))
vi.mock('../data/states.json', () => ({ default: { type: 'FeatureCollection', features: [] } }))
vi.mock('../data/cities.json', () => ({ default: {} }))

vi.mock('../constants/imgUrls', () => ({
  COUNTRY_IMAGE_URLS: {},
  STATE_IMAGE_URLS: {},
  CITY_IMAGE_URLS: {}
}))

vi.mock('../Components/MapView.css', () => ({}))

function renderMapView() {
  return render(
    <MemoryRouter>
      <MapView />
    </MemoryRouter>
  )
}

// Test suite for MapView snapshot tests
describe('MapView Snapshots', () => {
  
  // Test 1: Snapshot of MapView when first loaded (before API data arrives)
  it('matches snapshot with initial load (no data)', () => {
    axios.get.mockResolvedValue({ data: {} })
    
    const { container } = renderMapView()
    
    expect(container).toMatchSnapshot()
  })
    // Test 2: Snapshot after countries are loaded from API
  it('matches snapshot with countries loaded', () => {
    const mockCountries = {
      MAR: { 
        _id: 'MAR',           
        name: 'Morocco',      
        capital: 'Rabat',     
        nat_dish: 'Couscous', 
        pop_dish_1: 'Tagine', 
        pop_dish_2: 'Pastilla' 
      }
    }
    
    axios.get.mockImplementation((url) => {
      if (url.includes('countries')) {
        return Promise.resolve({ data: { countries: mockCountries } })
      }
      return Promise.resolve({ data: {} })
    })
    
    const { container } = renderMapView()
    
    expect(container).toMatchSnapshot()
  })
  // Test 3: Snapshot with all main components rendered
  it('matches snapshot with all components rendered', () => {
    
    axios.get.mockResolvedValue({ 
      data: { 
        countries: {},  
        states: {},    
        Cities: {}      
      } 
    })
    
    const { container } = renderMapView()
    
    expect(container).toMatchSnapshot()
  })
})