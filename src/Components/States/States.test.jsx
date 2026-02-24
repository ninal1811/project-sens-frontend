import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import States from './States'

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
      render(<States />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows heading while loading', () => {
      axios.get.mockImplementation(() => new Promise(() => {}))
      
      render(<States />)
      
      expect(screen.getByText('state data')).toBeInTheDocument()
    })
  })
  // Group 2: Successful Data Fetching
  describe('API Integration - Success Cases', () => {
    it('fetches from correct endpoint', async () => {
      axios.get.mockResolvedValue({ data: { States: [] } })
      
      render(<States />)
      
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
      
      render(<States />)
      
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
      
      render(<States />)
      
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
      
      render(<States />)
      
      await waitFor(() => {
        expect(screen.getByText(/New York/)).toBeInTheDocument()
        expect(screen.getByText(/California/)).toBeInTheDocument()
      })
    })
  })

}) 
