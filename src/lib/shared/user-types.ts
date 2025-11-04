export enum UserRole {
  Learner = 'learner',
  Instructor = 'instructor',
  Operator = 'operator',
}

export interface ProfileFormData {
  name: string;
  phoneNumber?: string;
}

export interface OnboardingData {
  role: UserRole;
  name: string;
  phoneNumber?: string;
  termsAgreed: boolean;
}
