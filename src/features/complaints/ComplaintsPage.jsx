import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, RotateCcw } from 'lucide-react';
import {
  SearchBar,
  FilterDropdown,
  Chips,
  StatCard,
  ViewToggle,
  Tag,
  EmptyState,
  CardSkeleton,
} from '../../components/ui';
import { useComplaints } from '../../hooks/queries';

const SEVERITY_COLOR = {
  High: 'a',
  Medium: 'b',
  Low: 'g',
};

const STATUS_COLOR = {
  Open: 'b',
  'Under Review': 'a',
  Resolved: 'g',
};

export function ComplaintsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [urgency, setUrgency] = useState('All urgencies');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  const { data, isLoading, isError, error, refetch } = useComplaints();
  const complaints = data?.complaints || [];

  // Compute stat tiles dynamically from full complaint list
  const openCount = complaints.filter(
    (c) => c.status === 'Open' || c.statusKey === 'pending'
  ).length;
  const underReviewCount = complaints.filter(
    (c) => c.status === 'Under Review' || c.statusKey === 'in_progress'
  ).length;
  const urgentActiveCount = complaints.filter(
    (c) => (c.severityKey === 'high' || c.severity === 'High') && c.statusKey !== 'resolved'
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'Resolved' || c.statusKey === 'resolved'
  ).length;

  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(q) ||
      c.complainant.toLowerCase().includes(q) ||
      c.reportedParty.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);

    const matchStatus =
      statusChip === 'All' ||
      c.status.toLowerCase() === statusChip.toLowerCase() ||
      (statusChip === 'Open' && c.statusKey === 'pending') ||
      (statusChip === 'Under Review' && c.statusKey === 'in_progress') ||
      (statusChip === 'Resolved' && c.statusKey === 'resolved');

    const matchUrgency =
      urgency === 'All urgencies' ||
      c.severity.toLowerCase() === urgency.toLowerCase() ||
      c.severityKey === urgency.toLowerCase();

    return matchSearch && matchStatus && matchUrgency;
  });

  return (
    <div>
      <div className="pt">
        <h2>Complaints</h2>
        <p>Search and review incidents between students, teachers, and guardians</p>
      </div>

      <SearchBar
        placeholder="Search by title, ID, person, or category..."
        value={search}
        onChange={setSearch}
        onSearch={() => {}}
        filterElement={
          <FilterDropdown
            label="URGENCY"
            value={urgency}
            options={['All urgencies', 'High', 'Medium', 'Low']}
            onChange={setUrgency}
          />
        }
      />

      <Chips
        items={['All', 'Open', 'Under Review', 'Resolved']}
        activeItem={statusChip}
        onSelect={setStatusChip}
      />

      <div className="st4">
        <StatCard label="Open" value={openCount} />
        <StatCard label="Under review" value={underReviewCount} tint="ta" />
        <StatCard label="Urgent active" value={urgentActiveCount} tint="tr" />
        <StatCard label="Resolved" value={resolvedCount} tint="tg2" />
      </div>

      <ViewToggle
        total={complaints.length}
        label="complaints"
        mode={viewMode}
        onChange={setViewMode}
      />

      {isLoading ? (
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px' }}>
          <b style={{ color: '#C23A52' }}>Failed to load complaints</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Server error'}</p>
          <div>
            <button
              type="button"
              className="pb"
              style={{ width: 'fit-content', margin: '0 auto' }}
              onClick={() => refetch()}
            >
              <RotateCcw size={15} strokeWidth={1.8} /> Retry
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No complaints found" description="Try a different filter or search term." />
      ) : (
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {filtered.map((c) => (
            <div key={c.id} className="cd">
              <div className="row">
                <h3>{c.title}</h3>
                <span
                  className={`tg ${STATUS_COLOR[c.status] || ''}`}
                  style={{ marginLeft: 'auto' }}
                >
                  {c.status}
                </span>
              </div>

              <div className="row" style={{ flexWrap: 'wrap' }}>
                <Tag color={SEVERITY_COLOR[c.severity] || ''}>{c.severity}</Tag>
                <Tag>{c.category}</Tag>
              </div>

              <div className="pk">
                <small style={{ width: '100%', letterSpacing: '.1em', color: 'var(--mute)' }}>
                  PARTIES
                </small>
                <span className="tg" style={{ background: 'rgba(120,90,200,.1)' }}>
                  {c.complainant} · {c.role}
                </span>
                →
                <span className="tg r">{c.reportedParty}</span>
              </div>

              <div className="row">
                <span style={{ color: 'var(--mute)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} strokeWidth={1.8} /> {c.filedDate}
                </span>
              </div>

              <div className="row">
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    style={{ margin: 0 }}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                  >
                    View Case
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
