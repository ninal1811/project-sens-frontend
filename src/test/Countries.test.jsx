import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import axios from 'axios'
import Countries from '../Components/Countries/Countries.jsx'

// Mock axios
vi.mock('axios')

// Helper to render with router
const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}

describe('Countries Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })
    //Group 1: Testing loading behavior
  describe('Loading State', () => {
    it('displays loading message initially', () => {
      axios.get.mockImplementation(() => new Promise(() => {}))
      renderWithRouter(<Countries />)
      expect(screen.getByText('Loading countries...')).toBeInTheDocument()
    })

    it('shows spinner during loading', () => {
      axios.get.mockImplementation(() => new Promise(() => {}))
      renderWithRouter(<Countries />)
      expect(document.querySelector('.spinner')).toBeInTheDocument()
    })
  })
  // Group 2: API Integration Success
  describe('API Integration Success', () => {
    it('fetches and displays countries from API', async () => {
      const mockCountries = {
        USA: { _id: 'USA', name: 'United States', capital: 'Washington DC', nat_dish: 'Hamburger', pop_dish_1: 'Hot Dog', pop_dish_2: 'Apple Pie' },
        MAR: { _id: 'MAR', name: 'Morocco', capital: 'Rabat', nat_dish: 'Couscous', pop_dish_1: 'Tagine', pop_dish_2: 'Pastilla' }
      }
      
      axios.get.mockResolvedValue({ data: { countries: mockCountries } })
      
      renderWithRouter(<Countries />)
      
      await waitFor(() => {
        expect(screen.getByText('United States (USA)')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Morocco (MAR)')).toBeInTheDocument()
    })

    it('calls correct API endpoint', async () => {
      axios.get.mockResolvedValue({ data: { countries: {} } })
      
      renderWithRouter(<Countries />)
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/countries'))
      })
    })

    it('sorts countries alphabetically by name', async () => {
      const mockCountries = {
        USA: { _id: 'USA', name: 'United States', capital: 'Washington DC' },
        BGD: { _id: 'BGD', name: 'Bangladesh', capital: 'Dhaka' },
        MAR: { _id: 'MAR', name: 'Morocco', capital: 'Rabat' }
      }
      
      axios.get.mockResolvedValue({ data: { countries: mockCountries } })
      
      renderWithRouter(<Countries />)
      
      await waitFor(() => {
        const countryButtons = screen.getAllByRole('button', { name: /\(.*\)/ })
        expect(countryButtons[0]).toHaveTextContent('Bangladesh')
        expect(countryButtons[1]).toHaveTextContent('Morocco')
        expect(countryButtons[2]).toHaveTextContent('United States')
      })
    })
  })
  // Group 3: API Integration Errors
  describe('API Integration Errors', () => {
    it('displays error message when API fails', async () => {
      axios.get.mockRejectedValue(new Error('Network error'))
      
      renderWithRouter(<Countries />)
      
      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument()
      })
    })

    it('shows retry button on error', async () => {
      axios.get.mockRejectedValue(new Error('Failed'))
      
      renderWithRouter(<Countries />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
      })
    })

    it('retries API call when retry button clicked', async () => {
      const user = userEvent.setup()
      axios.get.mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ data: { countries: {} } })
      
      renderWithRouter(<Countries />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
      })
      
      await user.click(screen.getByRole('button', { name: 'Retry' }))
      
      expect(axios.get).toHaveBeenCalledTimes(2)
    })
  })
  // Group 7: Multiple Countries
  describe('Multiple Countries', () => {
    it('displays multiple countries correctly', async () => {
      const mockCountries = {
        USA: { _id: 'USA', name: 'United States', capital: 'Washington DC' },
        MAR: { _id: 'MAR', name: 'Morocco', capital: 'Rabat' },
        JPN: { _id: 'JPN', name: 'Japan', capital: 'Tokyo' }
      }
      
      axios.get.mockResolvedValue({ data: { countries: mockCountries } })
      
      renderWithRouter(<Countries />)
      
      await waitFor(() => {
        expect(screen.getByText('United States (USA)')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Morocco (MAR)')).toBeInTheDocument()
      expect(screen.getByText('Japan (JPN)')).toBeInTheDocument()
    })

    it('can expand multiple countries independently', async () => {
      const user = userEvent.setup()
      const mockCountries = {
        USA: { _id: 'USA', name: 'United States', capital: 'Washington DC' },
        MAR: { _id: 'MAR', name: 'Morocco', capital: 'Rabat' }
      }
      
      axios.get.mockResolvedValue({ data: { countries: mockCountries } })
      
      renderWithRouter(<Countries />)
      
      await waitFor(() => {
        expect(screen.getByText('United States (USA)')).toBeInTheDocument()
      })
      
      const usaButton = screen.getByRole('button', { name: /United States/ })
      const marButton = screen.getByRole('button', { name: /Morocco/ })
      
      await user.click(usaButton)
      await user.click(marButton)
      
      expect(screen.getByText('Washington DC')).toBeInTheDocument()
      expect(screen.getByText('Rabat')).toBeInTheDocument()
    })
  })
})