import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Trash2, Mail, Phone, Users, Heart } from 'lucide-react';
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
import { useGuardians, useDeleteGuardian } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

export function GuardiansPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [guardianToDelete, setGuardianToDelete] = useState(null);

  const deleteGuardianMutation = useDeleteGuardian();

  const debouncedSearch = useDebounce(searchInput, 400);

  const isActiveParam =
    statusChip === 'Active' ? 'true' : statusChip === 'Inactive' ? 'false' : undefined;

  const currentSearch = searchQuery !== '' ? searchQuery : debouncedSearch;

  const { data, isLoading, isError, error, refetch } = useGuardians({
    search: currentSearch,
    isActive: isActiveParam,
  });

  const guardians = data?.guardians || [];
  const count = data?.count ?? guardians.length;

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    refetch();
  };

  const handleDeleteGuardian = async () => {
    if (!guardianToDelete) return;
    try {
      await deleteGuardianMutation.mutateAsync(guardianToDelete.id);
      addToast(`Guardian "${guardianToDelete.name}" deleted successfully.`);
      setGuardianToDelete(null);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete guardian', 'error');
    }
  };

  return (
    <div>
      <div className="pt">
        <h2>Guardians</h2>
        <p>Search, view, and manage guardian records</p>
      </div>

      <SearchBar
        placeholder="Search by name, email, or phone..."
        value={searchInput}
        onChange={(val) => {
          setSearchInput(val);
          setSearchQuery('');
        }}
        onSearch={handleSearchClick}
      />

      <Chips
        items={['All', 'Active', 'Inactive']}
        activeItem={statusChip}
        onSelect={setStatusChip}
      />

      <ViewToggle
        total={count}
        label="guardians"
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
          <b style={{ color: '#C23A52' }}>Failed to load guardians</b>
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
      ) : guardians.length === 0 ? (
        <EmptyState title="No guardians found" description="Try searching by another name or phone number." />
      ) : (
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {guardians.map((g, idx) => (
            <div key={g.id} className="cd">
              <div className="cd-top">
                <Avatar index={idx + 2} size={44} radius={12} src={g.photo} />
                <div className="cd-top-info">
                  <h3 className="cd-title" title={g.name}>{g.name}</h3>
                  <p className="cd-sub" title={g.relationship}>
                    <Heart size={13} strokeWidth={1.8} />
                    {g.relationship && g.relationship !== '—' ? g.relationship : 'Primary Guardian'}
                  </p>
                </div>
                <Tag
                  color={g.isActive ? 'g' : 'a'}
                  style={{ marginLeft: 'auto', flexShrink: 0 }}
                >
                  {g.status}
                </Tag>
              </div>

              <div className="cd-tags">
                {g.phone && g.phone !== '—' && (
                  <Tag icon={<Phone size={11} strokeWidth={1.8} style={{ marginRight: '4px' }} />}>
                    {g.phone}
                  </Tag>
                )}
                {g.studentsCount && g.studentsCount !== '—' && (
                  <Tag color="b" icon={<Users size={11} strokeWidth={1.8} style={{ marginRight: '4px' }} />}>
                    {g.studentsCount}
                  </Tag>
                )}
                {g.city && g.city !== '—' && <Tag>{g.city}</Tag>}
              </div>

              <div className="cd-footer">
                <span className="cd-meta" title={g.email && g.email !== '—' ? g.email : ''}>
                  <Mail size={13} strokeWidth={1.8} />
                  <span>{g.email && g.email !== '—' ? g.email : 'No email'}</span>
                </span>
                <div className="cd-actions">
                  <button
                    type="button"
                    className="cd-btn-delete"
                    onClick={() => setGuardianToDelete(g)}
                    title="Delete Guardian"
                    aria-label={`Delete ${g.name}`}
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    className="cd-btn-view"
                    onClick={() => navigate(`/guardians/${g.id}`)}
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
        isOpen={Boolean(guardianToDelete)}
        onClose={() => setGuardianToDelete(null)}
        onConfirm={handleDeleteGuardian}
        title="Delete Guardian"
        message={`Are you sure you want to permanently delete "${guardianToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Guardian"
        confirmColor="#C23A52"
        isLoading={deleteGuardianMutation.isPending}
      />
    </div>
  );
}
