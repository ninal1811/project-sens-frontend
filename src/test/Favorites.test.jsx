import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Favorites from '../Components/Favorites'

vi.mock('../Components/NavBar', () => ({
  default: () => <div data-testid="navbar">NavBar</div>
}))

vi.mock('../Components/ScrollToTop', () => ({
  default: () => <div data-testid="scroll-to-top">ScrollToTop</div>
}))

describe('Favorites Component', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  describe('When not logged in', () => {
    it('shows sign in prompt', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      expect(screen.getByText('Sign in to see your favorites')).toBeInTheDocument()
    })

    it('shows sign in button', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })
  })

  describe('When logged in with no favorites', () => {
    beforeEach(() => {
      sessionStorage.setItem('loggedIn', 'true')
      sessionStorage.setItem('favorites', '[]')
    })

    it('shows empty state message', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      expect(screen.getByText('No favorites yet')).toBeInTheDocument()
    })

    it('shows explore the map button', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      expect(screen.getByText('Explore the Map')).toBeInTheDocument()
    })
  })

  describe('When logged in with favorites', () => {
    const mockFavorites = [
      { id: 'USA', type: 'country', name: 'United States', subtitle: 'Capital: Washington DC', image: '', timestamp: 1000 },
      { id: 'CA', type: 'state', name: 'California (CA)', subtitle: 'USA', image: '', timestamp: 2000 },
      { id: 'New York', type: 'city', name: 'New York', subtitle: 'USA', image: '', timestamp: 3000 }
    ]

    beforeEach(() => {
      sessionStorage.setItem('loggedIn', 'true')
      sessionStorage.setItem('favorites', JSON.stringify(mockFavorites))
    })

    it('displays all favorite cards', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      expect(screen.getByText('United States')).toBeInTheDocument()
      expect(screen.getByText('California (CA)')).toBeInTheDocument()
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    it('shows correct item count', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      expect(screen.getByText(/3 of 3/)).toBeInTheDocument()
    })

    it('shows type labels on cards', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      expect(screen.getAllByText('🌍 Country').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('📍 State').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('🏙️ City').length).toBeGreaterThanOrEqual(1)
    })

    it('shows Clear All and Select buttons', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      expect(screen.getByText('Clear All')).toBeInTheDocument()
      expect(screen.getByText('Select')).toBeInTheDocument()
    })

    it('shows filter buttons', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getAllByText('🌍 Country').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('📍 State').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('🏙️ City').length).toBeGreaterThanOrEqual(2)
    })

    it('filters by country when Country filter clicked', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      const countryButtons = screen.getAllByText('🌍 Country')
      fireEvent.click(countryButtons[0])
      expect(screen.getByText('United States')).toBeInTheDocument()
      expect(screen.queryByText('California (CA)')).not.toBeInTheDocument()
      expect(screen.queryByText('New York')).not.toBeInTheDocument()
    })

    it('enters select mode when Select is clicked', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      fireEvent.click(screen.getByText('Select'))
      expect(screen.getByText('Cancel Select')).toBeInTheDocument()
      expect(screen.getByText('Select All')).toBeInTheDocument()
      expect(screen.getByText('Deselect All')).toBeInTheDocument()
      expect(screen.getByText('0 selected')).toBeInTheDocument()
    })

    it('removes a favorite when X is clicked', () => {
      render(
        <MemoryRouter>
          <Favorites />
        </MemoryRouter>
      )
      const removeButtons = screen.getAllByTitle('Remove from favorites')
      fireEvent.click(removeButtons[0])
      expect(screen.getByText(/2 of 2/)).toBeInTheDocument()
    })
  })
})