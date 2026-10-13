import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Venue, EventCategory, ConflictResult } from '../types';
import { VenueConflictAlert } from '../components/VenueConflictAlert';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  Bot,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  Save,
  Send,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';

const CATEGORIES: EventCategory[] = [
  'Technical',
  'Hackathons',
  'Workshops',
  'Cultural',
  'Sports',
  'Entrepreneurship',
  'Art and Design',
  'Clubs and Communities'
];

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  // AI Extraction state
  const [aiStatus, setAiStatus] = useState<{ aiConfigured: boolean; model?: string }>({ aiConfigured: false });
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreviewUrl, setFlyerPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiNotes, setAiNotes] = useState<string | null>(null);
  const [ambiguousFields, setAmbiguousFields] = useState<string[]>([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [shortSummary, setShortSummary] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technical');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('13:00');
  const [venueId, setVenueId] = useState('');
  const [expectedAudience, setExpectedAudience] = useState('All Departments');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [eligibility, setEligibility] = useState('Open to all registered students');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80');
  const [flyerPath, setFlyerPath] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Conflict Checking state
  const [conflictResult, setConflictResult] = useState<ConflictResult | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Automatically check venue conflict whenever venueId, eventDate, startTime, or endTime change
  useEffect(() => {
    if (venueId && eventDate && startTime && endTime && endTime > startTime) {
      runVenueConflictCheck();
    } else {
      setConflictResult(null);
    }
  }, [venueId, eventDate, startTime, endTime]);

  const loadInitialData = async () => {
    try {
      const [vData, aiData] = await Promise.all([
        api.getVenues(),
        api.getAIStatus()
      ]);
      setVenues(vData.venues || []);
      if (vData.venues && vData.venues.length > 0) {
        setVenueId(vData.venues[0].id);
      }
      setAiStatus(aiData);

      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      setEventDate(tomorrow.toISOString().split('T')[0]);
      setRegistrationDeadline(`${tomorrow.toISOString().split('T')[0]}T09:00`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVenues(false);
    }
  };

  const runVenueConflictCheck = async () => {
    setCheckingConflict(true);
    try {
      const res = await api.checkVenueConflict({
        venueId,
        eventDate,
        startTime,
        endTime
      });
      setConflictResult(res);
    } catch (e) {
      console.error('Conflict check error:', e);
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleFlyerSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFlyerFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFlyerPreviewUrl(objectUrl);

    // Upload & Extract
    setIsExtracting(true);
    setFormError(null);
    try {
      const res = await api.uploadFlyer(file);
      if (res.flyerUrl) {
        setFlyerPath(res.flyerUrl);
        setCoverImage(res.flyerUrl);
      }

      if (res.data) {
        // Populate fields from AI extraction
        if (res.data.title) setTitle(res.data.title);
        if (res.data.short_summary) setShortSummary(res.data.short_summary);
        if (res.data.description) setDescription(res.data.description);
        if (res.data.category && CATEGORIES.includes(res.data.category as any)) {
          setCategory(res.data.category as EventCategory);
        }
        if (res.data.event_date) setEventDate(res.data.event_date);
        if (res.data.start_time) setStartTime(res.data.start_time);
        if (res.data.end_time) setEndTime(res.data.end_time);
        if (res.data.max_capacity) setMaxCapacity(String(res.data.max_capacity));
        if (res.data.registration_deadline) setRegistrationDeadline(res.data.registration_deadline);
        if (res.data.eligibility) setEligibility(res.data.eligibility);

        // Match venue name if suggested
        if (res.data.venue_name && venues.length > 0) {
          const matched = venues.find(v => v.name.toLowerCase().includes(res.data.venue_name.toLowerCase()));
          if (matched) setVenueId(matched.id);
        }

        setAmbiguousFields(res.data.ambiguous_fields || []);
        setAiNotes(res.message);
      } else {
        setAiNotes(res.message);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error uploading flyer.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (submitForApproval: boolean) => {
    setFormError(null);
    setFormSuccess(null);

    // Basic Validations
    if (!title.trim()) {
      setFormError('Please enter an event title.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please enter an event description.');
      return;
    }
    if (!eventDate) {
      setFormError('Please choose an event date.');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Please specify start and end times.');
      return;
    }
    if (endTime <= startTime) {
      setFormError('End time must be strictly after start time.');
      return;
    }
    if (!venueId) {
      setFormError('Please select a campus venue.');
      return;
    }

    if (submitForApproval && conflictResult?.hasConflict) {
      setFormError('Cannot submit for approval: A venue schedule conflict exists for this time slot. Please adjust the time slot or switch venue.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        short_summary: shortSummary || title,
        description,
        category,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        venue_id: venueId,
        expected_audience: expectedAudience,
        max_capacity: Number(maxCapacity) || 100,
        registration_deadline: registrationDeadline || `${eventDate}T${startTime}`,
        eligibility,
        cover_image: coverImage,
        flyer_path: flyerPath,
        additional_info: additionalInfo,
        submitForApproval
      };

      const res = await api.createEvent(payload);

      setFormSuccess(res.message);
      setTimeout(() => {
        navigate('/dashboard/organizer');
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save event.');
      if (err.conflictResult) {
        setConflictResult(err.conflictResult);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-[#E8E5DC]">
        <span className="text-xs font-bold tracking-widest uppercase text-[#FF6B4A] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
          Host an Event Workflow
        </span>
        <h1 className="text-3xl font-extrabold text-[#202923] tracking-tight">
          Create & Submit Campus Event
        </h1>
        <p className="text-sm text-[#73796F]">
          Upload an event flyer for instant AI drafting, or fill in details manually. Venue availability is checked automatically.
        </p>
      </div>

      {/* Notifications */}
      {formError && (
        <div className="p-4 rounded-2xl bg-[#FF6B4A]/10 border border-[#FF6B4A] text-xs font-bold text-[#D94528] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#FF6B4A] shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div className="p-4 rounded-2xl bg-[#174C3C]/10 border border-[#174C3C] text-xs font-bold text-[#174C3C] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#27866A] shrink-0" />
          <span>{formSuccess} Redirecting to your organizer dashboard...</span>
        </div>
      )}

      {/* Section 1: AI Flyer Extraction Box */}
      <div className="bg-white p-7 rounded-3xl border-2 border-dashed border-[#27866A]/40 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#27866A]/15 text-[#27866A] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#27866A]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#174C3C]">
                AI Flyer-to-Event Auto-Fill (Optional)
              </h3>
              <p className="text-xs text-[#73796F]">
                Upload your poster. Vision AI extracts title, date, time, and suggestions.
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              aiStatus.aiConfigured
                ? 'bg-[#174C3C]/10 text-[#174C3C] border border-[#174C3C]/30'
                : 'bg-[#F4C95D]/25 text-[#A07010] border border-[#F4C95D]/50'
            }`}
          >
            {aiStatus.aiConfigured ? 'Gemini AI Vision Active' : 'Manual Draft Mode Active'}
          </span>
        </div>

        {/* Drop Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8">
            <label className="border-2 border-dashed border-[#E8E5DC] hover:border-[#27866A] bg-[#FAF8F2] rounded-2xl p-6 text-center cursor-pointer transition-colors block">
              <Upload className="w-8 h-8 text-[#27866A] mx-auto mb-2" />
              <span className="font-bold text-sm text-[#202923] block">
                {flyerFile ? flyerFile.name : 'Click to select an event flyer or poster (JPG/PNG)'}
              </span>
              <span className="text-xs text-[#73796F] block mt-1">
                Max size: 5MB. All extracted data remains 100% editable by you.
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFlyerSelected}
                className="hidden"
                disabled={isExtracting}
              />
            </label>
          </div>

          {/* Flyer Preview */}
          <div className="md:col-span-4 flex justify-center">
            {flyerPreviewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#E8E5DC] w-36 h-48 bg-black/5 shadow-sm">
                <img
                  src={flyerPreviewUrl}
                  alt="Flyer Preview"
                  className="w-full h-full object-cover"
                />
                {isExtracting && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs p-2 text-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-2" />
                    <span>Analyzing poster...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-36 h-48 rounded-2xl border border-[#E8E5DC] bg-[#FAF8F2] flex flex-col items-center justify-center text-[#73796F] text-xs p-3 text-center">
                <ImageIcon className="w-6 h-6 mb-1 text-[#E8E5DC]" />
                <span>Flyer preview will appear here</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Notes & Ambiguous fields feedback */}
        {aiNotes && (
          <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#E8E5DC] text-xs text-[#202923] space-y-1">
            <span className="font-bold text-[#174C3C] block">AI Parser Status:</span>
            <p className="text-[#73796F]">{aiNotes}</p>
            {ambiguousFields.length > 0 && (
              <div className="text-[#D94528] font-semibold mt-1">
                ⚠️ Please double-check these ambiguous fields: {ambiguousFields.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Core Event Form */}
      <div className="bg-white p-8 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-8">
        <h3 className="text-xl font-extrabold text-[#174C3C] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#27866A]" />
          Event Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. SYNESIS '26 Hackathon: AI for Smarter Campuses"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
              required
            />
          </div>

          {/* Short Summary */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
              One-Line Summary
            </label>
            <input
              type="text"
              value={shortSummary}
              onChange={e => setShortSummary(e.target.value)}
              placeholder="A brief punchline displayed on event discovery cards"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as EventCategory)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] bg-white focus:outline-none focus:border-[#27866A]"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Max Capacity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
              Max Registration Capacity *
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-[#73796F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="5"
                max="1000"
                value={maxCapacity}
                onChange={e => setMaxCapacity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
              Full Description & Agenda *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail the schedule, speaker lineup, rules, requirements, and food/swag info..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
              required
            />
          </div>
        </div>

        {/* Section 3: Venue & Schedule (Live Conflict Detection) */}
        <div className="pt-6 border-t border-[#E8E5DC] space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-[#174C3C] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#27866A]" />
              Schedule & Campus Venue Selection
            </h4>
            {checkingConflict && (
              <span className="text-xs text-[#27866A] font-semibold animate-pulse">
                Checking venue availability...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Event Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                Event Date *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
                required
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
                required
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
                required
              />
            </div>

            {/* Venue Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                Campus Venue *
              </label>
              <select
                value={venueId}
                onChange={e => setVenueId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] bg-white focus:outline-none focus:border-[#27866A]"
                required
              >
                {venues.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Cap: {v.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Venue Conflict Alert */}
          {conflictResult?.hasConflict && (
            <VenueConflictAlert
              conflict={conflictResult}
              onSelectSlot={(sTime, eTime) => {
                setStartTime(sTime);
                setEndTime(eTime);
              }}
              onSelectVenue={(vId) => {
                setVenueId(vId);
              }}
            />
          )}

          {conflictResult && !conflictResult.hasConflict && (
            <div className="p-3.5 rounded-2xl bg-[#174C3C]/10 border border-[#174C3C]/30 text-xs font-bold text-[#174C3C] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#27866A]" />
              <span>Venue slot is available! No scheduling conflicts on server.</span>
            </div>
          )}
        </div>

        {/* Section 4: Eligibility & Deadlines */}
        <div className="pt-6 border-t border-[#E8E5DC] space-y-4">
          <h4 className="text-base font-extrabold text-[#174C3C]">
            Audience, Eligibility & Logistics
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                Eligibility
              </label>
              <input
                type="text"
                value={eligibility}
                onChange={e => setEligibility(e.target.value)}
                placeholder="e.g. Open to all students with ID"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={e => setRegistrationDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                Expected Audience
              </label>
              <input
                type="text"
                value={expectedAudience}
                onChange={e => setExpectedAudience(e.target.value)}
                placeholder="e.g. Undergrads & Postgrads"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
              Additional Organizer Notes or Instructions
            </label>
            <input
              type="text"
              value={additionalInfo}
              onChange={e => setAdditionalInfo(e.target.value)}
              placeholder="e.g. Bring laptops with chargers, power strips provided."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
            />
          </div>
        </div>

        {/* Action Buttons: Save Draft vs Submit For Approval */}
        <div className="pt-6 border-t border-[#E8E5DC] flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-[#174C3C] text-[#174C3C] hover:bg-[#FAF8F2] text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-[#27866A]" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={submitting || Boolean(conflictResult?.hasConflict)}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
              conflictResult?.hasConflict
                ? 'bg-[#E8E5DC] text-[#73796F] cursor-not-allowed'
                : 'bg-[#174C3C] text-white hover:bg-[#133E31]'
            }`}
          >
            <Send className="w-4 h-4 text-[#F4C95D]" />
            <span>Submit for Faculty Approval</span>
          </button>
        </div>
      </div>
    </div>
  );
};
