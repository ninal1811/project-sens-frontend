import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import axios from 'axios'
import Cities from '../Components/Cities/Cities'

vi.mock('axios')

describe('Cities Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error.mockRestore()
  })

  // Group 1: Testing the Loading behavior
  describe('Loading behavior', () => {
    it('displays loading message initially', () => {
      axios.get.mockImplementation(() => new Promise(() => {}))
      
      render(
        <MemoryRouter>
          <Cities />
        </MemoryRouter>
      )
      
      expect(screen.getByText('Loading cities...')).toBeInTheDocument()
    })

    it('shows heading while loading', () => {
      axios.get.mockImplementation(() => new Promise(() => {}))
      
      render(
        <MemoryRouter>
          <Cities />
        </MemoryRouter>
      )
      
      expect(screen.getByText('Cities Database')).toBeInTheDocument()
    })

    it('shows back to home link', () => {
      axios.get.mockImplementation(() => new Promise(() => {}))
      
      render(
        <MemoryRouter>
          <Cities />
        </MemoryRouter>
      )
      
      expect(screen.getByText('← Back to Home')).toBeInTheDocument()
    })
  })
  // Group 2: API Integration
  describe('API Integration', () => {
    it('fetches from correct endpoint', async () => {
      axios.get.mockResolvedValue({ data: { Cities: [] } })
      
      render(
        <MemoryRouter>
          <Cities />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'https://projectsens.pythonanywhere.com/cities/read'
        )
      })
    })

    it('renders cities when API returns uppercase "Cities"', async () => {
      const mockCities = [
        { city: 'New York City', state_code: 'NY', country_code: 'US', rec_restaurant: "Katz's Deli" },
        { city: 'Los Angeles', state_code: 'CA', country_code: 'US', rec_restaurant: 'In-N-Out' }
      ]
      axios.get.mockResolvedValue({ data: { Cities: mockCities } })
      
      render(
        <MemoryRouter>
          <Cities />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/New York City/)).toBeInTheDocument()
        expect(screen.getByText(/Los Angeles/)).toBeInTheDocument()
      })
    })

    it('renders cities when API returns lowercase "cities"', async () => {
      const mockCities = [
        { city: 'Chicago', state_code: 'IL', country_code: 'US', rec_restaurant: 'Portillo\'s' }
      ]
      axios.get.mockResolvedValue({ data: { cities: mockCities } })
      
      render(
        <MemoryRouter>
          <Cities />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/Chicago/)).toBeInTheDocument()
      })
    })

    it('converts object response to array', async () => {
      const mockCitiesObj = {
        NYC: { city: 'New York City', state_code: 'NY', country_code: 'US' },
        LA: { city: 'Los Angeles', state_code: 'CA', country_code: 'US' }
      }
      axios.get.mockResolvedValue({ data: { Cities: mockCitiesObj } })
      
      render(
        <MemoryRouter>
          <Cities />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/New York City/)).toBeInTheDocument()
        expect(screen.getByText(/Los Angeles/)).toBeInTheDocument()
      })
    })
  })

})