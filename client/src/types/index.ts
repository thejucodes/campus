export type UserRole = 'student' | 'organizer' | 'approver' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  organization?: string;
  interests?: string[];
  avatar?: string;
}

export type EventCategory = 
  | 'Technical' 
  | 'Hackathons' 
  | 'Workshops' 
  | 'Cultural' 
  | 'Sports' 
  | 'Entrepreneurship' 
  | 'Art and Design' 
  | 'Clubs and Communities';

export type EventStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'COMPLETED';

export interface Venue {
  id: string;
  name: string;
  code: string;
  capacity: number;
  location_details: string;
  equipment: string;
  is_active: number;
}

export interface CampusEvent {
  id: string;
  title: string;
  short_summary: string;
  description: string;
  category: EventCategory;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_id: string;
  venue_name: string;
  expected_audience: string;
  max_capacity: number;
  registered_count?: number;
  checked_in_count?: number;
  remaining_seats?: number;
  is_full?: boolean;
  registration_deadline: string;
  eligibility: string;
  organizer_id: string;
  organizer_name: string;
  organizer_club: string;
  cover_image: string;
  flyer_path?: string;
  additional_info?: string;
  status: EventStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  user_registration?: {
    registration_id: string;
    ticket_token?: string;
    status: 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED';
    registered_at?: string;
    checked_in_at?: string;
  } | null;
  venue?: Venue;
  venueConflict?: ConflictResult;
  recommendation_type?: 'interest-matched' | 'trending';
  recommendation_reason?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingEvents: Array<{
    id: string;
    title: string;
    organizerClub: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  suggestedSlots: Array<{ startTime: string; endTime: string; label: string }>;
  suggestedVenues: Array<{ id: string; name: string; capacity: number; location: string }>;
}

export interface Registration {
  registration_id: string;
  ticket_token: string;
  registration_status: 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED';
  registered_at: string;
  checked_in_at?: string;
  event_id: string;
  event_title: string;
  short_summary: string;
  category: EventCategory;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  organizer_club: string;
  cover_image: string;
  event_status: EventStatus;
}

export interface TicketDetail {
  registration_id: string;
  ticket_token: string;
  ticket_status: 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED';
  registered_at: string;
  checked_in_at?: string;
  student_name: string;
  student_email: string;
  student_department: string;
  event_id: string;
  event_title: string;
  category: EventCategory;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  organizer_club: string;
}

export interface ApprovalHistoryItem {
  id: string;
  event_id: string;
  event_title: string;
  category: EventCategory;
  event_date: string;
  venue_name: string;
  organizer_club: string;
  approver_id: string;
  approver_name: string;
  previous_status: string;
  new_status: string;
  action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  comments: string;
  action_timestamp: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}
