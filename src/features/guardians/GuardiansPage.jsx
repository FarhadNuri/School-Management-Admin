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
import { useGuardians } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

export function GuardiansPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

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
              <div className="row">
                <Avatar index={idx + 2} size={42} src={g.photo} />
                <div>
                  <h3>{g.name}</h3>
                  <p>{g.relationship}</p>
                </div>
                <Tag
                  color={g.isActive ? 'g' : 'a'}
                  style={{ marginLeft: 'auto' }}
                >
                  {g.status}
                </Tag>
              </div>

              <div className="row" style={{ flexWrap: 'wrap' }}>
                <Tag>{g.phone}</Tag>
                <Tag>{g.studentsCount}</Tag>
              </div>

              <div className="row">
                <span style={{ color: 'var(--mute)', fontSize: '12px' }}>{g.email}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    style={{ margin: 0 }}
                    onClick={() => navigate(`/guardians/${g.id}`)}
                  >
                    View Profile
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
