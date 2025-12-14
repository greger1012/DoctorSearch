import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Globe, Car } from 'lucide-react';
import axios from 'axios';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  margin-bottom: 2rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LocationCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const LocationHeader = styled.div`
  margin-bottom: 2rem;
`;

const LocationName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const LocationType = styled.div`
  font-size: 1.25rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Address = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  margin-bottom: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const InfoSection = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #4a5568;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
`;

const ServiceTag = styled.div`
  background: #edf2f7;
  color: #4a5568;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
`;

const HoursGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const HoursDay = styled.div`
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  text-align: center;
`;

const DayName = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
`;

const DayHours = styled.div`
  font-size: 0.875rem;
  color: #4a5568;
`;

const LocationDetail = () => {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`/api/locations/${id}`);
        setLocation(response.data);
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLocation();
    }
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '1.5rem', color: '#4a5568' }}>Loading...</div>
        </div>
      </PageContainer>
    );
  }

  if (!location) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '1.5rem', color: '#4a5568' }}>Location not found</div>
          <BackButton to="/">← Back to Search</BackButton>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton to="/">
        <ArrowLeft size={20} />
        Back to Search
      </BackButton>

      <LocationCard>
        <LocationHeader>
          <LocationName>{location.name}</LocationName>
          <LocationType>{location.location}</LocationType>
          <Address>
            <MapPin size={20} />
            {location.address}
          </Address>
        </LocationHeader>

        {location.description && (
          <div style={{ marginBottom: '2rem', color: '#4a5568', lineHeight: '1.6' }}>
            {location.description}
          </div>
        )}
      </LocationCard>

      <InfoGrid>
        <InfoSection>
          <SectionTitle>
            <Phone size={20} />
            Contact Information
          </SectionTitle>
          <InfoItem>
            <Phone size={16} />
            {location.phone}
          </InfoItem>
          <InfoItem>
            <Mail size={16} />
            {location.email}
          </InfoItem>
          <InfoItem>
            <Globe size={16} />
            <a href={location.website} target="_blank" rel="noopener noreferrer">
              {location.website}
            </a>
          </InfoItem>
        </InfoSection>

        <InfoSection>
          <SectionTitle>
            <Clock size={20} />
            Hours of Operation
          </SectionTitle>
          <HoursGrid>
            {Object.entries(location.hours).map(([day, hours]) => (
              <HoursDay key={day}>
                <DayName>{day.charAt(0).toUpperCase() + day.slice(1)}</DayName>
                <DayHours>{hours}</DayHours>
              </HoursDay>
            ))}
          </HoursGrid>
        </InfoSection>

        <InfoSection>
          <SectionTitle>Services Offered</SectionTitle>
          <ServicesGrid>
            {location.services.map(service => (
              <ServiceTag key={service}>{service}</ServiceTag>
            ))}
          </ServicesGrid>
        </InfoSection>

        <InfoSection>
          <SectionTitle>
            <Car size={20} />
            Additional Information
          </SectionTitle>
          <InfoItem>
            <strong>Parking:</strong> {location.parking}
          </InfoItem>
          <InfoItem>
            <strong>Accessibility:</strong> {location.accessibility}
          </InfoItem>
        </InfoSection>
      </InfoGrid>
    </PageContainer>
  );
};

export default LocationDetail;
