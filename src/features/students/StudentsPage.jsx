import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RotateCcw, Trash2, Calendar, Mail } from 'lucide-react';
import {
  SearchBar,
  Chips,
  ViewToggle,
  Tag,
  Avatar,
  EmptyState,
  CardSkeleton,
  ConfirmModal,
  useToast,
} from '../../components/ui';
import { EnrollStudentWizard } from './EnrollStudentWizard';
import { useStudents, useDeleteStudent } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

export function StudentsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const deleteStudentMutation = useDeleteStudent();

  const debouncedSearch = useDebounce(searchInput, 400);

  // Active filter for API: 'All' -> undefined, 'Active' -> 'true', 'Inactive' -> 'false'
  const isActiveParam =
    statusChip === 'Active' ? 'true' : statusChip === 'Inactive' ? 'false' : undefined;

  const currentSearch = searchQuery !== '' ? searchQuery : debouncedSearch;

  const { data, isLoading, isError, error, refetch } = useStudents({
    search: currentSearch,
    isActive: isActiveParam,
  });

  const students = data?.students || [];
  const count = data?.count ?? students.length;

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    refetch();
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudentMutation.mutateAsync(studentToDelete.id);
      addToast(`Student "${studentToDelete.name}" deleted successfully.`);
      setStudentToDelete(null);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete student', 'error');
    }
  };

  return (
    <div>
      <div className="pt">
        <h2>Students</h2>
        <p>Search, view, and manage student records</p>
      </div>

      <SearchBar
        placeholder="Search by name or student ID..."
        value={searchInput}
        onChange={(val) => {
          setSearchInput(val);
          setSearchQuery('');
        }}
        onSearch={handleSearchClick}
        actionText="Add Student"
        onAction={() => setIsWizardOpen(true)}
      />

      <Chips
        items={['All', 'Active', 'Inactive']}
        activeItem={statusChip}
        onSelect={setStatusChip}
      />

      <ViewToggle
        total={count}
        label="students"
        mode={viewMode}
        onChange={setViewMode}
      />

      {isLoading ? (
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px' }}>
          <b style={{ color: '#C23A52' }}>Failed to load students</b>
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
      ) : students.length === 0 ? (
        <EmptyState title="No students found" description="Try adjusting your search query or filters." />
      ) : (
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {students.map((s, idx) => (
            <div key={s.id} className="cd">
              <div className="cd-top">
                <Avatar index={idx} size={44} radius={12} src={s.photo} />
                <div className="cd-top-info">
                  <h3 className="cd-title" title={s.name}>{s.name}</h3>
                  <p className="cd-sub" title={s.guardian && s.guardian !== '—' ? `Guardian: ${s.guardian}` : ''}>
                    <User size={13} strokeWidth={1.8} />
                    {s.guardian && s.guardian !== '—' ? s.guardian : 'No Guardian assigned'}
                  </p>
                </div>
                <Tag color={s.isActive ? 'g' : 'a'} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  {s.status}
                </Tag>
              </div>

              <div className="cd-tags">
                {s.class && s.class !== '—' && <Tag color="b">{s.class}</Tag>}
                {s.city && s.city !== '—' && <Tag>{s.city}</Tag>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--mute)' }}>
                <Calendar size={13} strokeWidth={1.8} />
                <span>Admitted {s.admittedDate || 'Recently'}</span>
              </div>

              <div className="cd-footer">
                <span className="cd-meta" title={s.email && s.email !== '—' ? s.email : ''}>
                  <Mail size={13} strokeWidth={1.8} />
                  <span>{s.email && s.email !== '—' ? s.email : 'No email'}</span>
                </span>
                <div className="cd-actions">
                  <button
                    type="button"
                    className="cd-btn-delete"
                    onClick={() => setStudentToDelete(s)}
                    title="Delete Student"
                    aria-label={`Delete ${s.name}`}
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    className="cd-btn-view"
                    onClick={() => navigate(`/students/${s.id}`)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteStudent}
        title="Delete Student"
        message={`Are you sure you want to permanently delete "${studentToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Student"
        confirmColor="#C23A52"
        isLoading={deleteStudentMutation.isPending}
      />

      <EnrollStudentWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
