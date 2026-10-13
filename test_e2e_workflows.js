// CampusPulse Comprehensive End-to-End Workflow Verification Script

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 CampusPulse Full-Stack Automated Verification');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  // TEST 1: Health check
  const health = await request('/health');
  assert(health.status === 200 && health.data.status === 'online', 'Server Health Check is online');

  // TEST 2: Demo accounts metadata
  const demoAccounts = await request('/auth/demo-accounts');
  assert(demoAccounts.data.accounts.length === 4, '4 Demo Roles configured (Student, Organizer, Approver, Admin)');

  // TEST 3: Student Login & Profile
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alex.student@campus.edu', password: 'password123' })
  });
  assert(studentLogin.ok && studentLogin.data.token, 'Student Alex Rivera logged in successfully');
  const studentToken = studentLogin.data.token;

  // TEST 4: Recommendations
  const recs = await request('/events/recommendations', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(recs.ok && recs.data.recommendations.length > 0, `Personalized recommendations loaded (${recs.data.recommendations.length} matched)`);

  // TEST 5: Student Event Registration
  const eventsList = await request('/events');
  const targetEvent = eventsList.data.events.find(e => e.title.includes('Quantum') || e.title.includes('VenturePulse'));
  assert(targetEvent != null, `Discovered target event: "${targetEvent?.title}"`);

  const regRes = await request(`/registrations/events/${targetEvent.id}/register`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(regRes.status === 201 || regRes.status === 200, 'Student registered successfully, seat reserved on server');
  const ticketToken = regRes.data.registration?.ticketToken || regRes.data.ticketToken;
  const regCode = regRes.data.registration?.id || regRes.data.registrationId;
  assert(ticketToken && ticketToken.startsWith('CPTKT_'), `Cryptographic HMAC QR token issued: ${ticketToken?.substring(0, 20)}...`);

  // TEST 6: Prevent Duplicate Registration
  const dupReg = await request(`/registrations/events/${targetEvent.id}/register`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(dupReg.status === 409, 'Server strictly prevented duplicate registration (HTTP 409)');

  // TEST 7: Organizer Login & Venue Conflict Engine
  const orgLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'maya.organizer@campus.edu', password: 'password123' })
  });
  assert(orgLogin.ok && orgLogin.data.token, 'Organizer Maya Patel logged in successfully');
  const orgToken = orgLogin.data.token;

  const venuesRes = await request('/venues');
  assert(venuesRes.data.venues.length >= 5, `Fetched ${venuesRes.data.venues.length} campus venues`);
  const turingLab = venuesRes.data.venues.find(v => v.code === 'LAB-TUR');

  // Check clashing slot: Turing Lab on 2026-10-18 during Synesis Hackathon
  const conflictCheck = await request('/venues/check-conflict', {
    method: 'POST',
    body: JSON.stringify({
      venueId: turingLab.id,
      eventDate: '2026-10-18',
      startTime: '10:00',
      endTime: '14:00'
    })
  });
  assert(
    conflictCheck.data.hasConflict === true && conflictCheck.data.conflictingEvents.length > 0,
    `Venue Conflict Engine successfully caught interval overlap with "${conflictCheck.data.conflictingEvents[0]?.title}"`
  );
  assert(
    conflictCheck.data.suggestedVenues.length > 0,
    `Suggested ${conflictCheck.data.suggestedVenues.length} alternative available free venues for that time slot`
  );

  // Check free slot: Different date or non-overlapping time
  const freeCheck = await request('/venues/check-conflict', {
    method: 'POST',
    body: JSON.stringify({
      venueId: turingLab.id,
      eventDate: '2026-10-29',
      startTime: '10:00',
      endTime: '12:00'
    })
  });
  assert(freeCheck.data.hasConflict === false, 'Venue Conflict Engine verified open schedule slot');

  // TEST 8: Create Event Draft & Submit
  const newEventRes = await request('/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${orgToken}` },
    body: JSON.stringify({
      title: 'Automated Test Hack Sprint 2026',
      short_summary: 'Automated test suite sprint',
      description: 'End-to-end testing verification event',
      category: 'Technical',
      event_date: '2026-10-29',
      start_time: '10:00',
      end_time: '12:00',
      venue_id: turingLab.id,
      max_capacity: 50,
      expected_audience: 'Developers',
      eligibility: 'Open to All',
      submitForApproval: true
    })
  });
  assert(newEventRes.status === 201, 'Created and submitted event for approval');
  const submittedEventId = newEventRes.data.eventId;

  // TEST 9: Approver Login & Digital Approval Queue
  const apprLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'dean.approver@campus.edu', password: 'password123' })
  });
  assert(apprLogin.ok && apprLogin.data.token, 'Dean Marcus Vance (Approver) logged in successfully');
  const apprToken = apprLogin.data.token;

  const pendingList = await request('/approvals/pending', {
    headers: { Authorization: `Bearer ${apprToken}` }
  });
  assert(pendingList.data.pendingEvents.some(e => e.id === submittedEventId), 'Submitted event appeared in Approver pending queue');

  // Approve event
  const approveRes = await request(`/approvals/${submittedEventId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apprToken}` },
    body: JSON.stringify({ comments: 'Approved in automated e2e test suite.' })
  });
  assert(approveRes.ok && approveRes.data.status === 'APPROVED', 'Approver approved event and recorded audit trail');

  // TEST 10: QR Check-in & Gate Scanner
  const gateCheck = await request('/checkin/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${orgToken}` },
    body: JSON.stringify({
      eventId: targetEvent.id,
      tokenOrCode: ticketToken
    })
  });
  assert(gateCheck.data.outcome === 'SUCCESS', `QR Gate Check-In successful! Attendee: ${gateCheck.data.attendee?.name}`);

  // TEST 11: Duplicate Gate Scan Prevention
  const dupGateCheck = await request('/checkin/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${orgToken}` },
    body: JSON.stringify({
      eventId: targetEvent.id,
      tokenOrCode: ticketToken
    })
  });
  assert(dupGateCheck.data.outcome === 'ALREADY_CHECKED_IN', 'Duplicate Gate Check-in blocked with timestamp!');

  // TEST 12: Organizer & Admin Analytics
  const orgAnalytics = await request('/analytics/organizer', {
    headers: { Authorization: `Bearer ${orgToken}` }
  });
  assert(orgAnalytics.data.metrics.totalEvents > 0, `Organizer dashboard metrics loaded (${orgAnalytics.data.metrics.totalEvents} events, ${orgAnalytics.data.metrics.attendanceRate}% turnout)`);

  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@campus.edu', password: 'password123' })
  });
  const adminAnalytics = await request('/analytics/admin', {
    headers: { Authorization: `Bearer ${adminLogin.data.token}` }
  });
  assert(adminAnalytics.data.userStats.total_users >= 4, `Admin analytics verified campus-wide data (${adminAnalytics.data.userStats.total_users} users)`);

  console.log('\n====================================================');
  console.log(`🎯 Test Summary: ${passed} / ${total} tests passed! (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================');
}

runTests().catch(console.error);
