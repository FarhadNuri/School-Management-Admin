import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, RotateCcw } from 'lucide-react';
import {
  SearchBar,
  Chips,
  ViewToggle,
  Tag,
  EmptyState,
  CardSkeleton,
} from '../../components/ui';
import { ClassModal } from './ClassModal';
import { useClasses } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

export function ClassesPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  const isActiveParam =
    statusChip === 'Active' ? 'true' : statusChip === 'Inactive' ? 'false' : undefined;

  const currentSearch = searchQuery !== '' ? searchQuery : debouncedSearch;

  const { data, isLoading, isError, error, refetch } = useClasses({
    search: currentSearch,
    isActive: isActiveParam,
  });

  const classesList = data?.classes || [];
  const count = data?.count ?? classesList.length;

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    refetch();
  };

  return (
    <div>
      <div className="pt">
        <h2>Classes</h2>
        <p>Search, view, and manage class sections</p>
      </div>

      <SearchBar
        placeholder="Search by name, code, grade, or teacher..."
        value={searchInput}
        onChange={(val) => {
          setSearchInput(val);
          setSearchQuery('');
        }}
        onSearch={handleSearchClick}
        actionText="Add Class"
        onAction={() => setIsModalOpen(true)}
      />

      <Chips
        items={['All', 'Active', 'Inactive']}
        activeItem={statusChip}
        onSelect={setStatusChip}
      />

      <ViewToggle
        total={count}
        label="classes"
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
          <b style={{ color: '#C23A52' }}>Failed to load classes</b>
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
      ) : classesList.length === 0 ? (
        <EmptyState title="No classes found" description="Try searching with another grade or class name." />
      ) : (
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {classesList.map((c) => (
            <div key={c.id} className="cd">
              <div className="row">
                <span className="dt" style={{ height: '48px' }}>
                  <small style={{ fontSize: '8px' }}>GR</small>
                  <b>{c.grade}</b>
                </span>
                <div>
                  <h3>{c.name}</h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={14} strokeWidth={1.8} /> {c.teacher}
                  </p>
                </div>
              </div>

              <div className="row" style={{ flexWrap: 'wrap' }}>
                <Tag color={c.isActive ? 'g' : 'a'}>{c.status}</Tag>
                <Tag>Grade {c.grade}</Tag>
                <Tag>{c.enrolled} enrolled</Tag>
                <Tag>{c.coursesCount} courses</Tag>
              </div>

              <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} strokeWidth={1.8} /> {c.academicYear}
              </p>

              <div className="row">
                <span style={{ color: 'var(--mute)', fontSize: '12px' }}>{c.code}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    style={{ margin: 0 }}
                    onClick={() => navigate(`/classes/${c.id}`)}
                  >
                    View Class
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
