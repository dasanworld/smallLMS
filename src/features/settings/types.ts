export type UserRole = 'learner' | 'instructor' | 'operator';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber: string | null;
  role: UserRole;
  createdAt: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  assignmentReminders: boolean;
  gradeNotifications: boolean;
  courseUpdates: boolean;
  pushNotifications: boolean;
}

export interface UpdateProfileRequest {
  name: string;
  phoneNumber?: string;
}
