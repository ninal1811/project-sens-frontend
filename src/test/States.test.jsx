import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import axios from 'axios'
import States from '../Components/States/States'

vi.mock('axios')

describe('States Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear console.error spy to avoid noise
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error.mockRestore()
  })

  // Testing Loading States
  describe('Loading State', () => {
    it('displays loading message initially', () => {
      axios.get.mockImplementation(() => new Promise(() => {})) 
      render(
        <MemoryRouter>
          <States />
        </MemoryRouter>
      )
      
      expect(screen.getByText('Loading states...')).toBeInTheDocument()
    })

    it('shows heading while loading', () => {
      axios.get.mockImplementation(() => new Promise(() => {}))
      
      render(
        <MemoryRouter>
          <States />
        </MemoryRouter>
      )
      
      expect(screen.getByText('States Database')).toBeInTheDocument()
    })
  })
  // Group 2: Successful Data Fetching
  describe('API Integration - Success Cases', () => {
    it('fetches from correct endpoint', async () => {
      axios.get.mockResolvedValue({ data: { States: [] } })
      
      render(
        <MemoryRouter>
          <States />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'https://projectsens.pythonanywhere.com/states/read'
        )
      })
    })

    it('renders states when API returns lowercase "states"', async () => {
      const mockStates = [
        { country_code: 'US', state_code: 'NY', name: 'New York' },
        { country_code: 'US', state_code: 'CA', name: 'California' }
      ]
      axios.get.mockResolvedValue({ data: { states: mockStates } })
      
      render(
        <MemoryRouter>
          <States />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/New York/)).toBeInTheDocument()
        expect(screen.getByText(/California/)).toBeInTheDocument()
      })
    })

    it('renders states when API returns uppercase "States"', async () => {
      const mockStates = [
        { country_code: 'US', state_code: 'TX', name: 'Texas' }
      ]
      axios.get.mockResolvedValue({ data: { States: mockStates } })
      
      render(
        <MemoryRouter>
          <States />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/Texas/)).toBeInTheDocument()
      })
    })

    it('converts object response to array', async () => {
      const mockStatesObj = {
        NY: { country_code: 'US', state_code: 'NY', name: 'New York' },
        CA: { country_code: 'US', state_code: 'CA', name: 'California' }
      }
      axios.get.mockResolvedValue({ data: { States: mockStatesObj } })
      
      render(
        <MemoryRouter>
          <States />
        </MemoryRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/New York/)).toBeInTheDocument()
        expect(screen.getByText(/California/)).toBeInTheDocument()
      })
    })
  })

})