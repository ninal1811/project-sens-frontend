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
}) 