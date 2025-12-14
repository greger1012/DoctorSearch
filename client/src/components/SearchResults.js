import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Star } from 'lucide-react';

const ResultsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const SearchLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const FiltersSidebar = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  overscroll-behavior: contain;

  @media (max-width: 968px) {
    position: static;
    max-height: none;
    overflow: visible;
  }
`;

const FilterTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ClearButton = styled.button`
  font-size: 0.75rem;
  color: #667eea;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
  
  &:disabled {
    color: #cbd5e0;
    cursor: not-allowed;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background 0.2s;
  font-size: 0.875rem;
  color: #4a5568;
  
  &:hover {
    background: #f7fafc;
  }
  
  input[type="checkbox"] {
    cursor: pointer;
  }
`;

const FilterSectionTitle = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const ResultsArea = styled.div`
  min-width: 0;
`;

const SummaryCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
`;

const SummaryTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SummaryText = styled.p`
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const SummaryHighlights = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: #4a5568;
  font-size: 0.875rem;
`;

const SummaryHighlightGroup = styled.div`
  min-width: 180px;
`;

const SummaryHighlightTitle = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
`;

const ResultsHeader = styled.div`
  margin-bottom: 2rem;
`;

const ResultsCount = styled.p`
  color: #4a5568;
  font-size: 1.125rem;
  margin-bottom: 1rem;
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SortLabel = styled.label`
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
`;

const SortSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background: white;
  color: #2d3748;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ResultsTabs = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: ${props => props.active ? '#667eea' : '#4a5568'};
  font-weight: 600;
  border-bottom: 2px solid ${props => props.active ? '#667eea' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #667eea;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const ResultCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const DoctorCard = styled(ResultCard)`
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: block;
  
  .header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #667eea;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: bold;
    color: white;
    flex-shrink: 0;
  }
  
  .info {
    flex: 1;
  }
  
  .name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.25rem;
  }
  
  .specialty {
    color: #667eea;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  .location {
    color: #4a5568;
    font-size: 0.875rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-top: 0.75rem;
    
    svg {
      flex-shrink: 0;
      margin-top: 0.25rem;
    }
    
    > div {
      line-height: 1.5;
    }
  }
  
  .rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    font-size: 0.875rem;
  }
  
  .stats {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #4a5568;
  }
  
  .status {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    margin-top: 0.75rem;
    display: inline-block;
  }
  
  .accepting {
    background: #c6f6d5;
    color: #22543d;
  }
  
  .not-accepting {
    background: #fed7d7;
    color: #742a2a;
  }
`;

const LocationCard = styled(ResultCard)`
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.25rem;
  }
  
  .location {
    color: #667eea;
    font-weight: 500;
  }
  
  .address {
    color: #4a5568;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }
  
  .services {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .service-tag {
    background: #edf2f7;
    color: #4a5568;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
  }
  
  .contact {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #4a5568;
  }
`;

const ContentCard = styled(ResultCard)`
  .title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.5rem;
  }
  
  .summary {
    color: #4a5568;
    margin-bottom: 1rem;
  }
  
  .meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #718096;
  }
`;

const SearchResults = ({
  results = [],
  sections = {},
  query,
  aggregations = {},
  locationAggregations = {},
  contentAggregations = {},
  totals = {},
  loading,
  summary,
  timeRange
}) => {
  const [activeTab, setActiveTab] = React.useState('all');
  const [selectedSpecialties, setSelectedSpecialties] = React.useState([]);
  const [selectedLocations, setSelectedLocations] = React.useState([]);
  const [acceptingPatientsOnly, setAcceptingPatientsOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('relevance');
  const [lastQuery, setLastQuery] = React.useState('');

  // Reset filters when search query changes
  React.useEffect(() => {
    if (query !== lastQuery) {
      setSelectedSpecialties([]);
      setSelectedLocations([]);
      setAcceptingPatientsOnly(false);
      setLastQuery(query);
    }
  }, [query, lastQuery]);

  const doctorResultsRaw = sections?.doctors?.length
    ? sections.doctors
    : results.filter(result => result.type === 'doctor');
  const locationResults = sections?.locations?.length
    ? sections.locations
    : results.filter(result => result.type === 'location');
  const contentResults = sections?.content?.length
    ? sections.content
    : results.filter(result => result.type === 'content');

  const filterDoctorResults = React.useCallback((inputResults) => {
    return inputResults.filter(result => {
      if (selectedSpecialties.length > 0 && !selectedSpecialties.includes(result.source.specialty)) {
        return false;
      }
      if (selectedLocations.length > 0 && !selectedLocations.includes(result.source.location)) {
        return false;
      }
      if (acceptingPatientsOnly && !result.source.acceptingPatients) {
        return false;
      }
      return true;
    });
  }, [selectedSpecialties, selectedLocations, acceptingPatientsOnly]);

  const sortDoctorResults = React.useCallback((inputResults) => {
    const sorted = [...inputResults];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) =>
          (a.source.name || '').localeCompare(b.source.name || '')
        );
      case 'rating':
        return sorted.sort((a, b) => {
          const ratingA = a.source.rating != null ? a.source.rating : 0;
          const ratingB = b.source.rating != null ? b.source.rating : 0;
          return ratingB - ratingA;
        });
      case 'graduation':
        return sorted.sort((a, b) => {
          const dateA = a.source.graduationDate ? new Date(a.source.graduationDate).getTime() : 0;
          const dateB = b.source.graduationDate ? new Date(b.source.graduationDate).getTime() : 0;
          return dateB - dateA;
        });
      case 'relevance':
      default:
        return sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
  }, [sortBy]);

  const filteredDoctorResults = React.useMemo(() => {
    return sortDoctorResults(filterDoctorResults(doctorResultsRaw));
  }, [doctorResultsRaw, filterDoctorResults, sortDoctorResults]);

  const doctorCount = filteredDoctorResults.length;
  const locationCount = locationResults.length;
  const contentCount = contentResults.length;
  const overallCount = doctorCount + locationCount + contentCount;

  const allResults = React.useMemo(() => {
    return [...filteredDoctorResults, ...locationResults, ...contentResults];
  }, [filteredDoctorResults, locationResults, contentResults]);

  const displayedResults = React.useMemo(() => {
    switch (activeTab) {
      case 'doctor':
        return filteredDoctorResults;
      case 'location':
        return locationResults;
      case 'content':
        return contentResults;
      default:
        return allResults;
    }
  }, [activeTab, filteredDoctorResults, locationResults, contentResults, allResults]);

  const specialties = React.useMemo(() => {
    const specialtyMap = new Map();
    doctorResultsRaw.forEach(result => {
      if (result.source.specialty) {
        const count = specialtyMap.get(result.source.specialty) || 0;
        specialtyMap.set(result.source.specialty, count + 1);
      }
    });
    return Array.from(specialtyMap.entries())
      .map(([key, count]) => ({ key, doc_count: count }))
      .sort((a, b) => b.doc_count - a.doc_count);
  }, [doctorResultsRaw]);

  const locations = React.useMemo(() => {
    const locationMap = new Map();
    doctorResultsRaw.forEach(result => {
      if (result.source.location) {
        const count = locationMap.get(result.source.location) || 0;
        locationMap.set(result.source.location, count + 1);
      }
    });
    return Array.from(locationMap.entries())
      .map(([key, count]) => ({ key, doc_count: count }))
      .sort((a, b) => b.doc_count - a.doc_count);
  }, [doctorResultsRaw]);

  const toggleSpecialty = (specialty) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };
  
  const toggleLocation = (location) => {
    setSelectedLocations(prev => 
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };
  
  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedLocations([]);
    setAcceptingPatientsOnly(false);
  };
  
  const hasActiveFilters = selectedSpecialties.length > 0 || 
                           selectedLocations.length > 0 || 
                           acceptingPatientsOnly;

  const renderHighlights = (text, highlights) => {
    if (!highlights || !text || !Array.isArray(highlights) || highlights.length === 0) {
      return text;
    }
    
    let highlightedText = text;
    highlights.forEach(highlight => {
      // Extract text from highlight (remove <em> tags if present)
      const cleanHighlight = highlight.replace(/<em>/g, '').replace(/<\/em>/g, '');
      const regex = new RegExp(cleanHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      highlightedText = highlightedText.replace(regex, `<span style="background: #fef5e7; color: #744210; padding: 0.125rem 0.25rem; border-radius: 0.25rem;">${cleanHighlight}</span>`);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const renderDoctorCard = (result) => {
    const source = result.source;
    const acceptingPatients = source.acceptingPatients || source.newPatient === 'New Patients (Yes)';
    const fullAddress = `${source.address}, ${source.city}, ${source.state} ${source.zip}`;
    
    // Include query in URL if available
    const doctorUrl = query 
      ? `/doctor/${result.id}?query=${encodeURIComponent(query)}`
      : `/doctor/${result.id}`;
    
    return (
      <DoctorCard as={Link} to={doctorUrl} key={result.id}>
        <div className="header">
          <div className="avatar">
            {source.firstName?.charAt(0) || 'D'}{source.lastName?.charAt(0) || ''}
          </div>
          <div className="info">
            <div className="name">
              {source.name} {source.title && `, ${source.title}`}
            </div>
            {source.specialty && (
              <div className="specialty">
                {source.specialty}
                {source.secondarySpecialties && source.secondarySpecialties.length > 0 && 
                  ` • ${source.secondarySpecialties.join(', ')}`}
              </div>
            )}
            
            {/* Board Certifications */}
            {source.boardCertifications && source.boardCertifications.length > 0 && (
              <div style={{ color: '#4a5568', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                <strong>Board Certified:</strong> {source.boardCertifications.join(', ')}
              </div>
            )}
            
            {/* Education */}
            {source.institution && (
              <div style={{ color: '#4a5568', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                <strong>Education:</strong> {source.education && `${source.education}, `}{source.institution}
                {source.graduationDate && ` (${new Date(source.graduationDate).getFullYear()})`}
              </div>
            )}
            
            {/* Location and Contact */}
            {source.location && (
              <div className="location">
                <MapPin size={14} />
                <div>
                  <div><strong>{source.location}</strong></div>
                  <div>{fullAddress}</div>
                  {source.phone && <div>{source.phone}</div>}
                </div>
              </div>
            )}
            
            {/* Rating - Only show if we have real data (not null/undefined) */}
            {(source.rating != null || source.reviews != null) && (
              <div className="rating">
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                {source.rating != null && <span><strong>{source.rating}</strong></span>}
                {source.reviews != null && <span>({source.reviews} patient reviews)</span>}
              </div>
            )}
            
            {/* Status */}
            <div className={`status ${acceptingPatients ? 'accepting' : 'not-accepting'}`}>
              {acceptingPatients ? '✓ Accepting New Patients' : '✗ Not Accepting New Patients'}
            </div>
            
            {/* Demographics */}
            {(source.gender || source.language) && (
              <div style={{ color: '#4a5568', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {source.gender && (source.gender === 'M' ? 'Male' : 'Female')}
                {source.language && source.language !== '' && (
                  <>
                    {source.gender ? ' • ' : ''}
                    {`Speaks ${source.language}`}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </DoctorCard>
    );
  };

  const renderLocationCard = (result) => {
    const source = result.source;
    const services = source.services || [];
    
    return (
      <LocationCard key={result.id}>
        <div className="header">
          <div>
            <div className="name">
              {renderHighlights(source.name, result.highlights.name)}
            </div>
            {source.location && (
              <div className="location">
                {renderHighlights(source.location, result.highlights.location)}
              </div>
            )}
            {source.address && (
              <div className="address">
                <MapPin size={14} />
                {source.address}
              </div>
            )}
          </div>
        </div>
        
        {source.description && (
          <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
            {renderHighlights(source.description, result.highlights.description)}
          </p>
        )}
        
        {services.length > 0 && (
          <div className="services">
            {services.slice(0, 4).map(service => (
              <span key={service} className="service-tag">{service}</span>
            ))}
            {services.length > 4 && (
              <span className="service-tag">+{services.length - 4} more</span>
            )}
          </div>
        )}
        
        <div className="contact">
          {source.phone && <span><Phone size={14} /> {source.phone}</span>}
          {source.email && <span><Mail size={14} /> {source.email}</span>}
        </div>
      </LocationCard>
    );
  };

  const renderContentCard = (result) => {
    const source = result.source;
    
    return (
      <ContentCard key={result.id}>
        {source.title && (
          <div className="title">
            {renderHighlights(source.title, result.highlights.title)}
          </div>
        )}
        {source.summary && (
          <div className="summary">
            {renderHighlights(source.summary, result.highlights.summary)}
          </div>
        )}
        <div className="meta">
          {source.category && <span>{source.category}</span>}
          {source.author && <span>{source.author}</span>}
          {source.publishedDate && <span>{new Date(source.publishedDate).toLocaleDateString()}</span>}
        </div>
      </ContentCard>
    );
  };

  if (loading) {
    return (
      <ResultsContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '1.5rem', color: '#4a5568' }}>Searching...</div>
        </div>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      <SearchLayout>
        {/* Filters Sidebar */}
        <FiltersSidebar>
          <FilterTitle>
            <span>Filter Results</span>
            <ClearButton 
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear All
            </ClearButton>
          </FilterTitle>
          
          {/* Accepting Patients Filter */}
          <FilterSection>
            <FilterLabel>
              <input
                type="checkbox"
                checked={acceptingPatientsOnly}
                onChange={(e) => setAcceptingPatientsOnly(e.target.checked)}
              />
              Accepting New Patients
            </FilterLabel>
          </FilterSection>
          
          {/* Specialty Filter */}
          {specialties.length > 0 && (
            <FilterSection>
              <FilterSectionTitle>Specialty</FilterSectionTitle>
              {specialties.slice(0, 10).map(bucket => (
                <FilterLabel key={bucket.key}>
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(bucket.key)}
                    onChange={() => toggleSpecialty(bucket.key)}
                  />
                  {bucket.key} ({bucket.doc_count})
                </FilterLabel>
              ))}
            </FilterSection>
          )}
          
          {/* Location Filter */}
          {locations.length > 0 && (
            <FilterSection>
              <FilterSectionTitle>Location</FilterSectionTitle>
              {locations.map(bucket => (
                <FilterLabel key={bucket.key}>
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(bucket.key)}
                    onChange={() => toggleLocation(bucket.key)}
                  />
                  {bucket.key} ({bucket.doc_count})
                </FilterLabel>
              ))}
            </FilterSection>
          )}
        </FiltersSidebar>
        
        {/* Results Area */}
        <ResultsArea>
          {summary && (
            <SummaryCard>
              <SummaryTitle>AI Insight</SummaryTitle>
              <SummaryText>{summary.text}</SummaryText>

              {(summary.highlights?.specialties?.length > 0 ||
                summary.highlights?.doctorLocations?.length > 0 ||
                summary.highlights?.clinics?.length > 0 ||
                summary.highlights?.articles?.length > 0 ||
                summary.highlights?.timeRange) && (
                <SummaryHighlights>
                  {summary.highlights?.specialties?.length > 0 && (
                    <SummaryHighlightGroup>
                      <SummaryHighlightTitle>Top Specialties</SummaryHighlightTitle>
                      <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                        {summary.highlights.specialties.map(spec => (
                          <li key={spec.name}>{spec.name} ({spec.count})</li>
                        ))}
                      </ul>
                    </SummaryHighlightGroup>
                  )}

                  {summary.highlights?.doctorLocations?.length > 0 && (
                    <SummaryHighlightGroup>
                      <SummaryHighlightTitle>Where They Practice</SummaryHighlightTitle>
                      <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                        {summary.highlights.doctorLocations.map(loc => (
                          <li key={loc.name}>{loc.name} ({loc.count})</li>
                        ))}
                      </ul>
                    </SummaryHighlightGroup>
                  )}

                  {summary.highlights?.clinics?.length > 0 && (
                    <SummaryHighlightGroup>
                      <SummaryHighlightTitle>Notable Clinics</SummaryHighlightTitle>
                      <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                        {summary.highlights.clinics.map(clinic => (
                          <li key={clinic.name}>
                            {clinic.name}
                            {clinic.location ? ` • ${clinic.location}` : ''}
                          </li>
                        ))}
                      </ul>
                    </SummaryHighlightGroup>
                  )}

                  {summary.highlights?.articles?.length > 0 && (
                    <SummaryHighlightGroup>
                      <SummaryHighlightTitle>Featured Resources</SummaryHighlightTitle>
                      <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                        {summary.highlights.articles.map(article => (
                          <li key={article.title}>{article.title}</li>
                        ))}
                      </ul>
                    </SummaryHighlightGroup>
                  )}

                  {summary.highlights?.accepting && (
                    <SummaryHighlightGroup>
                      <SummaryHighlightTitle>Accepting New Patients</SummaryHighlightTitle>
                      <div>
                        {summary.highlights.accepting.count} providers ({summary.highlights.accepting.percent}%)
                      </div>
                    </SummaryHighlightGroup>
                  )}

                  {summary.highlights?.timeRange && (
                    <SummaryHighlightGroup>
                      <SummaryHighlightTitle>Time Frame</SummaryHighlightTitle>
                      <div>{summary.highlights.timeRange}</div>
                    </SummaryHighlightGroup>
                  )}
                </SummaryHighlights>
              )}
            </SummaryCard>
          )}

          <ResultsHeader>
            <ResultsCount>
              {overallCount > 0
                ? `Showing ${doctorCount.toLocaleString()} doctor${doctorCount === 1 ? '' : 's'}` +
                  `${locationCount ? ` • ${locationCount.toLocaleString()} location${locationCount === 1 ? '' : 's'}` : ''}` +
                  `${contentCount ? ` • ${contentCount.toLocaleString()} specialty guide${contentCount === 1 ? '' : 's'}` : ''}` +
                  ` for "${query}"`
                : `No matches found for "${query}"`}
            </ResultsCount>
            
            {doctorResultsRaw.length > 0 && (
              <SortContainer>
                <SortLabel htmlFor="sort-select">Sort doctors by:</SortLabel>
                <SortSelect 
                  id="sort-select"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  disabled={doctorCount === 0}
                >
                  <option value="relevance">Best Match</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="rating">Highest Rated</option>
                  <option value="graduation">Newest Graduates</option>
                </SortSelect>
              </SortContainer>
            )}
            
            <ResultsTabs>
              <Tab 
                active={activeTab === 'all'} 
                onClick={() => setActiveTab('all')}
              >
                All ({overallCount})
              </Tab>
              <Tab 
                active={activeTab === 'doctor'} 
                onClick={() => setActiveTab('doctor')}
              >
                Doctors ({doctorCount})
              </Tab>
              <Tab 
                active={activeTab === 'location'} 
                onClick={() => setActiveTab('location')}
              >
                Locations ({locationCount})
              </Tab>
              <Tab 
                active={activeTab === 'content'} 
                onClick={() => setActiveTab('content')}
              >
                Content ({contentCount})
              </Tab>
            </ResultsTabs>
          </ResultsHeader>

          <ResultsGrid>
            {displayedResults.map(result => {
              switch (result.type) {
                case 'doctor':
                  return renderDoctorCard(result);
                case 'location':
                  return renderLocationCard(result);
                case 'content':
                  return renderContentCard(result);
                default:
                  return null;
              }
            })}
          </ResultsGrid>

          {overallCount === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '1.5rem', color: '#4a5568', marginBottom: '1rem' }}>
                No results found
              </div>
              <div style={{ color: '#718096' }}>
                Try adjusting your search terms or filters
              </div>
            </div>
          )}
        </ResultsArea>
      </SearchLayout>
    </ResultsContainer>
  );
};

export default SearchResults;
