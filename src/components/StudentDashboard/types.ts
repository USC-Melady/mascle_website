// types.ts
export interface Education {
  institution: string;
  degree: string;
  major: string;
  graduationDate: string;
  gpa: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
}

export interface Project {
  title: string;
  description: string;
  technologies: string;
  url: string;
}

export interface ResumeDetails {
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
}

export interface Application {
  id: string;
  position: string;
  lab: string;
  professor: string;
  applied: string;
  status: string;
  statusBadge: string;
}

export interface Position {
  id: string;
  title: string;
  department: string;
  lab: string;
  professor: string;
  deadline: string;
  description: string;
  requirements: string[];
}

export interface DashboardHeaderProps {
  handleLogout: () => void;
}

export interface WelcomeCardProps {
  username: string | null;
  resumeUploaded: boolean;
  navigate: (path: string) => void;
}

export interface ApplicationsCardProps {
  applications: Application[];
}

export interface PositionsCardProps {
  positions: Position[];
}

export interface ProfileCardProps {
  email: string | null;
  username: string | null;
  resumeUploaded: boolean;
  onResumeClick: () => void;
}

export interface QuickLink {
  icon: string;
  text: string;
  onClick: () => void;
}

export interface QuickLinksCardProps {
  quickLinks: QuickLink[];
}

export interface ResumeModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  resumeFile: File | null;
  resumeUploaded: boolean;
  resumeDetails: ResumeDetails;
  handleResumeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitResumeUpload: () => Promise<void>;
  saveResumeDetails: () => void;
  // Education handlers
  handleEducationChange: (index: number, field: string, value: string) => void;
  addEducation: () => void;
  removeEducation: (index: number) => void;
  // Experience handlers
  handleExperienceChange: (index: number, field: string, value: string) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
  // Skills handlers
  handleSkillChange: (index: number, value: string) => void;
  addSkill: () => void;
  removeSkill: (index: number) => void;
  // Projects handlers
  handleProjectChange: (index: number, field: string, value: string) => void;
  addProject: () => void;
  removeProject: (index: number) => void;
}