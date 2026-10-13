import bcrypt from 'bcryptjs';
import { db, initDatabase } from './database.js';
import { generateRegistrationCode, generateTicketToken } from '../utils/qrToken.js';

export function runSeed() {
  initDatabase();

  console.log('[Seed] Cleaning existing data...');
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM approvals_history;
    DELETE FROM registrations;
    DELETE FROM events;
    DELETE FROM venues;
    DELETE FROM users;
  `);

  console.log('[Seed] Inserting users...');
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, department, organization, interests, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const student1Id = 'usr_student_alex';
  const student2Id = 'usr_student_sam';
  const student3Id = 'usr_student_priya';
  const organizer1Id = 'usr_organizer_maya';
  const organizer2Id = 'usr_organizer_leo';
  const approver1Id = 'usr_approver_dean';
  const admin1Id = 'usr_admin_system';

  insertUser.run(
    student1Id,
    'alex.student@campus.edu',
    passwordHash,
    'Alex Rivera',
    'student',
    'Computer Science & Engineering',
    'Student Council Representative',
    JSON.stringify(['Technical', 'Hackathons', 'Workshops']),
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );

  insertUser.run(
    student2Id,
    'sam.lee@campus.edu',
    passwordHash,
    'Samantha Lee',
    'student',
    'Design & Media Arts',
    'Design Guild',
    JSON.stringify(['Art and Design', 'Cultural', 'Workshops']),
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
  );

  insertUser.run(
    student3Id,
    'priya.nair@campus.edu',
    passwordHash,
    'Priya Nair',
    'student',
    'Management & Entrepreneurship',
    'E-Cell Lead',
    JSON.stringify(['Entrepreneurship', 'Technical', 'Hackathons']),
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  );

  insertUser.run(
    organizer1Id,
    'maya.organizer@campus.edu',
    passwordHash,
    'Maya Patel',
    'organizer',
    'School of Computing',
    'Google Developer Student Club & ACM Chapter',
    JSON.stringify(['Technical', 'Hackathons', 'Workshops']),
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  );

  insertUser.run(
    organizer2Id,
    'leo.sports@campus.edu',
    passwordHash,
    'Leo Fernandes',
    'organizer',
    'Department of Physical Education',
    'Campus Sports & Esports Council',
    JSON.stringify(['Sports', 'Clubs and Communities']),
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  );

  insertUser.run(
    approver1Id,
    'dean.approver@campus.edu',
    passwordHash,
    'Dean Marcus Vance',
    'approver',
    'Office of Student Affairs',
    'Campus Event Oversight Board',
    JSON.stringify([]),
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
  );

  insertUser.run(
    admin1Id,
    'admin@campus.edu',
    passwordHash,
    'Campus Admin',
    'admin',
    'University Administration',
    'Campus Operations and Systems',
    JSON.stringify([]),
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
  );

  console.log('[Seed] Inserting venues...');
  const insertVenue = db.prepare(`
    INSERT INTO venues (id, name, code, capacity, location_details, equipment)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const v1 = 'ven_auditorium_raman';
  const v2 = 'ven_techhub_turing';
  const v3 = 'ven_quad_amphitheatre';
  const v4 = 'ven_multihall_sarabhai';
  const v5 = 'ven_sports_arena';

  insertVenue.run(
    v1,
    'Sir C.V. Raman Grand Auditorium',
    'AUD-MAIN',
    450,
    'Central Block, 2nd Floor, West Wing',
    'Dual 4K Laser Projection, 7.2 Digital Surround, Stage Rigging, Podium Mic & Wireless Lapels'
  );

  insertVenue.run(
    v2,
    'Turing Innovation Hub & AI Lab',
    'LAB-TUR',
    120,
    'Computing Block B, Room 304',
    'Gigabit Fiber LAN, Dual 4K Displays, 60 GPU Developer Workstations, Audio Soundbar'
  );

  insertVenue.run(
    v3,
    'Emerald Quad Amphitheatre',
    'QUAD-AMPHI',
    300,
    'North Campus Gardens, Adjacent to Student Union',
    'Acoustic Reflector Shell, Tiered Grass Seating, Outdoor Stage Spotlights, Weatherproof PA System'
  );

  insertVenue.run(
    v4,
    'Vikram Sarabhai Multi-Purpose Hall',
    'HALL-SAR',
    180,
    'Innovation Complex, Ground Floor',
    'Modular Staging, Folding Conference Tables, Ceiling Acoustic Panels, Twin Smart Boards'
  );

  insertVenue.run(
    v5,
    'Campus Indoor Sports Complex Arena',
    'ARENA-SP',
    600,
    'Sports Pavilion, East Gate',
    'Maple Wood Hardwood Court, Digital Scoreboard, Floodlights, Stadium Sound System'
  );

  console.log('[Seed] Inserting events...');
  const insertEvent = db.prepare(`
    INSERT INTO events (
      id, title, short_summary, description, category, event_date, start_time, end_time,
      venue_id, venue_name, expected_audience, max_capacity, registration_deadline,
      eligibility, organizer_id, organizer_name, organizer_club, cover_image, flyer_path,
      additional_info, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const evt1 = 'evt_synesis_hackathon';
  const evt2 = 'evt_quantum_masterclass';
  const evt3 = 'evt_acoustic_night';
  const evt4 = 'evt_esports_showdown';
  const evt5 = 'evt_startup_pitch';
  const evt6 = 'evt_design_bootcamp';
  const evt7_pending = 'evt_green_drones_pending';
  const evt8_pending = 'evt_robotics_sprint_pending';
  const evt9_draft = 'evt_creative_coding_draft';

  insertEvent.run(
    evt1,
    "SYNESIS '26 Hackathon: AI for Smarter Campuses",
    'The flagship 24-hour campus hackathon tackling real campus challenges with generative AI.',
    'Join over 100 passionate campus builders at SYNESIS ’26. Form teams of 2 to 4 to design, build, and pitch cutting-edge solutions for smart university ecosystems. Mentors from top tech firms will be present. Food, drinks, swag bags, and prizes worth over $5,000!',
    'Hackathons',
    '2026-10-18',
    '09:00',
    '21:00',
    v2,
    'Turing Innovation Hub & AI Lab',
    'Undergrad & Postgrad Developers and Designers',
    100,
    '2026-10-17T23:59',
    'Open to all enrolled students with student ID',
    organizer1Id,
    'Maya Patel',
    'Google Developer Student Club & ACM Chapter',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    '',
    'Bring your laptop, charger, and university ID card. Power strips and snacks provided.',
    'APPROVED'
  );

  insertEvent.run(
    evt2,
    'Quantum Computing & Applied LLMs Masterclass',
    'Deep-dive into quantum simulation algorithms and running local open-source language models.',
    'A high-octane engineering masterclass featuring visiting researchers. Covers Hamiltonian simulation basics, tensor network contractions, and fine-tuning quantized models for edge hardware.',
    'Technical',
    '2026-10-16',
    '14:00',
    '17:30',
    v1,
    'Sir C.V. Raman Grand Auditorium',
    'CS, Physics, and Electrical Engineering Students',
    200,
    '2026-10-16T12:00',
    'Intermediate Python knowledge recommended',
    organizer1Id,
    'Maya Patel',
    'Google Developer Student Club & ACM Chapter',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    '',
    'Interactive live coding notebooks will be distributed.',
    'APPROVED'
  );

  insertEvent.run(
    evt3,
    'Campus Harmony Acoustic Fest & Open Mic',
    'An evening of unplugged melodies, indie vocals, poetry, and warm cider under the stars.',
    'Celebrate our campus music talents at the Emerald Quad! Enjoy acoustic indie sets, violin covers, and spoken-word poetry. Blankets, hot chocolate, and warm cookies will be provided for all attendees.',
    'Cultural',
    '2026-10-17',
    '17:30',
    '21:00',
    v3,
    'Emerald Quad Amphitheatre',
    'All Students, Faculty & Staff',
    250,
    '2026-10-17T16:00',
    'Open to all campus members and verified guests',
    organizer1Id,
    'Maya Patel',
    'Music & Arts Guild',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    '',
    'Lawn seating available; feel free to bring blankets.',
    'APPROVED'
  );

  insertEvent.run(
    evt4,
    'Inter-College 3v3 Basketball & Esports Showdown',
    'Fast-paced 3v3 court tournament alongside a live Valorant and Rocket League showcase.',
    'High adrenaline sports and esports under one roof! Cheer on university squads competing in the 3v3 knockout tournament, plus witness the finals of the Inter-Hostel Esports League on the big screens.',
    'Sports',
    '2026-10-20',
    '10:00',
    '18:00',
    v5,
    'Campus Indoor Sports Complex Arena',
    'Sports Enthusiasts and Gamers',
    350,
    '2026-10-19T20:00',
    'Open to all collegiate students',
    organizer2Id,
    'Leo Fernandes',
    'Campus Sports & Esports Council',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
    '',
    'Non-marking shoes required on the court floor.',
    'APPROVED'
  );

  insertEvent.run(
    evt5,
    'VenturePulse: Student Startup Pitch Day',
    'Where campus founders pitch to angel investors, alumni founders, and venture funds.',
    'Ten curated student ventures pitch live on stage for pre-seed grants and accelerator fast-tracks. Network with venture partners and enjoy complimentary brunch.',
    'Entrepreneurship',
    '2026-10-22',
    '11:00',
    '15:00',
    v4,
    'Vikram Sarabhai Multi-Purpose Hall',
    'Aspiring Entrepreneurs, Innovators, and Investors',
    120,
    '2026-10-21T18:00',
    'Open to all university departments',
    organizer1Id,
    'Maya Patel',
    'E-Cell & Venture Studio',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
    '',
    'Business formal or smart casual attire recommended.',
    'APPROVED'
  );

  insertEvent.run(
    evt6,
    'Design Systems & Figma Prototyping Bootcamp',
    'Hands-on workshop building accessible token systems, auto-layouts, and component architectures.',
    'Level up your product design workflow with modern UI engineering practices. Learn typography hierarchies, color accessibility contrast checks, and interactive component state machines.',
    'Art and Design',
    '2026-10-25',
    '13:00',
    '17:00',
    v2,
    'Turing Innovation Hub & AI Lab',
    'Product Designers, Front-End Engineers',
    50,
    '2026-10-24T18:00',
    'Open to all design and tech enthusiasts',
    organizer1Id,
    'Maya Patel',
    'Product Design Society',
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    '',
    'Please bring a laptop with Figma Desktop installed.',
    'APPROVED'
  );

  // Pending Event 1 (for Approver review!)
  insertEvent.run(
    evt7_pending,
    'Green Campus Initiative: Autonomous Solar Drones Demo',
    'Live outdoor test flights of solar-powered environmental telemetry drones built by students.',
    'The Green Energy Club presents their semester research: autonomous drone monitoring of heat islands and tree canopy health across the campus perimeter. Live flight demo and sensor visualization.',
    'Technical',
    '2026-10-23',
    '10:00',
    '13:00',
    v3,
    'Emerald Quad Amphitheatre',
    'Environmental Science & Aerospace Students',
    100,
    '2026-10-22T20:00',
    'Open to all campus members',
    organizer1Id,
    'Maya Patel',
    'Green Energy & Aero Club',
    'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
    '',
    'Outdoor safety perimeter will be enforced during flight demos.',
    'PENDING_APPROVAL'
  );

  // Pending Event 2 (for Approver review!)
  insertEvent.run(
    evt8_pending,
    'Midnight Robotics Autonomous Rover Sprint',
    'Obstacle course navigation championship with LiDAR-guided student rovers.',
    'Watch 12 autonomous micro-rovers race through dynamic obstacles in the multi-purpose hall. Obstacles include randomized mazes, light transitions, and acoustic beacons.',
    'Technical',
    '2026-10-24',
    '18:00',
    '21:30',
    v4,
    'Vikram Sarabhai Multi-Purpose Hall',
    'Robotics & Automation Enthusiasts',
    90,
    '2026-10-23T20:00',
    'All departments welcome',
    organizer1Id,
    'Maya Patel',
    'Robotics & Mechatronics Society',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    '',
    'Spectator seating will be on the perimeter.',
    'PENDING_APPROVAL'
  );

  // Draft Event (Organizer can edit & submit)
  insertEvent.run(
    evt9_draft,
    'Creative Coding & Generative Art Exhibition',
    'Interactive digital installations powered by WebGL, shaders, and MIDI controllers.',
    'A showcase of student interactive art projects combining algorithmic code and visual expressions.',
    'Art and Design',
    '2026-10-28',
    '15:00',
    '18:30',
    v4,
    'Vikram Sarabhai Multi-Purpose Hall',
    'Art, Media & Computing Students',
    80,
    '2026-10-27T18:00',
    'Open to all',
    organizer1Id,
    'Maya Patel',
    'Media Arts Guild',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
    '',
    'Darkened exhibition space with headphones available.',
    'DRAFT'
  );

  console.log('[Seed] Inserting initial registrations & QR tickets...');
  const insertReg = db.prepare(`
    INSERT INTO registrations (id, event_id, user_id, student_name, student_email, student_department, ticket_token, status, registered_at, checked_in_at, checked_in_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Alex Rivera (Student demo user) is pre-registered for Synesis Hackathon and Acoustic Fest!
  const alexReg1Code = generateRegistrationCode(evt1, student1Id);
  const alexReg1Token = generateTicketToken(alexReg1Code, evt1, student1Id);
  insertReg.run(
    alexReg1Code,
    evt1,
    student1Id,
    'Alex Rivera',
    'alex.student@campus.edu',
    'Computer Science & Engineering',
    alexReg1Token,
    'REGISTERED',
    new Date(Date.now() - 86400000 * 2).toISOString(),
    null,
    null
  );

  const alexReg2Code = generateRegistrationCode(evt3, student1Id);
  const alexReg2Token = generateTicketToken(alexReg2Code, evt3, student1Id);
  insertReg.run(
    alexReg2Code,
    evt3,
    student1Id,
    'Alex Rivera',
    'alex.student@campus.edu',
    'Computer Science & Engineering',
    alexReg2Token,
    'REGISTERED',
    new Date(Date.now() - 86400000).toISOString(),
    null,
    null
  );

  // Other students registered for Synesis Hackathon (including one checked in)
  const samRegCode = generateRegistrationCode(evt1, student2Id);
  const samRegToken = generateTicketToken(samRegCode, evt1, student2Id);
  insertReg.run(
    samRegCode,
    evt1,
    student2Id,
    'Samantha Lee',
    'sam.lee@campus.edu',
    'Design & Media Arts',
    samRegToken,
    'CHECKED_IN',
    new Date(Date.now() - 86400000 * 3).toISOString(),
    new Date(Date.now() - 3600000).toISOString(),
    organizer1Id
  );

  const priyaRegCode = generateRegistrationCode(evt1, student3Id);
  const priyaRegToken = generateTicketToken(priyaRegCode, evt1, student3Id);
  insertReg.run(
    priyaRegCode,
    evt1,
    student3Id,
    'Priya Nair',
    'priya.nair@campus.edu',
    'Management & Entrepreneurship',
    priyaRegToken,
    'REGISTERED',
    new Date(Date.now() - 86400000 * 2).toISOString(),
    null,
    null
  );

  // Seed approval history
  db.prepare(`
    INSERT INTO approvals_history (id, event_id, approver_id, approver_name, previous_status, new_status, action, comments, action_timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'appr_init_1',
    evt1,
    approver1Id,
    'Dean Marcus Vance',
    'PENDING_APPROVAL',
    'APPROVED',
    'APPROVED',
    'Approved. Event aligns with university AI research goals and campus venue safety norms.',
    new Date(Date.now() - 86400000 * 4).toISOString()
  );

  // Seed sample notifications
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'notif_alex_1',
    student1Id,
    'Welcome to CampusPulse!',
    'Your account is set up. Browse events matching your interests and register anytime.',
    'info'
  );

  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'notif_alex_2',
    student1Id,
    'Ticket Ready: SYNESIS ’26 Hackathon',
    'You are registered for SYNESIS ’26. View your secure QR ticket in My Registrations.',
    'registration'
  );

  console.log('[Seed] Database successfully populated with realistic campus event data!');
}

// If run directly via CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed();
}
