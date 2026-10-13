import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { CampusEvent, Venue, EventCategory } from '../types';
import { EventCard } from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Calendar,
  Sparkles,
  MapPin,
  ArrowUpDown,
  Tag,
  Check
} from 'lucide-react';

const CATEGORIES: Array<EventCategory | 'All'> = [
  'All',
  'Technical',
  'Hackathons',
  'Workshops',
  'Cultural',
  'Sports',
  'Entrepreneurship',
  'Art and Design',
  'Clubs and Communities'
];

export const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateInterests } = useAuth();

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [recommendations, setRecommendations] = useState<CampusEvent[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from searchParams
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [dateFilter, setDateFilter] = useState(searchParams.get('dateFilter') || 'upcoming');
  const [venueId, setVenueId] = useState(searchParams.get('venueId') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'date-asc');

  // Interest selector modal/pill state
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);

  useEffect(() => {
    loadVenues();
    loadRecommendations();
  }, [user]);

  useEffect(() => {
    loadEvents();
  }, [search, category, dateFilter, venueId, sortBy]);

  const loadVenues = async () => {
    try {
      const data = await api.getVenues();
      setVenues(data.venues || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRecommendations = async () => {
    try {
      const data = await api.getRecommendations();
      setRecommendations(data.recommendations || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents({
        search,
        category: category === 'All' ? undefined : category,
        dateFilter,
        venueId: venueId === 'All' ? undefined : venueId,
        sortBy
      });
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (cat: string) => {
    setSelectedInterests(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const saveInterests = async () => {
    await updateInterests(selectedInterests);
    setIsEditingInterests(false);
    loadRecommendations();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E8E5DC]">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#27866A] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
            Live Campus Feed
          </span>
          <h1 className="text-3xl font-extrabold text-[#202923] tracking-tight mt-1">
            Discover Campus Events
          </h1>
          <p className="text-sm text-[#73796F] mt-1">
            Browse approved technical hackathons, cultural festivals, workshops, and sports meets.
          </p>
        </div>

        {/* User Interests Pill / Quick Preference Customizer */}
        {user && (
          <div className="bg-white p-3 rounded-2xl border border-[#E8E5DC] shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#174C3C]/10 text-[#174C3C] flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-[#174C3C]" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-[#202923] block">Your Interests:</span>
              <span className="text-[#73796F]">
                {user.interests && user.interests.length > 0
                  ? user.interests.join(', ')
                  : 'No preferences set yet'}
              </span>
            </div>
            <button
              onClick={() => setIsEditingInterests(!isEditingInterests)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#27866A] text-[#27866A] hover:bg-[#27866A]/10 transition-colors"
            >
              {isEditingInterests ? 'Close' : 'Customize'}
            </button>
          </div>
        )}
      </div>

      {/* Interest Customizer Dropdown Drawer */}
      {isEditingInterests && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#27866A]/30 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#174C3C]">
              Select Your Event Preferences
            </h3>
            <span className="text-xs text-[#73796F]">
              Events matching these will be highlighted for you.
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => c !== 'All').map(cat => {
              const selected = selectedInterests.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => handleInterestToggle(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selected
                      ? 'bg-[#174C3C] text-white shadow-sm ring-1 ring-[#F4C95D]'
                      : 'bg-[#FAF8F2] text-[#73796F] hover:bg-[#E8E5DC] border border-[#E8E5DC]'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5 text-[#F4C95D]" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E5DC]">
            <button
              onClick={() => setIsEditingInterests(false)}
              className="px-4 py-2 text-xs font-semibold text-[#73796F] hover:bg-[#FAF8F2] rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={saveInterests}
              className="px-5 py-2 text-xs font-bold text-white bg-[#174C3C] hover:bg-[#133E31] rounded-lg shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Personalized Recommendations Section (if available) */}
      {recommendations.length > 0 && !search && category === 'All' && dateFilter === 'upcoming' && (
        <div className="space-y-4 bg-gradient-to-r from-[#174C3C]/5 via-[#27866A]/5 to-[#F4C95D]/5 p-6 rounded-3xl border border-[#27866A]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B4A]" />
              <h2 className="text-xl font-extrabold text-[#174C3C]">
                Recommended For You
              </h2>
            </div>
            <span className="text-xs text-[#73796F] hidden sm:inline">
              Rule-based scoring matching your interest tags & popularity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map(event => (
              <EventCard key={`rec-${event.id}`} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4">
        {/* Top Row: Search Input & Sort Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-5 h-5 text-[#73796F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by event title, organizer club, description, or keyword..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] placeholder:text-[#73796F]/70 focus:outline-none focus:border-[#27866A] focus:ring-1 focus:ring-[#27866A]"
            />
          </div>

          {/* Sort By */}
          <div className="md:col-span-4 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#73796F] shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] bg-white focus:outline-none focus:border-[#27866A]"
            >
              <option value="date-asc">Date: Upcoming First</option>
              <option value="date-desc">Date: Latest First</option>
              <option value="popularity">Popularity: Most Registered</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Date & Venue Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8E5DC]/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#27866A] shrink-0" />
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E5DC] text-xs text-[#202923] bg-white focus:outline-none focus:border-[#27866A]"
            >
              <option value="upcoming">Upcoming Events (Default)</option>
              <option value="today">Today's Events</option>
              <option value="all">All Dates</option>
              <option value="past">Past Events Archive</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FF6B4A] shrink-0" />
            <select
              value={venueId}
              onChange={e => setVenueId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E5DC] text-xs text-[#202923] bg-white focus:outline-none focus:border-[#27866A]"
            >
              <option value="All">All Campus Venues</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="pt-2 border-t border-[#E8E5DC]/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-[#73796F] flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#27866A]" />
              Category:
            </span>
            {CATEGORIES.map(cat => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#174C3C] text-white shadow-sm'
                      : 'bg-[#FAF8F2] text-[#73796F] hover:bg-[#E8E5DC] border border-[#E8E5DC]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events Results Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-bold text-[#202923]">
            Showing <span className="text-[#174C3C]">{events.length}</span> events
          </div>
          {(search || category !== 'All' || venueId !== 'All' || dateFilter !== 'upcoming') && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setVenueId('All');
                setDateFilter('upcoming');
              }}
              className="text-xs font-bold text-[#FF6B4A] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#73796F]">
            <div className="w-8 h-8 border-3 border-[#174C3C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8E5DC] p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-[#FAF8F2] rounded-2xl flex items-center justify-center mx-auto text-[#73796F]">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#202923]">No matching events found</h3>
            <p className="text-xs text-[#73796F] max-w-sm mx-auto">
              Try adjusting your search keywords, category filters, or date range.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
