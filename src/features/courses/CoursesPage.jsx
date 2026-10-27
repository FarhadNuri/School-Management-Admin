import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RotateCcw, Trash2, Users, BookOpen, GraduationCap } from 'lucide-react';
import {
  SearchBar,
  ViewToggle,
  Tag,
  EmptyState,
  CardSkeleton,
  ConfirmModal,
  useToast,
} from '../../components/ui';
import { CourseModal } from './CourseModal';
import { useCourses, useDeleteCourse } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

function getCourseGrade(course) {
  if (course.grade) {
    const g = String(course.grade).trim();
    if (g.includes('6')) return 'Class 6';
    if (g.includes('7')) return 'Class 7';
    if (g.includes('8')) return 'Class 8';
  }
  const text = `${course.class || ''} ${course.name || ''} ${course.code || ''}`.toLowerCase();
  if (text.includes('6') || text.includes('six')) return 'Class 6';
  if (text.includes('7') || text.includes('seven')) return 'Class 7';
  if (text.includes('8') || text.includes('eight')) return 'Class 8';
  return 'Other';
}

export function CoursesPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const deleteCourseMutation = useDeleteCourse();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class 6');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  const currentSearch = searchQuery !== '' ? searchQuery : debouncedSearch;

  const { data, isLoading, isError, error, refetch } = useCourses({
    search: currentSearch,
  });

  const rawCourses = data?.courses || [];

  // Client-side filtering by selected class and search
  const coursesList = rawCourses.filter((c) => {
    if (getCourseGrade(c) !== selectedClass) return false;
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

  const count = coursesList.length;

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    refetch();
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await deleteCourseMutation.mutateAsync(courseToDelete.id);
      addToast(`Subject "${courseToDelete.name}" deleted successfully.`);
      setCourseToDelete(null);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete subject', 'error');
    }
  };

  const renderCourseCard = (c) => (
    <div key={c.id} className="cd">
      <div className="cd-top">
        {c.coverImage ? (
          <img
            src={c.coverImage}
            alt={c.name}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              objectFit: 'cover',
              flex: 'none',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <span
          className="tl"
          style={{
            display: c.coverImage ? 'none' : 'flex',
            flexDirection: 'column',
            fontSize: '13px',
            lineHeight: '1.1',
            background: 'rgba(70,140,190,.12)',
            color: '#2A6E9C',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            placeItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <small style={{ fontSize: '7px' }}>{c.code}</small>
          {c.shortCode}
        </span>
        <div className="cd-top-info">
          <h3 className="cd-title" title={c.name}>{c.name}</h3>
          <p className="cd-sub" title={c.teacher}>
            <User size={13} strokeWidth={1.8} />
            {c.teacher && c.teacher !== '—' ? c.teacher : 'No teacher assigned'}
          </p>
        </div>
        <Tag color={c.isActive ? 'g' : 'a'} style={{ marginLeft: 'auto', flexShrink: 0 }}>
          {c.status}
        </Tag>
      </div>

      <div className="cd-tags">
        {c.type && c.type !== '—' && <Tag color="b">{c.type}</Tag>}
        {c.class && c.class !== '—' && <Tag>{c.class}</Tag>}
        <Tag icon={<Users size={11} strokeWidth={1.8} style={{ marginRight: '4px' }} />}>
          {c.enrolled || 0} enrolled
        </Tag>
      </div>

      <div className="cd-body" style={{ minHeight: '38px' }}>
        {c.description && c.description !== '—' ? (
          c.description
        ) : (
          <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Standard academic curriculum subject.</span>
        )}
      </div>

      <div className="cd-footer">
        <span className="cd-meta" title={c.code}>
          <BookOpen size={13} strokeWidth={1.8} />
          <span>{c.code || 'Subject'}</span>
        </span>
        <div className="cd-actions">
          <button
            type="button"
            className="cd-btn-delete"
            onClick={() => setCourseToDelete(c)}
            title="Delete Subject"
            aria-label={`Delete ${c.name}`}
          >
            <Trash2 size={14} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="cd-btn-view"
            onClick={() => navigate(`/courses/${c.id}`)}
          >
            View Subject
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="pt">
        <h2>Subjects</h2>
        <p>Search, view, and manage curriculum subjects for Class 6 to 8</p>
      </div>

      <SearchBar
        placeholder="Search by name, code, class, or teacher..."
        value={searchInput}
        onChange={(val) => {
          setSearchInput(val);
          setSearchQuery('');
        }}
        onSearch={handleSearchClick}
        actionText="Add Subject"
        onAction={() => setIsModalOpen(true)}
      />

      {/* Class / Grade Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['Class 6', 'Class 7', 'Class 8'].map((cls) => {
          const isSelected = selectedClass === cls;
          const countForCls = rawCourses.filter((c) => {
            if (getCourseGrade(c) !== cls) return false;
            if (currentSearch) {
              const q = currentSearch.toLowerCase();
              return (
                (c.name && c.name.toLowerCase().includes(q)) ||
                (c.code && c.code.toLowerCase().includes(q)) ||
                (c.class && c.class.toLowerCase().includes(q)) ||
                (c.teacher && c.teacher.toLowerCase().includes(q))
              );
            }
            return true;
          }).length;

          return (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              style={{
                padding: '9px 20px',
                borderRadius: '14px',
                font: isSelected ? '700 13px Manrope, sans-serif' : '600 13px Manrope, sans-serif',
                background: isSelected ? 'linear-gradient(135deg, var(--p1), var(--p2))' : 'var(--card)',
                color: isSelected ? '#fff' : 'var(--ink)',
                border: isSelected ? '1px solid transparent' : '1px solid var(--line)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isSelected ? '0 6px 16px rgba(15, 59, 68, 0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{cls}</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'var(--soft)',
                  color: isSelected ? '#fff' : 'var(--mute)',
                  fontWeight: 700,
                }}
              >
                {countForCls}
              </span>
            </button>
          );
        })}
      </div>

      <ViewToggle
        total={count}
        label="subjects"
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
          <b style={{ color: '#C23A52' }}>Failed to load subjects</b>
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
        <EmptyState
          title={`No subjects found in ${selectedClass}`}
          description={`There are currently no subjects listed for ${selectedClass}. Click "Add Subject" above to add one.`}
        />
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <GraduationCap size={18} strokeWidth={2} style={{ color: 'var(--p1)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
              {selectedClass} Curriculum
            </h3>
            <span className="tg b" style={{ fontSize: '11px' }}>
              {coursesList.length} {coursesList.length === 1 ? 'Subject' : 'Subjects'}
            </span>
          </div>
          <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
            {coursesList.map(renderCourseCard)}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDeleteCourse}
        title="Delete Subject"
        message={`Are you sure you want to delete "${courseToDelete?.name}" (${courseToDelete?.code})? This will unassign the subject from any linked class section. This action cannot be undone.`}
        confirmText="Delete Subject"
        confirmColor="#C23A52"
        isLoading={deleteCourseMutation.isPending}
      />

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
