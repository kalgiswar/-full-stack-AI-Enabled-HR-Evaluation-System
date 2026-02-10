// ============================================
// 📚 TYPE DEFINITIONS FOR PRISMA MODELS
// ============================================
// These types match your Prisma schema
// They provide type safety across your application
//
// LEARNING: Prisma Client generates these automatically!
// But we're defining them here for:
// 1. Frontend/backend shared types
// 2. Custom extensions
// 3. Legacy compatibility
// ============================================

import { Prisma } from "@prisma/client";

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Type for sign up parameters
export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  uid?: string; // Legacy support
}

// Type for sign in parameters
export interface SignInParams {
  email: string;
  password: string;
  idToken?: string; // Legacy support
}

// ============================================
// INTERVIEW TYPES
// ============================================

export interface Interview {
  id: string;
  userId: string;
  role?: string | null;
  transcript?: any; // JSON
  duration?: number | null;
  finalized: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Relations (when included)
  user?: User;
  feedback?: Feedback;
}

// ============================================
// FEEDBACK TYPES
// ============================================

export interface Feedback {
  id: string;
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: any; // JSON - CategoryScores type
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: Date | string;
  // Relations
  interview?: Interview;
}

export interface CategoryScores {
  communicationSkills: number;
  technicalKnowledge: number;
  problemSolving: number;
  culturalFit: number;
  confidenceClarity: number;
}

// Parameters for creating feedback
export interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: Array<{ role: string; content: string }>;
  feedbackId?: string;
}

// Parameters for getting feedback
export interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

// Parameters for getting latest interviews
export interface GetLatestInterviewsParams {
  userId?: string;
  limit?: number;
}

// ============================================
// JOB TYPES
// ============================================

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  criteria: string;
  status: string;
  applicantsCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Relations
  resumeAnalyses?: ResumeAnalysis[];
}

// ============================================
// RESUME ANALYSIS TYPES
// ============================================

export interface ResumeAnalysis {
  id: string;
  userId?: string | null;
  jobId?: string | null;
  candidateName: string;
  fileName: string;
  matchScore: number;
  category: string; // "High Match" | "Potential" | "Reject"
  reasoning: string;
  skillsFound: string[];
  missingSkills: string[];
  experienceSummary: string;
  jobDescription: string;
  createdAt: Date | string;
  // Relations
  user?: User;
  job?: Job;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string; // "success" | "rejection" | "info"
  analysisId?: string | null;
  read: boolean;
  createdAt: Date | string;
  // Relations
  user?: User;
}

// ============================================
// ASSESSMENT RESULT TYPES
// ============================================

export interface AssessmentResult {
  id: string;
  userId: string;
  assessmentId: string;
  technicalCode: string;
  psychometricScores: any; // JSON - PsychometricScores type
  mcqAnswers: any; // JSON - Record<string, string>
  textResponse: string;
  violations: string[];
  createdAt: Date | string;
  // Relations
  user?: User;
}

export interface PsychometricScores {
  resilience: number;
  leadership: number;
  teamwork: number;
}

// ============================================
// UTILITY TYPES
// ============================================

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

// User with stats (extended)
export interface UserWithStats extends User {
  interviewCount?: number;
  averageScore?: number;
  applicationCount?: number;
}

// Interview with full details
export interface InterviewWithDetails extends Interview {
  user: User;
  feedback: Feedback;
}

// Job with applicants
export interface JobWithApplicants extends Job {
  resumeAnalyses: Array<ResumeAnalysis & { user?: User }>;
  _count?: {
    resumeAnalyses: number;
  };
}

// ============================================
// PRISMA-GENERATED TYPE HELPERS
// ============================================
// These leverage Prisma's generated types for maximum type safety

// User with selected relations
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    interviews: true;
    notifications: true;
  };
}>;

// Interview with selected relations
export type InterviewWithRelations = Prisma.InterviewGetPayload<{
  include: {
    user: true;
    feedback: true;
  };
}>;

// Job with count
export type JobWithCount = Prisma.JobGetPayload<{
  include: {
    _count: {
      select: {
        resumeAnalyses: true;
      };
    };
  };
}>;

// ============================================
// LEARNING: Why separate types?
// ============================================
// 
// 1. COMPATIBILITY:
//    - Frontend and backend can share these types
//    - Works with or without Prisma import
//
// 2. CUSTOMIZATION:
//    - Add computed fields
//    - Extend with UI-specific properties
//    - Maintain backwards compatibility
//
// 3. DOCUMENTATION:
//    - Self-documenting code
//    - IntelliSense/autocomplete everywhere
//    - Catch errors at compile-time
//
// 4. FLEXIBILITY:
//    - Easy to mock for testing
//    - Works with other ORMs if needed
//    - Version control for API contracts
//
// ============================================
