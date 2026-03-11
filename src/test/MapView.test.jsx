import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import axios from 'axios'
import MapView from './MapView'

vi.mock('axios')

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,

  TileLayer: () => <div data-testid="tile-layer" />,

  CircleMarker: () => <div data-testid="city-marker" />,

  Popup: ({ children }) => <div>{children}</div>,

  useMap: () => ({
    fitBounds: vi.fn(),  
    setView: vi.fn(),    
    getPane: vi.fn(() => null),  
  }),
  useMapEvents: vi.fn(() => null),
}))


vi.mock('./Legend', () => ({
  default: ({ showStates }) => <div data-testid="legend" data-show-states={showStates}>Legend</div>
}))


vi.mock('./InfoPanel', () => ({
  default: ({ selectedCountry, selectedState, showStates, onBackToCountries }) => (
    <div data-testid="info-panel">
      {selectedCountry ? `Country: ${selectedCountry.name}` : 'No country selected'}
      {selectedState && ` | State: ${selectedState.name}`}
      {showStates && ' | States visible'}
    </div>
  )
}))


vi.mock('../data/countries.json', () => ({ default: { type: 'FeatureCollection', features: [] } }))
vi.mock('../data/states.json', () => ({ default: { type: 'FeatureCollection', features: [] } }))
vi.mock('../data/cities.json', () => ({ default: {} }))

vi.mock('../constants/imgUrls', () => ({
  COUNTRY_IMAGE_URLS: {},
  STATE_IMAGE_URLS: {},
  CITY_IMAGE_URLS: {}
}))

vi.mock('./MapView.css', () => ({}))
// Test suite for MapView snapshot tests
describe('MapView Snapshots', () => {
  
  // Test 1: Snapshot of MapView when first loaded (before API data arrives)
  it('matches snapshot with initial load (no data)', () => {
    axios.get.mockResolvedValue({ data: {} })
    
    const { container } = render(<MapView />)
    
    expect(container).toMatchSnapshot()
  })
})