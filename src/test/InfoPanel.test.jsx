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
})