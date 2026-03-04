import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import axios from 'axios'
import Cities from './Cities'

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
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows heading while loading', () => {
      axios.get.mockImplementation(() => new Promise(() => {}))
      
      render(
        <MemoryRouter>
          <Cities />
        </MemoryRouter>
      )
      
      expect(screen.getByText('city data')).toBeInTheDocument()
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
})