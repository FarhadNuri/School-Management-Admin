import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Trash2, Mail, GraduationCap, BookOpen } from 'lucide-react';
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
import { EnrollTeacherWizard } from './EnrollTeacherWizard';
import { useTeachers, useDeleteTeacher, useCourses } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

export function TeachersPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const deleteTeacherMutation = useDeleteTeacher();

  const debouncedSearch = useDebounce(searchInput, 400);

  const isActiveParam =
    statusChip === 'Active' ? 'true' : statusChip === 'Inactive' ? 'false' : undefined;

  const currentSearch = searchQuery !== '' ? searchQuery : debouncedSearch;

  const { data, isLoading, isError, error, refetch } = useTeachers({
    search: currentSearch,
    isActive: isActiveParam,
  });

  const { data: coursesData } = useCourses();
  const allCourses = coursesData?.courses || [];

  const teachers = data?.teachers || [];
  const count = data?.count ?? teachers.length;

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    refetch();
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    try {
      await deleteTeacherMutation.mutateAsync(teacherToDelete.id);
      addToast(`Teacher "${teacherToDelete.name}" deleted successfully.`);
      setTeacherToDelete(null);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete teacher', 'error');
    }
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
              <div className="cd-top">
                <Avatar index={idx + 1} size={44} radius={12} src={t.photo} />
                <div className="cd-top-info">
                  <h3 className="cd-title" title={t.name}>{t.name}</h3>
                  <p className="cd-sub" title={t.qualification}>
                    <GraduationCap size={13} strokeWidth={1.8} />
                    {t.qualification && t.qualification !== '—' ? t.qualification : 'Faculty Member'}
                  </p>
                </div>
                <Tag
                  color={t.isActive ? 'g' : 'a'}
                  style={{ marginLeft: 'auto', flexShrink: 0 }}
                >
                  {t.status}
                </Tag>
              </div>

              {(() => {
                const fallbackMatched = allCourses
                  .filter((c) => {
                    const matchId = (c.teacherIds || []).includes(t.id) || (c.teachers || []).some((th) => String(th.id || th._id) === t.id);
                    const matchName = c.teacher && c.teacher !== '—' && c.teacher.toLowerCase() === t.name.toLowerCase();
                    return matchId || matchName;
                  });

                const codes = (t.assignedSubjectCodes && t.assignedSubjectCodes.length > 0)
                  ? t.assignedSubjectCodes
                  : fallbackMatched.map((c) => c.code || c.name);

                const fullNames = (t.assignedSubjectNames && t.assignedSubjectNames.length > 0)
                  ? t.assignedSubjectNames
                  : fallbackMatched.map((c) => c.name);

                const hasAssigned = codes.length > 0;

                return (
                  <>
                    <div className="cd-tags">
                      {t.city && t.city !== '—' && <Tag>{t.city}</Tag>}
                      {t.classesCount && t.classesCount !== '—' && <Tag color="b">{t.classesCount}</Tag>}
                      {hasAssigned && (
                        <Tag color="p" icon={<BookOpen size={11} strokeWidth={1.8} style={{ marginRight: '4px' }} />}>
                          {codes.length} subject{codes.length === 1 ? '' : 's'}
                        </Tag>
                      )}
                    </div>

                    <div style={{ marginTop: '2px' }}>
                      <div
                        style={{
                          fontSize: '10.5px',
                          color: 'var(--mute)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '5px',
                        }}
                      >
                        Assigned Courses
                      </div>
                      {hasAssigned ? (
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--ink)',
                            padding: '6px 10px',
                            background: 'rgba(70, 140, 190, 0.08)',
                            borderRadius: '8px',
                            border: '1px solid rgba(70, 140, 190, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={fullNames.join(', ')}
                        >
                          <BookOpen size={13} strokeWidth={1.8} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700, letterSpacing: '0.3px' }}>
                            {codes.join(', ')}
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--mute)',
                            padding: '6px 10px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            border: '1px dashed var(--line)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <BookOpen size={13} strokeWidth={1.8} />
                          <span>No subjects assigned</span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              <div className="cd-footer">
                <span className="cd-meta" title={t.email && t.email !== '—' ? t.email : ''}>
                  <Mail size={13} strokeWidth={1.8} />
                  <span>{t.email && t.email !== '—' ? t.email : 'No email'}</span>
                </span>
                <div className="cd-actions">
                  <button
                    type="button"
                    className="cd-btn-delete"
                    onClick={() => setTeacherToDelete(t)}
                    title="Delete Teacher"
                    aria-label={`Delete ${t.name}`}
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    className="cd-btn-view"
                    onClick={() => navigate(`/teachers/${t.id}`)}
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
        isOpen={Boolean(teacherToDelete)}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={handleDeleteTeacher}
        title="Delete Teacher"
        message={`Are you sure you want to permanently delete "${teacherToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Teacher"
        confirmColor="#C23A52"
        isLoading={deleteTeacherMutation.isPending}
      />

      <EnrollTeacherWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
