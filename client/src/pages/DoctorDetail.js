import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Star, Phone, MapPin, Clock, Calendar, Users, Sparkles } from 'lucide-react';
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

const DoctorCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const DoctorHeader = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
`;

const DoctorInfo = styled.div`
  flex: 1;
`;

const DoctorName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const Specialty = styled.div`
  font-size: 1.25rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  margin-bottom: 1rem;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Status = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 600;
  display: inline-block;
  background: ${props => props.accepting ? '#c6f6d5' : '#fed7d7'};
  color: ${props => props.accepting ? '#22543d' : '#742a2a'};
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

// Schedule components - commented out as they're not currently used
// const ScheduleGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
//   gap: 1rem;
// `;

// const ScheduleDay = styled.div`
//   padding: 0.75rem;
//   background: #f7fafc;
//   border-radius: 0.5rem;
//   text-align: center;
// `;

// const DayName = styled.div`
//   font-weight: 600;
//   color: #2d3748;
//   margin-bottom: 0.25rem;
// `;

// const DayHours = styled.div`
//   font-size: 0.875rem;
//   color: #4a5568;
// `;

const ExplanationCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  color: white;
`;

const ExplanationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ExplanationText = styled.div`
  line-height: 1.6;
  font-size: 1rem;
`;

const DoctorDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('query');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        console.log('Fetching doctor with ID:', id);
        const url = query 
          ? `/api/doctors/${id}?query=${encodeURIComponent(query)}`
          : `/api/doctors/${id}`;
        const response = await axios.get(url);
        console.log('Doctor data received:', response.data);
        setDoctor(response.data);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    }
  }, [id, query]);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '1.5rem', color: '#4a5568' }}>Loading...</div>
        </div>
      </PageContainer>
    );
  }

  if (!doctor) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '1.5rem', color: '#4a5568' }}>Doctor not found</div>
          <BackButton to="/">← Back to Search</BackButton>
        </div>
      </PageContainer>
    );
  }

  // Safely build address from available fields
  const addressParts = [
    doctor?.address,
    doctor?.city,
    doctor?.state,
    doctor?.zip
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ');
  
  return (
    <PageContainer>
      <BackButton to="/">
        <ArrowLeft size={20} />
        Back to Search
      </BackButton>

      {doctor?.matchExplanation && (
        <ExplanationCard>
          <ExplanationHeader>
            <Sparkles size={24} />
            Why This Doctor Matches Your Search
          </ExplanationHeader>
          <ExplanationText>
            {doctor.matchExplanation}
          </ExplanationText>
        </ExplanationCard>
      )}

      <DoctorCard>
        <DoctorHeader>
          <Avatar>
            {doctor?.firstName?.charAt(0) || doctor?.name?.charAt(0) || 'D'}
            {doctor?.lastName?.charAt(0) || ''}
          </Avatar>
          <DoctorInfo>
            <DoctorName>
              {doctor?.name || 'Doctor'} {doctor?.title && `, ${doctor.title}`}
            </DoctorName>
            {doctor?.specialty && (
              <Specialty>
                {doctor.specialty}
                {doctor.secondarySpecialties && doctor.secondarySpecialties.length > 0 && 
                  ` • ${doctor.secondarySpecialties.join(', ')}`}
              </Specialty>
            )}
            {/* Matched Specialties from ServiceProviders */}
            {doctor?.specialties && Array.isArray(doctor.specialties) && doctor.specialties.length > 0 && (
              <div style={{ color: '#667eea', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 500 }}>
                <strong>Service Specialties:</strong> {[...new Set(doctor.specialties)].join(', ')}
              </div>
            )}
            {(doctor?.location || fullAddress) && (
              <Location>
                <MapPin size={20} />
                <div>
                  {doctor?.location && <div><strong>{doctor.location}</strong></div>}
                  {fullAddress && <div>{fullAddress}</div>}
                </div>
              </Location>
            )}
            {/* Rating - Only show if we have real data (not null/undefined) */}
            {(doctor?.rating != null || doctor?.reviews != null) && (
              <Rating>
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
                {doctor?.rating != null && <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>{doctor.rating}</span>}
                {doctor?.reviews != null && <span>({doctor.reviews} patient reviews)</span>}
              </Rating>
            )}
            <Status accepting={doctor?.acceptingPatients}>
              {doctor?.acceptingPatients ? '✓ Accepting New Patients' : '✗ Not Accepting New Patients'}
            </Status>
          </DoctorInfo>
        </DoctorHeader>

        {doctor?.description && (
          <div style={{ marginBottom: '2rem', color: '#4a5568', lineHeight: '1.6' }}>
            {doctor.description}
          </div>
        )}
      </DoctorCard>

      <InfoGrid>
        <InfoSection>
          <SectionTitle>
            <Phone size={20} />
            Contact Information
          </SectionTitle>
          {doctor?.phone && (
            <InfoItem>
              <Phone size={16} />
              {doctor.phone}
            </InfoItem>
          )}
          {doctor?.fax && (
            <InfoItem>
              <strong>Fax:</strong> {doctor.fax}
            </InfoItem>
          )}
          {doctor?.department && (
            <InfoItem>
              <strong>Department:</strong> {doctor.department}
            </InfoItem>
          )}
          {doctor?.language && doctor.language !== '' && (
            <InfoItem>
              <Users size={16} />
              Languages: {doctor.language}
            </InfoItem>
          )}
          {doctor?.gender && (
            <InfoItem>
              <strong>Gender:</strong> {doctor.gender === 'M' ? 'Male' : 'Female'}
            </InfoItem>
          )}
        </InfoSection>

        <InfoSection>
          <SectionTitle>
            <Calendar size={20} />
            Education & Training
          </SectionTitle>
          {doctor?.institution && (
            <InfoItem>
              <strong>Medical School:</strong> {doctor?.education && `${doctor.education}, `}{doctor.institution}
              {doctor?.graduationDate && ` (Graduated ${new Date(doctor.graduationDate).getFullYear()})`}
            </InfoItem>
          )}
          {doctor?.boardCertifications && doctor.boardCertifications.length > 0 && (
            <InfoItem>
              <strong>Board Certified:</strong> {doctor.boardCertifications.join(', ')}
            </InfoItem>
          )}
        </InfoSection>

        <InfoSection>
          <SectionTitle>
            <Clock size={20} />
            Professional Details
          </SectionTitle>
          {doctor?.licenseNumber && (
            <InfoItem>
              <strong>License:</strong> {doctor.licenseNumber}
            </InfoItem>
          )}
          {doctor?.npi && (
            <InfoItem>
              <strong>NPI:</strong> {doctor.npi}
            </InfoItem>
          )}
          {doctor?.staffStatus && (
            <InfoItem>
              <strong>Staff Status:</strong> {doctor.staffStatus}
            </InfoItem>
          )}
          {doctor?.dateOnStaff && (
            <InfoItem>
              <strong>Date on Staff:</strong> {new Date(doctor.dateOnStaff).toLocaleDateString()}
            </InfoItem>
          )}
        </InfoSection>
      </InfoGrid>
    </PageContainer>
  );
};

export default DoctorDetail;
