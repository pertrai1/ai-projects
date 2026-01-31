export type ApplicationStatus = 'applied' | 'phone_screen' | 'onsite' | 'offer' | 'rejected';

export interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  status: ApplicationStatus;
  date_applied: string;
  notes: string | null;
  next_steps: string | null;
  next_steps_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationContact {
  id: string;
  application_id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export const STAGE_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  applied: { label: 'Applied', color: 'stage-badge-applied' },
  phone_screen: { label: 'Phone Screen', color: 'stage-badge-phone-screen' },
  onsite: { label: 'Onsite', color: 'stage-badge-onsite' },
  offer: { label: 'Offer', color: 'stage-badge-offer' },
  rejected: { label: 'Rejected', color: 'stage-badge-rejected' },
};

export const STAGE_ORDER: ApplicationStatus[] = ['applied', 'phone_screen', 'onsite', 'offer', 'rejected'];
