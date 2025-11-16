// index.ts
export { default as ResumeManagement } from './components/ResumeManagement';
export { default as PageHeader } from './components/PageHeader';
export { default as ProfileSummary } from './components/ProfileSummary';
export { default as ResumeUpload } from './components/ResumeUpload';
export { default as EducationSection } from './components/EducationSection';
export { default as ExperienceSection } from './components/ExperienceSection';
export { default as SkillsSection } from './components/SkillsSection';
export { default as ProjectsSection } from './components/ProjectsSection';
export { default as PersonalLinksSection } from './components/PersonalLinksSection';
export { default as CustomDropdown } from './components/CustomDropdown';

// Also export types for easier access
export * from './types';

// Add default export for backward compatibility with existing imports
import DefaultResumeManagement from './components/ResumeManagement';
export default DefaultResumeManagement;