import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import Navbar from "../Components/NavBar";

// Helper to render Navbar at a specific route
function renderNavbar(route = '/', props = {}) {
  const defaultProps = {
    searchQuery: '',
    onSearch: vi.fn(),
    searchResults: [],
    showSearchResults: false,
    onSelectResult: vi.fn(),
    onClearSearch: vi.fn(),
    ...props,
  };

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Navbar {...defaultProps} />
    </MemoryRouter>
  );
}

describe('Navbar search bar', () => {
  it('shows search bar on the explore page (/)', () => {
    renderNavbar('/');
    expect(screen.getByPlaceholderText(/search countries, states, cities/i)).toBeInTheDocument();
  });

  it('hides search bar on /Countries', () => {
    renderNavbar('/Countries');
    expect(screen.queryByPlaceholderText(/search countries, states, cities/i)).not.toBeInTheDocument();
  });

  it('hides search bar on /States', () => {
    renderNavbar('/States');
    expect(screen.queryByPlaceholderText(/search countries, states, cities/i)).not.toBeInTheDocument();
  });

  it('hides search bar on /Cities', () => {
    renderNavbar('/Cities');
    expect(screen.queryByPlaceholderText(/search countries, states, cities/i)).not.toBeInTheDocument();
  });
});

describe('Navbar search interactions', () => {
  it('calls onSearch when typing in the search input', () => {
    const onSearch = vi.fn();
    renderNavbar('/', { onSearch });

    fireEvent.change(screen.getByPlaceholderText(/search countries, states, cities/i), {
      target: { value: 'France' },
    });

    expect(onSearch).toHaveBeenCalledWith('France');
  });

  it('shows clear button when searchQuery is not empty', () => {
    renderNavbar('/', { searchQuery: 'France' });
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('calls onClearSearch when clear button is clicked', () => {
    const onClearSearch = vi.fn();
    renderNavbar('/', { searchQuery: 'France', onClearSearch });

    fireEvent.click(screen.getByText('✕'));
    expect(onClearSearch).toHaveBeenCalled();
  });

  it('shows dropdown results when showSearchResults is true and results exist', () => {
    const results = [
      { id: 'USA', type: 'country', name: 'United States' },
      { id: 'NY', type: 'state', name: 'New York', countryName: 'United States' },
    ];
    renderNavbar('/', { searchResults: results, showSearchResults: true, searchQuery: 'uni' });

    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('calls onSelectResult when a result is clicked', () => {
    const onSelectResult = vi.fn();
    const results = [{ id: 'USA', type: 'country', name: 'United States' }];
    renderNavbar('/', { searchResults: results, showSearchResults: true, searchQuery: 'uni', onSelectResult });

    fireEvent.click(screen.getByText('United States'));
    expect(onSelectResult).toHaveBeenCalledWith(results[0]);
  });

  it('shows no results message when search returns empty', () => {
    renderNavbar('/', { searchResults: [], showSearchResults: true, searchQuery: 'zzz' });
    expect(screen.getByText(/no results for/i)).toBeInTheDocument();
  });
});

describe('Navbar hamburger menu', () => {
  it('toggles mobile menu open and closed', () => {
    renderNavbar('/');
    const hamburger = screen.getByLabelText(/toggle menu/i);

    // Menu starts closed
    expect(screen.getByRole('navigation')).not.toHaveClass('open');

    fireEvent.click(hamburger);
    expect(screen.getByRole('navigation')).toHaveClass('open');

    fireEvent.click(hamburger);
    expect(screen.getByRole('navigation')).not.toHaveClass('open');
  });
});