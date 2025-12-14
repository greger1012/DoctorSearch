import React from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchPage from './pages/SearchPage';
import DoctorDetail from './pages/DoctorDetail';
import LocationDetail from './pages/LocationDetail';
import GlobalStyles from './styles/GlobalStyles';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
`;

function App() {
  return (
    <Router>
      <GlobalStyles />
      <AppContainer>
        <Header />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/doctor/:id" element={<DoctorDetail />} />
          <Route path="/location/:id" element={<LocationDetail />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;
