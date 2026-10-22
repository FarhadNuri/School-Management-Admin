import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RotateCcw } from 'lucide-react';
import {
  SearchBar,
  Chips,
  ViewToggle,
  Tag,
  EmptyState,
  CardSkeleton,
} from '../../components/ui';
import { CourseModal } from './CourseModal';
import { useCourses } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

export function CoursesPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChip, setStatusChip] = useState('All');
  const [typeChip, setTypeChip] = useState('All types');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  const currentSearch = searchQuery !== '' ? searchQuery : debouncedSearch;

  const statusParam = statusChip === 'All' ? undefined : statusChip;
  const typeParam = typeChip === 'All types' ? undefined : typeChip;

  const { data, isLoading, isError, error, refetch } = useCourses({
    search: currentSearch,
    courseStatus: statusParam,
    courseType: typeParam,
  });

  const rawCourses = data?.courses || [];

  // Client-side filtering guarantee if backend ignores filters
  const coursesList = rawCourses.filter((c) => {
    if (statusChip !== 'All' && c.status !== statusChip) return false;
    if (typeChip !== 'All types' && c.type !== typeChip) return false;
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const match =
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.class && c.class.toLowerCase().includes(q)) ||
        (c.teacher && c.teacher.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const count = data?.count ?? coursesList.length;

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    refetch();
  };

  return (
    <div>
      <div className="pt">
        <h2>Courses</h2>
        <p>Search, view, and manage the course catalog</p>
      </div>

      <SearchBar
        placeholder="Search by name, code, class, or teacher..."
        value={searchInput}
        onChange={(val) => {
          setSearchInput(val);
          setSearchQuery('');
        }}
        onSearch={handleSearchClick}
        actionText="Add Course"
        onAction={() => setIsModalOpen(true)}
      />

      <Chips
        items={['All', 'Active', 'Inactive']}
        activeItem={statusChip}
        onSelect={setStatusChip}
      />

      {/* "Optional" type is removed per spec */}
      <Chips
        items={['All types', 'Core', 'Elective']}
        activeItem={typeChip}
        onSelect={setTypeChip}
      />

      <ViewToggle
        total={count}
        label="courses"
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
          <b style={{ color: '#C23A52' }}>Failed to load courses</b>
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
      ) : coursesList.length === 0 ? (
        <EmptyState title="No courses found" description="Try a different search term or course type." />
      ) : (
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {coursesList.map((c) => {
            const hasMaterialsOrAssignments = c.materialsCount != null || c.assignmentsCount != null;
            const hasQuizzesOrExams = c.quizzesCount != null || c.examsCount != null;

            return (
              <div key={c.id} className="cd">
                <div className="row">
                  <span
                    className="tl"
                    style={{
                      flexDirection: 'column',
                      fontSize: '13px',
                      lineHeight: '1.1',
                      background: 'rgba(70,140,190,.12)',
                      color: '#2A6E9C',
                    }}
                  >
                    <small style={{ fontSize: '7px' }}>{c.code}</small>
                    {c.shortCode}
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
                  <Tag color="b">{c.type}</Tag>
                  <Tag>{c.class}</Tag>
                  <Tag>{c.enrolled} enrolled</Tag>
                </div>

                <p>{c.description}</p>

                {hasMaterialsOrAssignments && (
                  <p>
                    {c.materialsCount || 0} materials · {c.assignmentsCount || 0} assignments
                  </p>
                )}

                <div className="row">
                  {hasQuizzesOrExams && (
                    <span style={{ color: 'var(--mute)', fontSize: '12px' }}>
                      {c.quizzesCount || 0} quizzes · {c.examsCount || 0} exams
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="ghost"
                      style={{ margin: 0 }}
                      onClick={() => navigate(`/courses/${c.id}`)}
                    >
                      View Course
                    </button>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
