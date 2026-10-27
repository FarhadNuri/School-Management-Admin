import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, RotateCcw, Trash2 } from 'lucide-react';
import {
  SearchBar,
  Chips,
  ViewToggle,
  Tag,
  EmptyState,
  CardSkeleton,
  ClassImageTile,
  ConfirmModal,
  useToast,
} from '../../components/ui';
import { ClassModal } from './ClassModal';
import { useClasses, useDeleteClass } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

export function ClassesPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const deleteClassMutation = useDeleteClass();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

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

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    try {
      await deleteClassMutation.mutateAsync(classToDelete.id);
      addToast(`Class "${classToDelete.name}" deleted successfully.`);
      setClassToDelete(null);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete class', 'error');
    }
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
              <div className="cd-top">
                <ClassImageTile
                  src={c.coverImage}
                  grade={c.grade}
                  size={44}
                  radius={12}
                  alt={c.name}
                />
                <div className="cd-top-info">
                  <h3 className="cd-title" title={c.name}>{c.name}</h3>
                  <p className="cd-sub" title={c.teacher}>
                    <User size={13} strokeWidth={1.8} />
                    {c.teacher && c.teacher !== '—' ? c.teacher : 'No Class Teacher'}
                  </p>
                </div>
                <Tag color={c.isActive ? 'g' : 'a'} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  {c.status}
                </Tag>
              </div>

              <div className="cd-tags">
                <Tag color="b">Grade {c.grade}</Tag>
                <Tag>{c.enrolled || 0} enrolled</Tag>
                <Tag>{c.coursesCount || 0} subjects</Tag>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--mute)' }}>
                <Calendar size={13} strokeWidth={1.8} />
                <span>{c.academicYear || 'Current Academic Year'}</span>
              </div>

              <div className="cd-footer">
                <span className="cd-meta" title={c.code}>
                  <span>{c.code}</span>
                </span>
                <div className="cd-actions">
                  <button
                    type="button"
                    className="cd-btn-delete"
                    onClick={() => setClassToDelete(c)}
                    title="Delete Class"
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    className="cd-btn-view"
                    onClick={() => navigate(`/classes/${c.id}`)}
                  >
                    View Class
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(classToDelete)}
        onClose={() => setClassToDelete(null)}
        onConfirm={handleDeleteClass}
        title="Delete Class"
        message={`Are you sure you want to delete "${classToDelete?.name}"? This will unassign all teachers, subjects, and students associated with this class. This action cannot be undone.`}
        confirmText="Delete Class"
        confirmColor="#C23A52"
        isLoading={deleteClassMutation.isPending}
      />

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
