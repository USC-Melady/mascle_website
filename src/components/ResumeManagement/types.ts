// types.ts
export interface Education {
  institution: string;
  degree: string;
  major: string;
  graduationStartMonth: string;
  graduationStartYear: string;
  graduationEndMonth: string;
  graduationEndYear: string;
  gpa: number | string; // keeping flexible for input handling
  yearsOfExperience: number | string; // YoE as integer
  seniority: string; // fresh, soph, junior, senior, masters year 1, masters year 2
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

export interface PersonalLinks {
  linkedin: string;
  website: string;
  github: string;
}

export interface ResumeDetails {
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
  personalLinks: PersonalLinks;
}

export interface ProfileSummaryProps {
  resumeUploaded: boolean;
  resumeDetails: ResumeDetails;
  saveResumeDetails: () => void;
  isMobile?: boolean;
  saving?: boolean;
}

export interface ResumeUploadProps {
  resumeFile: File | null;
  resumeFileName: string | null;
  resumeUploaded: boolean;
  handleResumeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitResumeUpload: () => void;
}

export interface EducationSectionProps {
  education: Education[];
  handleEducationChange: (index: number, field: string, value: string) => void;
  addEducation: () => void;
  removeEducation: (index: number) => void;
}

export interface ExperienceSectionProps {
  experience: Experience[];
  handleExperienceChange: (index: number, field: string, value: string | boolean) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
}

export interface SkillsSectionProps {
  skills: string[];
  handleSkillChange: (index: number, value: string) => void;
  addSkill: () => void;
  removeSkill: (index: number) => void;
}

export interface ProjectsSectionProps {
  projects: Project[];
  handleProjectChange: (index: number, field: string, value: string) => void;
  addProject: () => void;
  removeProject: (index: number) => void;
}

export interface PersonalLinksSectionProps {
  personalLinks: PersonalLinks;
  handlePersonalLinksChange: (field: string, value: string) => void;
}

export interface PageHeaderProps {
  saveResumeDetails: () => void;
  saving?: boolean;
}