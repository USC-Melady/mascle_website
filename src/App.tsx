import styled from '@emotion/styled';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import MainContent from './components/MainContent';
import AboutPage from './components/AboutPage';
import PeoplePage from './components/PeoplePage';
import FacultyPage from './components/FacultyPage';
import StudentsPage from './components/StudentsPage';
import Login from './components/Login';
import SubscriptionForm from './components/SubscriptionForm';
import Footer from './components/Footer';
import StudentDashboard from './components/StudentDashboard/index';
import ProfessorDashboard from './components/ProfessorDashboard';
import LabAssistantDashboard from './components/LabAssistantDashboard';
import AdminDashboard from './components/AdminDashboard';
import LabMembersPage from './components/LabManagement/LabMembersPage';
import JobManagementPage from './components/JobManagement/JobManagementPage';
import JobApplicationsPage from './components/JobManagement/JobApplicationsPage';
import StandaloneJobApplicationsPage from './pages/JobApplicationsPage';
import ResumeManagement from './components/ResumeManagement/index';
import PublicJobsPage from './pages/PublicJobsPage';
import EducationPage from './pages/EducationPage';
import HonorsPage from './components/HonorsPage';
import SponsorsPage from './pages/SponsorsPage';
import EventsPage from './pages/EventsPage';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRedirect from './components/DashboardRedirect';
import LabsPage from './components/LabsPage';
import ApplyPage from './components/ApplyPage';
import ResearchOverviewPage from './pages/ResearchOverviewPage';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;

  @media (max-width: 991px) {
    padding: 1rem;
  }
`;

const DashboardWrapper = styled.div`
  width: 100%;
  padding: 0 2rem;
  flex: 1;
`;

function App() {
  return (
    <Router basename="/mascle_website/">
      <AppContainer>
        <Header />
        <Routes>
          {/* Dashboard routes - protected */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute requiredRoles={['Student']}>
              <DashboardWrapper><StudentDashboard /></DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/student-dashboard/resume" element={
            <ProtectedRoute requiredRoles={['Student']}>
              <DashboardWrapper><ResumeManagement /></DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/professor-dashboard" element={
            <ProtectedRoute requiredRoles={['Professor']}>
              <DashboardWrapper><ProfessorDashboard /></DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/professor-dashboard/job/:jobId" element={
            <ProtectedRoute requiredRoles={['Professor']}>
              <DashboardWrapper><ProfessorDashboard /></DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/lab-assistant-dashboard" element={
            <ProtectedRoute requiredRoles={['LabAssistant']}>
              <DashboardWrapper><LabAssistantDashboard /></DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <DashboardWrapper><AdminDashboard /></DashboardWrapper>
            </ProtectedRoute>
          } />
          
          {/* Profile route - requires authentication */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Lab management routes - requires appropriate permissions */}
          <Route path="/lab/:labId/members" element={
            <ProtectedRoute requiredRoles={['Admin', 'Professor', 'LabAssistant']}>
              <DashboardWrapper><LabMembersPage /></DashboardWrapper>
            </ProtectedRoute>
          } />
          
          {/* Job management routes - requires appropriate permissions */}
          <Route path="/jobs/manage" element={
            <ProtectedRoute requiredRoles={['Admin', 'Professor', 'LabAssistant']}>
              <DashboardWrapper><JobManagementPage /></DashboardWrapper>
            </ProtectedRoute>
          } />
          <Route path="/applications/review" element={
            <ProtectedRoute requiredRoles={['Admin', 'Professor', 'LabAssistant']}>
              <DashboardWrapper><JobApplicationsPage /></DashboardWrapper>
            </ProtectedRoute>
          } />
          
          {/* Enhanced Job Applications route - dedicated page */}
          <Route path="/job-applications/:jobId" element={
            <ProtectedRoute requiredRoles={['Admin', 'Professor', 'LabAssistant']}>
              <StandaloneJobApplicationsPage />
            </ProtectedRoute>
          } />
          
          {/* Public jobs page - doesn't require authentication, full width */}
          <Route path="/jobs/public" element={<PublicJobsPage />} />
          
          {/* Education page - public access */}
          <Route path="/education" element={<EducationPage />} />
          
          {/* Honors page - public access */}
          <Route path="/honors" element={<HonorsPage />} />
          
          {/* Sponsors page - public access */}
          <Route path="/sponsors" element={<SponsorsPage />} />
          
          {/* Events page - public access */}
          <Route path="/events" element={<EventsPage />} />
          
          {/* Homepage with automatic role-based redirection */}
          <Route path="/" element={<DashboardRedirect />} />

          {/* About page */}
          <Route path="/about" element={<AboutPage />} />
          
          {/* Regular content with ContentWrapper */}
          <Route path="/people" element={<ContentWrapper><PeoplePage /></ContentWrapper>} />
          <Route path="/faculty" element={<ContentWrapper><FacultyPage /></ContentWrapper>} />
          <Route path="/students" element={<ContentWrapper><StudentsPage /></ContentWrapper>} />
          <Route path="/login" element={<ContentWrapper><Login /></ContentWrapper>} />
          <Route path="/labs" element={<ContentWrapper><LabsPage /></ContentWrapper>} />
          <Route path="/sponsors" element={<ContentWrapper><SponsorsPage /></ContentWrapper>} />
          <Route path="/events" element={<ContentWrapper><EventsPage /></ContentWrapper>} />

          {/* Apply page - only for logged out users */}
          <Route path="/apply" element={<ContentWrapper><ApplyPage /></ContentWrapper>} />
          {/* Research Overview (blank placeholder) */}
          <Route path="/research-overview" element={<ContentWrapper><ResearchOverviewPage /></ContentWrapper>} />

          {/* Redirect from old resume path to new one */}
          <Route path="/resume" element={<Navigate to="/student-dashboard/resume" replace />} />
        </Routes>
        <Footer />
      </AppContainer>
    </Router>
  );
}

export default App;
