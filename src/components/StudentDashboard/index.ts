// index.ts
export { default as StudentDashboard } from './components/StudentDashboard';
export { default as DashboardHeader } from './components/DashboardHeader';
export { default as WelcomeCard } from './components/WelcomeCard';
export { default as ApplicationsCard } from './components/ApplicationsCard';
export { default as PositionsCard } from './components/PositionsCard';
export { default as ProfileCard } from './components/ProfileCard';
export { default as QuickLinksCard } from './components/QuickLinksCard';

// Also export types for easier access
export * from './types';

// Add default export for backward compatibility with existing imports
import DefaultStudentDashboard from './components/StudentDashboard';
export default DefaultStudentDashboard;