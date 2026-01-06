import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import SearchBox from '../components/SearchBox';
import SearchResults from '../components/SearchResults';
import axios from 'axios';

const PageContainer = styled.div`
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 0;
`;

const HeroSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
  color: white;
  margin-bottom: 3rem;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SearchSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const ExampleQueries = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const ExampleTitle = styled.h3`
  color: white;
  margin-bottom: 1rem;
  opacity: 0.9;
`;

const ExampleTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
`;

const ExampleTag = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [sections, setSections] = useState({ doctors: [], locations: [], content: [] });
  const [aggregations, setAggregations] = useState({});
  const [locationAggregations, setLocationAggregations] = useState({});
  const [contentAggregations, setContentAggregations] = useState({});
  const [totals, setTotals] = useState({ overall: 0, doctors: 0, locations: 0, content: 0 });
  const [loading, setLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [summary, setSummary] = useState(null);
  const [timeRange, setTimeRange] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});

  const exampleQueries = [
    "UCSF neurologists at Parnassus",
    "Cardiologists accepting new patients",
    "Emergency care Mission Bay",
    "Pediatric specialists",
    "Cancer treatment locations"
  ];

  const handleSearch = useCallback(async (query, searchFilters = {}) => {
    if (!query.trim()) return;

    setLoading(true);
    setCurrentQuery(query);
    
    try {
      const mergedFilters = { ...filters, ...searchFilters };
      const sanitizedFilters = Object.entries(mergedFilters).reduce((acc, [key, value]) => {
        if (value === '' || value === null || value === undefined) {
          return acc;
        }
        if (key === 'acceptingPatients' && value !== true) {
          return acc;
        }
        acc[key] = value;
        return acc;
      }, {});

      const response = await axios.post('/api/search', {
        query: query,
        filters: sanitizedFilters
      });

      setSearchResults(response.data.results || []);
      setSections(response.data.sections || { doctors: [], locations: [], content: [] });
      setAggregations(response.data.aggregations || {});
      setLocationAggregations(response.data.locationAggregations || {});
      setContentAggregations(response.data.contentAggregations || {});
      setTotals(response.data.totals || { overall: response.data.total || 0, doctors: 0, locations: 0, content: 0 });
      setTimeRange(response.data.timeRange || null);
      setAppliedFilters(response.data.appliedFilters || {});
      setSummary(response.data.summary || null);
      setFilters(mergedFilters);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSections({ doctors: [], locations: [], content: [] });
      setAggregations({});
      setLocationAggregations({});
      setContentAggregations({});
      setTotals({ overall: 0, doctors: 0, locations: 0, content: 0 });
      setTimeRange(null);
      setAppliedFilters({});
      setSummary(null);
      setFilters(searchFilters || {});
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFiltersChange = (newFilters, options = {}) => {
    setFilters(newFilters);
    if (!options.skipSearch && currentQuery) {
      handleSearch(currentQuery, newFilters);
    }
  };

  const handleExampleClick = (query) => {
    handleSearch(query);
  };

  // Load some initial results on page load
  useEffect(() => {
    handleSearch('UCSF doctors');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContainer>
      <HeroSection>
        <HeroTitle>Doctor Search</HeroTitle>
        <HeroSubtitle>
          Search for doctors, locations, and health information across UCSF Health
        </HeroSubtitle>
        
        <SearchSection>
          <SearchBox 
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            filters={filters}
          />
          
          <ExampleQueries>
            <ExampleTitle>Try these searches:</ExampleTitle>
            <ExampleTags>
              {exampleQueries.map((query, index) => (
                <ExampleTag 
                  key={index}
                  onClick={() => handleExampleClick(query)}
                >
                  {query}
                </ExampleTag>
              ))}
            </ExampleTags>
          </ExampleQueries>
        </SearchSection>
      </HeroSection>

      {currentQuery && (
        <SearchResults
          results={searchResults}
          sections={sections}
          query={currentQuery}
          aggregations={aggregations}
          locationAggregations={locationAggregations}
          contentAggregations={contentAggregations}
          totals={totals}
          loading={loading}
          summary={summary}
          timeRange={timeRange}
          appliedFilters={appliedFilters}
        />
      )}
    </PageContainer>
  );
};

export default SearchPage;
