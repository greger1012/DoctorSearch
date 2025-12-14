import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Search, Filter } from 'lucide-react';
import axios from 'axios';

const SearchContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: border-color 0.2s;
  
  &:focus-within {
    border-color: #667eea;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  outline: none;
  font-size: 1.125rem;
  background: transparent;
  color: #1a202c;
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const SearchButton = styled.button`
  padding: 1rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0 0.75rem 0.75rem 0;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #5a67d8;
  }
`;

const FilterButton = styled.button`
  padding: 1rem;
  background: transparent;
  color: #4a5568;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #667eea;
  }
`;

const FilterPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  width: 300px;
  z-index: 50;
  margin-top: 0.25rem;
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background: white;
  color: #4a5568;
`;

const FilterCheckbox = styled.input`
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #4a5568;
`;

const SearchBox = ({ onSearch, onFiltersChange, filters }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  
  const searchRef = useRef(null);

  useEffect(() => {
    // Load available filter options
    const loadFilterOptions = async () => {
      try {
        const [specialtiesRes, locationsRes] = await Promise.all([
          axios.get('/api/doctors/specialties/list'),
          axios.get('/api/doctors/locations/list')
        ]);
        setAvailableSpecialties(
          (specialtiesRes.data || [])
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
        );
        setAvailableLocations(
          (locationsRes.data || [])
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
        );
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilters && !event.target.closest('[data-filter-panel]')) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, filters);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };
    
    if (filterType === 'acceptingPatients') {
      newFilters[filterType] = value === 'true';
    } else {
      newFilters[filterType] = value;
    }
    
    onFiltersChange(newFilters);
  };

  return (
    <SearchContainer>
      <SearchInputContainer ref={searchRef}>
        <SearchInput
          type="text"
          placeholder="Search for doctors, locations, or health information..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <FilterButton onClick={() => setShowFilters(!showFilters)}>
          <Filter size={20} />
        </FilterButton>
        <SearchButton onClick={handleSearch}>
          <Search size={20} />
        </SearchButton>
      </SearchInputContainer>

      {showFilters && (
        <FilterPanel data-filter-panel>
          <FilterSection>
            <FilterLabel>Specialty</FilterLabel>
            <FilterSelect
              value={filters.specialty || ''}
              onChange={(e) => handleFilterChange('specialty', e.target.value)}
            >
              <option value="">All Specialties</option>
              {availableSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </FilterSelect>
          </FilterSection>

          <FilterSection>
            <FilterLabel>Location</FilterLabel>
            <FilterSelect
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="">All Locations</option>
              {availableLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </FilterSelect>
          </FilterSection>

          <FilterSection>
            <CheckboxLabel>
              <FilterCheckbox
                type="checkbox"
                checked={filters.acceptingPatients || false}
                onChange={(e) => handleFilterChange('acceptingPatients', e.target.checked.toString())}
              />
              Accepting New Patients
            </CheckboxLabel>
          </FilterSection>
        </FilterPanel>
      )}
    </SearchContainer>
  );
};

export default SearchBox;
