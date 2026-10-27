import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, RotateCcw, Trash2 } from 'lucide-react';
import {
  SearchBar,
  FilterDropdown,
  Chips,
  StatCard,
  ViewToggle,
  Tag,
  EmptyState,
  CardSkeleton,
  ConfirmModal,
  useToast,
} from '../../components/ui';
import { useComplaints, useDeleteComplaint } from '../../hooks/queries';
import { getStatusConfig } from './status';

const SEVERITY_COLOR = {
  High: 'a',
  Medium: 'b',
  Low: 'g',
};

export function ComplaintsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [urgency, setUrgency] = useState('All urgencies');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [complaintToDelete, setComplaintToDelete] = useState(null);

  const deleteComplaintMutation = useDeleteComplaint();

  const { data, isLoading, isError, error, refetch } = useComplaints();
  const complaints = data?.complaints || [];

  // Compute stat tiles dynamically from full complaint list
  const openCount = complaints.filter(
    (c) => c.statusKey === 'pending' || c.status === 'Open'
  ).length;
  const underReviewCount = complaints.filter(
    (c) =>
      c.statusKey === 'under_review' ||
      c.statusKey === 'in_progress' ||
      c.status === 'Under review' ||
      c.status === 'Under Review'
  ).length;
  const urgentActiveCount = complaints.filter(
    (c) => (c.severityKey === 'high' || c.severity === 'High') && c.statusKey !== 'resolved'
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.statusKey === 'resolved' || c.status === 'Resolved'
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
      (statusChip === 'Open' && (c.statusKey === 'pending' || c.status === 'Open')) ||
      (statusChip === 'Under Review' &&
        (c.statusKey === 'under_review' ||
          c.statusKey === 'in_progress' ||
          c.status === 'Under review' ||
          c.status === 'Under Review')) ||
      (statusChip === 'Resolved' && (c.statusKey === 'resolved' || c.status === 'Resolved'));

    const matchUrgency =
      urgency === 'All urgencies' ||
      c.severity.toLowerCase() === urgency.toLowerCase() ||
      c.severityKey === urgency.toLowerCase();

    return matchSearch && matchStatus && matchUrgency;
  });

  const handleDeleteComplaint = async () => {
    if (!complaintToDelete) return;
    try {
      await deleteComplaintMutation.mutateAsync(complaintToDelete.id);
      addToast('Complaint deleted successfully.');
      setComplaintToDelete(null);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete complaint', 'error');
    }
  };

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
          {filtered.map((c) => {
            const statusCfg = getStatusConfig(c.statusKey || c.status);

            return (
              <div key={c.id} className="cd">
                <div className="cd-top">
                  <div className="cd-top-info">
                    <h3 className="cd-title" title={c.title}>{c.title}</h3>
                    <p className="cd-sub">
                      <span>{c.complainant} ({c.role})</span>
                      <span>→</span>
                      <span style={{ color: '#E5536B' }}>{c.reportedParty}</span>
                    </p>
                  </div>
                  <Tag color={statusCfg.tagClass} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    {statusCfg.label}
                  </Tag>
                </div>

                <div className="cd-tags">
                  <Tag color={SEVERITY_COLOR[c.severity] || ''}>{c.severity}</Tag>
                  <Tag>{c.category}</Tag>
                </div>

                <div className="cd-footer">
                  <span className="cd-meta">
                    <Calendar size={13} strokeWidth={1.8} />
                    <span>{c.filedDate}</span>
                  </span>
                  <div className="cd-actions">
                    <button
                      type="button"
                      className="cd-btn-delete"
                      onClick={() => setComplaintToDelete(c)}
                      title="Delete Complaint"
                      aria-label={`Delete ${c.title}`}
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      className="cd-btn-view"
                      onClick={() => navigate(`/complaints/${c.id}`)}
                    >
                      View Case
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(complaintToDelete)}
        onClose={() => setComplaintToDelete(null)}
        onConfirm={handleDeleteComplaint}
        title="Delete Complaint"
        message={`Are you sure you want to permanently delete this complaint ("${complaintToDelete?.title}")? This action cannot be undone.`}
        confirmText="Delete Complaint"
        confirmColor="#C23A52"
        isLoading={deleteComplaintMutation.isPending}
      />
    </div>
  );
}
