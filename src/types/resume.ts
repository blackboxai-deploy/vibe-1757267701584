// TypeScript interfaces for the Smart Resume Reviewer application

export interface ResumeInput {
  content: string;
  filename?: string;
  type: 'pdf' | 'text';
}

export interface JobRole {
  id: string;
  title: string;
  category: string;
  commonSkills: string[];
}

export interface JobDescription {
  role: string;
  content?: string;
}

export interface ResumeSection {
  name: string;
  score: number;
  maxScore: number;
  feedback: string[];
  suggestions: string[];
  strengths: string[];
  issues: string[];
}

export interface ResumeAnalysis {
  overallScore: number;
  maxOverallScore: number;
  summary: string;
  sections: ResumeSection[];
  keyFindings: {
    strengths: string[];
    majorIssues: string[];
    missingSkills: string[];
    atsCompatibility: number;
    improvementPriority: string[];
  };
  jobAlignment: {
    matchScore: number;
    relevantExperience: string[];
    skillGaps: string[];
    recommendations: string[];
  };
}

export interface AnalysisRequest {
  resume: ResumeInput;
  jobRole: string;
  jobDescription?: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: ResumeAnalysis;
  error?: string;
  processingTime?: number;
}

export interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
}

// Predefined job roles with common skills
export const PREDEFINED_JOB_ROLES: JobRole[] = [
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'Technology',
    commonSkills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization', 'TensorFlow', 'Pandas', 'Numpy']
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    category: 'Management',
    commonSkills: ['Product Strategy', 'Agile/Scrum', 'User Research', 'Data Analysis', 'Stakeholder Management', 'Roadmap Planning', 'A/B Testing']
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    category: 'Technology',
    commonSkills: ['Programming', 'JavaScript', 'Python', 'Git', 'APIs', 'Database Design', 'Testing', 'System Design', 'DevOps']
  },
  {
    id: 'ux-designer',
    title: 'UX Designer',
    category: 'Design',
    commonSkills: ['User Research', 'Wireframing', 'Prototyping', 'Figma', 'Adobe Creative Suite', 'Information Architecture', 'Usability Testing']
  },
  {
    id: 'marketing-manager',
    title: 'Marketing Manager',
    category: 'Marketing',
    commonSkills: ['Digital Marketing', 'Content Strategy', 'SEO/SEM', 'Social Media', 'Analytics', 'Campaign Management', 'Brand Management']
  },
  {
    id: 'business-analyst',
    title: 'Business Analyst',
    category: 'Analysis',
    commonSkills: ['Requirements Analysis', 'Process Mapping', 'SQL', 'Data Analysis', 'Stakeholder Communication', 'Project Management', 'Documentation']
  },
  {
    id: 'sales-representative',
    title: 'Sales Representative',
    category: 'Sales',
    commonSkills: ['Lead Generation', 'Customer Relationship Management', 'Negotiation', 'Sales Process', 'CRM Software', 'Communication', 'Cold Calling']
  },
  {
    id: 'project-manager',
    title: 'Project Manager',
    category: 'Management',
    commonSkills: ['Project Planning', 'Risk Management', 'Team Leadership', 'Agile/Scrum', 'Budget Management', 'Stakeholder Communication', 'Timeline Management']
  }
];

export const ANALYSIS_SECTIONS = [
  'Contact Information',
  'Professional Summary',
  'Work Experience', 
  'Education',
  'Skills',
  'Projects',
  'Certifications',
  'Overall Formatting'
] as const;

export type AnalysisSection = typeof ANALYSIS_SECTIONS[number];