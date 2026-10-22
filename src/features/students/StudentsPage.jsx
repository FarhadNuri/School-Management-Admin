import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RotateCcw } from 'lucide-react';
import {
  SearchBar,
  Chips,
  ViewToggle,
  Tag,
  Avatar,
  EmptyState,
  CardSkeleton,
} from '../../components/ui';
import { EnrollStudentWizard } from './EnrollStudentWizard';
import { useStudents } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

export function StudentsPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

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
              <div className="row">
                <Avatar index={idx} size={42} src={s.photo} />
                <div>
                  <h3>{s.name}</h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={14} strokeWidth={1.8} /> {s.guardian}
                  </p>
                </div>
              </div>

              <div className="row" style={{ flexWrap: 'wrap' }}>
                <Tag>{s.city}</Tag>
                <Tag color={s.isActive ? 'g' : 'a'}>{s.status}</Tag>
                <Tag>{s.class}</Tag>
              </div>

              <p>Admitted {s.admittedDate}</p>

              <div className="row">
                <span style={{ color: 'var(--mute)', fontSize: '12px' }}>{s.email}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    style={{ margin: 0 }}
                    onClick={() => navigate(`/students/${s.id}`)}
                  >
                    View Profile
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <EnrollStudentWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
