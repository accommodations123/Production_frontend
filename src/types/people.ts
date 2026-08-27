/* =====================================================================
   People / Professional Directory TypeScript Contracts
   ===================================================================== */

export interface ProfessionalVerification {
  identity: boolean;
  documents: boolean;
  linkedin: boolean;
}

export interface ProfessionalSocialLinks {
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface ProfessionalExperienceItem {
  id?: string;
  experienceId?: string;
  professionalId: string;
  jobTitle: string;
  companyName: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface ProfessionalEducationItem {
  id?: string;
  educationId?: string;
  professionalId: string;
  institutionName: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
}

export interface ProfessionalCertificationItem {
  id?: string;
  certificationId?: string;
  professionalId: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  credentialId?: string;
  verified?: boolean;
}

export interface ProfessionalCourseItem {
  id?: string;
  courseId?: string;
  professionalId: string;
  courseName: string;
  provider: string;
  completionDate?: string;
}

export interface ProfessionalSkillItem {
  id?: string;
  skillId?: string;
  professionalId: string;
  name: string;
  proficiency?: string;
  yearsOfExperience?: number;
}

export interface ProfessionalLanguageItem {
  id?: string;
  languageId?: string;
  professionalId: string;
  language: string;
  proficiency?: string;
}

export interface ProfessionalServiceItem {
  id?: string;
  serviceId?: string;
  professionalId: string;
  serviceName: string;
  category: string;
  description?: string;
  pricingType?: "hourly" | "fixed" | "starting_at" | "custom";
  price?: number;
  currency?: string;
  deliveryMode?: string;
}

export interface ProfessionalPortfolioItem {
  id?: string;
  portfolioId?: string;
  professionalId: string;
  title: string;
  description?: string;
  type?: "image" | "video" | "pdf" | "url" | "case_study";
  projectUrl?: string;
  thumbnailKey?: string;
}

export interface ProfessionalResumeItem {
  id?: string;
  resumeId?: string;
  professionalId: string;
  fileName: string;
  fileKey: string;
  fileUrl?: string;
  visibility?: "public" | "private" | "connections_only";
  uploadedAt?: string;
}

export interface ProfessionalReviewItem {
  id?: string;
  reviewId?: string;
  expert_id: string;
  reviewer_id: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

export interface ProfessionalProfile {
  professionalId: string;
  id: string;
  ownerUserId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  name: string;
  profilePhoto?: string;
  coverPhoto?: string;
  headline?: string;
  professionalTitle?: string;
  profession?: string;
  category?: string;
  about?: string;
  yearsOfExperience?: number;
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  skills: string[] | ProfessionalSkillItem[];
  languages: any[];
  verification: ProfessionalVerification;
  socialLinks: ProfessionalSocialLinks;
  profileVisibility: "public" | "private" | "connections_only";
  searchable: boolean;
  offersServices: boolean;
  availabilityStatus?: string;
  profileCompletion: number;
  followersCount: number;
  reviewCount: number;
  averageRating: number;
  status: string;
  profileType?: string;
  roles?: string[];
}

export interface PeopleSearchParams {
  search?: string;
  category?: string;
  profession?: string;
  country?: string;
  city?: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  offersServices?: boolean;
  verified?: boolean;
  availability?: string;
  experienceMin?: number;
  experienceMax?: number;
  minRating?: number;
  cursor?: string;
  limit?: number;
}

export interface PeopleSearchResponse {
  success: boolean;
  data: {
    items: ProfessionalProfile[];
    nextCursor: string | null;
    hasMore: boolean;
  };
}
