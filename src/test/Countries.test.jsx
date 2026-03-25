import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
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
})