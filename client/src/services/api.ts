const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('campuspulse_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data;
  },

  async register(payload: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
    return data;
  },

  async updateInterests(interests: string[]) {
    const res = await fetch(`${API_BASE}/auth/interests`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ interests })
    });
    return res.json();
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return res.json();
  },

  // Events
  async getEvents(params?: { search?: string; category?: string; dateFilter?: string; venueId?: string; sortBy?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.dateFilter) query.set('dateFilter', params.dateFilter);
    if (params?.venueId) query.set('venueId', params.venueId);
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const res = await fetch(`${API_BASE}/events?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
    return data;
  },

  async getRecommendations() {
    const res = await fetch(`${API_BASE}/events/recommendations`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch recommendations');
    return data;
  },

  async getEventById(id: string) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch event');
    return data;
  },

  async createEvent(eventData: any) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create event');
    return data;
  },

  async updateEvent(id: string, eventData: any) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update event');
    return data;
  },

  async submitEventForApproval(id: string) {
    const res = await fetch(`${API_BASE}/events/${id}/submit`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit event');
    return data;
  },

  // Venues
  async getVenues() {
    const res = await fetch(`${API_BASE}/venues`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch venues');
    return data;
  },

  async checkVenueConflict(params: { venueId: string; eventDate: string; startTime: string; endTime: string; excludeEventId?: string }) {
    const res = await fetch(`${API_BASE}/venues/check-conflict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to check venue conflict');
    return data;
  },

  // Registrations
  async registerForEvent(eventId: string) {
    const res = await fetch(`${API_BASE}/registrations/events/${eventId}/register`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    return data;
  },

  async getMyRegistrations(statusFilter?: string) {
    const query = statusFilter ? `?statusFilter=${statusFilter}` : '';
    const res = await fetch(`${API_BASE}/registrations/my${query}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch registrations');
    return data;
  },

  async cancelRegistration(registrationId: string) {
    const res = await fetch(`${API_BASE}/registrations/${registrationId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel registration');
    return data;
  },

  async getTicket(registrationId: string) {
    const res = await fetch(`${API_BASE}/registrations/${registrationId}/ticket`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch ticket');
    return data;
  },

  // Approvals
  async getPendingApprovals() {
    const res = await fetch(`${API_BASE}/approvals/pending`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch pending approvals');
    return data;
  },

  async getApprovalHistory() {
    const res = await fetch(`${API_BASE}/approvals/history`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch approval history');
    return data;
  },

  async approveEvent(eventId: string, comments?: string) {
    const res = await fetch(`${API_BASE}/approvals/${eventId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ comments })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve event');
    return data;
  },

  async rejectEvent(eventId: string, reason: string, comments?: string) {
    const res = await fetch(`${API_BASE}/approvals/${eventId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason, comments })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject event');
    return data;
  },

  // Check-In
  async getCheckinEvents() {
    const res = await fetch(`${API_BASE}/checkin/events`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
    return data;
  },

  async getEventAttendees(eventId: string) {
    const res = await fetch(`${API_BASE}/checkin/events/${eventId}/attendees`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch attendees');
    return data;
  },

  async verifyCheckin(eventId: string, tokenOrCode: string) {
    const res = await fetch(`${API_BASE}/checkin/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ eventId, tokenOrCode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Check-in validation failed');
    return data;
  },

  // AI & Flyers
  async getAIStatus() {
    const res = await fetch(`${API_BASE}/ai/status`);
    return res.json();
  },

  async uploadFlyer(file: File) {
    const token = localStorage.getItem('campuspulse_token');
    const formData = new FormData();
    formData.append('flyer', file);

    const res = await fetch(`${API_BASE}/ai/extract-flyer`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload/extract flyer');
    return data;
  },

  // Analytics
  async getOrganizerAnalytics(viewAll: boolean = false) {
    const res = await fetch(`${API_BASE}/analytics/organizer?viewAll=${viewAll}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch organizer analytics');
    return data;
  },

  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/admin`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin analytics');
    return data;
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/analytics/notifications`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/analytics/notifications/${id}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
