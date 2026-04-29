import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import InfoPanel from '../Components/InfoPanel'

vi.mock('../constants/imgUrls', () => ({
  STATE_IMAGE_URLS: {
    NY: { food_name: 'New York Pizza' }
  }
}))

const mockCountry = {
  name: 'morocco',
  _id: 'MAR',
  capital: 'rabat',
  nat_dish: 'couscous',
  pop_dish_1: 'tagine',
  pop_dish_2: 'pastilla'
}

const mockState = {
  name: 'New York',
  state_code: 'NY'
}

describe('InfoPanel', () => {
  it('matches snapshot with no country selected', () => {
    const { container } = render(
      <InfoPanel selectedCountry={null} selectedState={null} showStates={false} onBackToCountries={() => {}} />
    )
    expect(container).toMatchSnapshot()
  })

  it('matches snapshot with country selected', () => {
    const { container } = render(
      <InfoPanel selectedCountry={mockCountry} selectedState={null} showStates={false} onBackToCountries={() => {}} />
    )
    expect(container).toMatchSnapshot()
  })

  it('matches snapshot with country and state selected', () => {
    const { container } = render(
      <InfoPanel selectedCountry={mockCountry} selectedState={mockState} showStates={true} onBackToCountries={() => {}} />
    )
    expect(container).toMatchSnapshot()
  })

  it('matches snapshot with back button visible', () => {
    const { container } = render(
      <InfoPanel selectedCountry={mockCountry} selectedState={null} showStates={true} onBackToCountries={() => {}} />
    )
    expect(container).toMatchSnapshot()
  })

  it('renders the correct content based on selection state', () => {
    // No selection — expect a placeholder or empty state
    const { rerender } = render(
      <InfoPanel selectedCountry={null} selectedState={null} showStates={false} onBackToCountries={() => {}} />
    )
    expect(screen.queryByText(/morocco/i)).not.toBeInTheDocument()

    // Country selected — expect country data to appear
    rerender(
      <InfoPanel selectedCountry={mockCountry} selectedState={null} showStates={false} onBackToCountries={() => {}} />
    )
    expect(screen.getByText(/morocco/i)).toBeInTheDocument()
    expect(screen.getByText(/couscous/i)).toBeInTheDocument()
    expect(screen.getByText(/tagine/i)).toBeInTheDocument()
    expect(screen.getByText(/pastilla/i)).toBeInTheDocument()

    // State selected — expect state data to replace or augment country data
    rerender(
      <InfoPanel selectedCountry={mockCountry} selectedState={mockState} showStates={true} onBackToCountries={() => {}} />
    )
    expect(screen.getByText(/new york/i)).toBeInTheDocument()
    expect(screen.getByText(/new york pizza/i)).toBeInTheDocument()
  })

  it('shows the back button only when showStates is true and calls onBackToCountries on click', () => {
    const handleBack = vi.fn()

    // showStates=false — back button should NOT be present
    const { rerender } = render(
      <InfoPanel selectedCountry={mockCountry} selectedState={null} showStates={false} onBackToCountries={handleBack} />
    )
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()

    // showStates=true — back button SHOULD appear
    rerender(
      <InfoPanel selectedCountry={mockCountry} selectedState={null} showStates={true} onBackToCountries={handleBack} />
    )
    const backButton = screen.getByRole('button', { name: /back/i })
    expect(backButton).toBeInTheDocument()
    
    fireEvent.click(backButton)
    expect(handleBack).toHaveBeenCalledTimes(1)
  })
})