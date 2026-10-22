import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import {
  SearchBar,
  Chips,
  ViewToggle,
  Tag,
  Avatar,
  EmptyState,
  CardSkeleton,
} from '../../components/ui';
import { EnrollTeacherWizard } from './EnrollTeacherWizard';
import { useTeachers } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

export function TeachersPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  const isActiveParam =
    statusChip === 'Active' ? 'true' : statusChip === 'Inactive' ? 'false' : undefined;

  const currentSearch = searchQuery !== '' ? searchQuery : debouncedSearch;

  const { data, isLoading, isError, error, refetch } = useTeachers({
    search: currentSearch,
    isActive: isActiveParam,
  });

  const teachers = data?.teachers || [];
  const count = data?.count ?? teachers.length;

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    refetch();
  };

  return (
    <div>
      <div className="pt">
        <h2>Teachers</h2>
        <p>Search, view, and manage teaching staff records</p>
      </div>

      <SearchBar
        placeholder="Search by name, ID, subject, or department..."
        value={searchInput}
        onChange={(val) => {
          setSearchInput(val);
          setSearchQuery('');
        }}
        onSearch={handleSearchClick}
        actionText="Add Teacher"
        onAction={() => setIsWizardOpen(true)}
      />

      <Chips
        items={['All', 'Active', 'Inactive']}
        activeItem={statusChip}
        onSelect={setStatusChip}
      />

      <ViewToggle
        total={count}
        label="teachers"
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
          <b style={{ color: '#C23A52' }}>Failed to load teachers</b>
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
      ) : teachers.length === 0 ? (
        <EmptyState title="No teachers found" description="Try adjusting your search query or filters." />
      ) : (
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {teachers.map((t, idx) => (
            <div key={t.id} className="cd">
              <div className="row">
                <Avatar index={idx + 1} size={42} src={t.photo} />
                <div>
                  <h3>{t.name}</h3>
                  <p>{t.qualification}</p>
                </div>
                <Tag
                  color={t.isActive ? 'g' : 'a'}
                  style={{ marginLeft: 'auto' }}
                >
                  {t.status}
                </Tag>
              </div>

              <div className="row" style={{ flexWrap: 'wrap' }}>
                <Tag>{t.city}</Tag>
                <Tag>{t.classesCount}</Tag>
              </div>

              {!t.hasCourses && (
                <div
                  className="pk"
                  style={{ background: 'rgba(48,160,110,.07)', color: 'var(--mute)' }}
                >
                  No subjects assigned
                </div>
              )}

              <div className="row">
                <span style={{ color: 'var(--mute)', fontSize: '12px' }}>{t.email}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    style={{ margin: 0 }}
                    onClick={() => navigate(`/teachers/${t.id}`)}
                  >
                    View Profile
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <EnrollTeacherWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
