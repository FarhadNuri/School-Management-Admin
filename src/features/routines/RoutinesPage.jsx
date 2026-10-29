import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  Calendar,
  Clock,
  School,
  User,
  RotateCcw,
} from 'lucide-react';
import {
  SearchBar,
  Chips,
  Tag,
  Avatar,
  ClassImageTile,
  BackLink,
  CardSkeleton,
  EmptyState,
} from '../../components/ui';
import { useRoutines, useClasses, useTeachers } from '../../hooks/queries';
import { RoutineEditModal } from './RoutineEditModal';

export function RoutinesPage() {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Student Routines' | 'Teacher Routines'
  const [search, setSearch] = useState('');
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const {
    data: routinesData,
    isLoading: isLoadingRoutines,
    isError: isRoutinesError,
    error: routinesError,
    refetch: refetchRoutines,
  } = useRoutines();

  const { data: classesData } = useClasses();
  const { data: teachersData } = useTeachers();

  const allRoutines = Array.isArray(routinesData)
    ? routinesData
    : routinesData?.routines || [];

  const classRoutines = allRoutines.filter((r) => r.type === 'class');
  const teacherRoutines = allRoutines.filter((r) => r.type === 'teacher');

  const classesList = classesData?.classes || [];
  const teachersList = teachersData?.teachers || [];

  // Map class code -> full Class object
  const classMap = useMemo(() => {
    const map = {};
    classesList.forEach((c) => {
      if (c.code) map[c.code] = c;
      if (c.id) map[c.id] = c;
    });
    return map;
  }, [classesList]);

  // Filtered Student Routines
  const filteredClassRoutines = useMemo(() => {
    if (!search.trim()) return classRoutines;
    const q = search.toLowerCase();
    return classRoutines.filter((r) => {
      const classDoc = r.class || {};
      const titleMatch = r.title?.toLowerCase().includes(q);
      const nameMatch = classDoc.className?.toLowerCase().includes(q);
      const codeMatch = classDoc.classCode?.toLowerCase().includes(q);
      return titleMatch || nameMatch || codeMatch;
    });
  }, [classRoutines, search]);

  // Filtered Teacher Routines
  const filteredTeacherRoutines = useMemo(() => {
    if (!search.trim()) return teacherRoutines;
    const q = search.toLowerCase();
    return teacherRoutines.filter((r) => {
      const teacherDoc = r.teacher || {};
      const teacherUser = teacherDoc.user || {};
      const fullName = `${teacherUser.firstName || ''} ${teacherUser.lastName || ''}`.trim();
      const titleMatch = r.title?.toLowerCase().includes(q);
      const nameMatch = fullName.toLowerCase().includes(q);
      const emailMatch = teacherUser.email?.toLowerCase().includes(q);
      return titleMatch || nameMatch || emailMatch;
    });
  }, [teacherRoutines, search]);

  const handleOpenRoutine = (routine) => {
    setSelectedRoutine(routine);
    setIsModalOpen(true);
  };

  const isLoading = isLoadingRoutines;
  const isError = isRoutinesError;

  return (
    <div>
      {/* Page Header */}
      <div className="pt">
        <h2>Routines & Schedules</h2>
        <p>Search, view, and update class and faculty timetables</p>
      </div>

      {/* Tabs Filter Chips */}
      <div style={{ marginBottom: '18px' }}>
        <Chips
          items={[
            'Overview',
            `Student Routines (${classRoutines.length})`,
            `Teacher Routines (${teacherRoutines.length})`,
          ]}
          activeItem={
            activeTab === 'Overview'
              ? 'Overview'
              : activeTab.startsWith('Student')
              ? `Student Routines (${classRoutines.length})`
              : `Teacher Routines (${teacherRoutines.length})`
          }
          onSelect={(item) => {
            if (item.startsWith('Student')) setActiveTab('Student Routines');
            else if (item.startsWith('Teacher')) setActiveTab('Teacher Routines');
            else setActiveTab('Overview');
            setSearch('');
          }}
        />
      </div>

      {/* Search Bar when in Student or Teacher subviews */}
      {activeTab !== 'Overview' && (
        <SearchBar
          placeholder={
            activeTab === 'Student Routines'
              ? 'Search by class name, grade, or code...'
              : 'Search teacher by name or email...'
          }
          value={search}
          onChange={setSearch}
        />
      )}

      {/* Subheader / Counter */}
      {activeTab !== 'Overview' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 16px' }}>
          <BackLink label="Back to Overview" onClick={() => setActiveTab('Overview')} />
          <span style={{ fontSize: '13px', color: 'var(--mute)' }}>
            Showing{' '}
            <b style={{ color: 'var(--ink)' }}>
              {activeTab === 'Student Routines'
                ? filteredClassRoutines.length
                : filteredTeacherRoutines.length}
            </b>{' '}
            {activeTab === 'Student Routines' ? 'class routines' : 'teacher routines'}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="gr">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px' }}>
          <b style={{ color: '#C23A52' }}>Failed to load routines</b>
          <p style={{ color: 'var(--mute)' }}>{routinesError?.message || 'Server error'}</p>
          <div>
            <button
              type="button"
              className="pb"
              style={{ width: 'fit-content', margin: '0 auto' }}
              onClick={() => refetchRoutines()}
            >
              <RotateCcw size={15} strokeWidth={1.8} /> Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ================= VIEW 1: OVERVIEW (2 Cards) ================= */}
          {activeTab === 'Overview' && (
            <div className="gr" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
              {/* Card 1: Student Routines */}
              <div className="cd">
                <div className="cd-top">
                  <span
                    className="dt"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(30,111,120,0.15)',
                    }}
                  >
                    <GraduationCap size={22} style={{ color: 'var(--p1)' }} strokeWidth={2} />
                  </span>
                  <div className="cd-top-info">
                    <h3 className="cd-title">Student Routines</h3>
                    <p className="cd-sub" title="Class 6, 7 & 8 Sections">
                      <School size={13} strokeWidth={1.8} />
                      Class 6, 7 & 8 (7 Sections)
                    </p>
                  </div>
                  <Tag color="g" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    7 Published
                  </Tag>
                </div>

                <div className="cd-tags">
                  <Tag color="b">7 Sections</Tag>
                  <Tag>6 periods / day</Tag>
                  <Tag>Sunday – Thursday</Tag>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--mute)' }}>
                  <Calendar size={13} strokeWidth={1.8} />
                  <span>2025/2026 academic year</span>
                </div>

                <div className="cd-footer">
                  <span className="cd-meta" title="7 Class Sections">
                    <span>7 Sections</span>
                  </span>
                  <div className="cd-actions">
                    <button
                      type="button"
                      className="cd-btn-view"
                      onClick={() => setActiveTab('Student Routines')}
                    >
                      Show Details →
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Teacher Routines */}
              <div className="cd">
                <div className="cd-top">
                  <span
                    className="dt"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(245, 158, 108, 0.15)',
                    }}
                  >
                    <Users size={22} style={{ color: '#B25E29' }} strokeWidth={2} />
                  </span>
                  <div className="cd-top-info">
                    <h3 className="cd-title">Teacher Routines</h3>
                    <p className="cd-sub" title="13 Faculty Members">
                      <User size={13} strokeWidth={1.8} />
                      13 Faculty Members
                    </p>
                  </div>
                  <Tag color="a" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    13 Assigned
                  </Tag>
                </div>

                <div className="cd-tags">
                  <Tag color="b">13 Faculty</Tag>
                  <Tag>Dual-Sync Active</Tag>
                  <Tag>Free Period Tracking</Tag>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--mute)' }}>
                  <Clock size={13} strokeWidth={1.8} />
                  <span>Weekly Faculty Teaching Load</span>
                </div>

                <div className="cd-footer">
                  <span className="cd-meta" title="13 Teachers">
                    <span>13 Teachers</span>
                  </span>
                  <div className="cd-actions">
                    <button
                      type="button"
                      className="cd-btn-view"
                      onClick={() => setActiveTab('Teacher Routines')}
                    >
                      Show Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 2: STUDENT ROUTINES ================= */}
          {activeTab === 'Student Routines' && (
            filteredClassRoutines.length === 0 ? (
              <EmptyState title="No routines found" description="Try searching with another class name or grade." />
            ) : (
              <div className="gr">
                {filteredClassRoutines.map((routine) => {
                  const classDoc = routine.class || {};
                  const matchedClass = classMap[classDoc.classCode] || classMap[classDoc._id] || {};
                  const grade = matchedClass.grade || classDoc.grade || (classDoc.className?.includes('8') ? 8 : classDoc.className?.includes('7') ? 7 : 6);
                  const teacherName = matchedClass.teacher && matchedClass.teacher !== '—'
                    ? matchedClass.teacher
                    : 'Class Teacher Assigned';

                  return (
                    <div key={routine._id} className="cd">
                      <div className="cd-top">
                        <ClassImageTile
                          src={matchedClass.coverImage}
                          grade={grade}
                          size={44}
                          radius={12}
                          alt={classDoc.className || routine.title}
                        />
                        <div className="cd-top-info">
                          <h3 className="cd-title" title={classDoc.className || routine.title}>
                            {classDoc.className || routine.title}
                          </h3>
                          <p className="cd-sub" title={teacherName}>
                            <User size={13} strokeWidth={1.8} />
                            {teacherName}
                          </p>
                        </div>
                        <Tag color="g" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                          Active
                        </Tag>
                      </div>

                      <div className="cd-tags">
                        <Tag color="b">Grade {grade}</Tag>
                        <Tag>{matchedClass.enrolled || 25} enrolled</Tag>
                        <Tag>6 periods / day</Tag>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--mute)' }}>
                        <Calendar size={13} strokeWidth={1.8} />
                        <span>{routine.academicYear || matchedClass.academicYear || '2025/2026 academic year'}</span>
                      </div>

                      <div className="cd-footer">
                        <span className="cd-meta" title={classDoc.classCode}>
                          <span>{classDoc.classCode || 'CLASS'}</span>
                        </span>
                        <div className="cd-actions">
                          <button
                            type="button"
                            className="cd-btn-view"
                            onClick={() => handleOpenRoutine(routine)}
                          >
                            View Routine
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ================= VIEW 3: TEACHER ROUTINES ================= */}
          {activeTab === 'Teacher Routines' && (
            filteredTeacherRoutines.length === 0 ? (
              <EmptyState title="No teachers found" description="Try adjusting your search query." />
            ) : (
              <div className="gr">
                {filteredTeacherRoutines.map((routine, idx) => {
                  const teacherDoc = routine.teacher || {};
                  const teacherUser = teacherDoc.user || {};
                  const fullName = [teacherUser.firstName, teacherUser.lastName].filter(Boolean).join(' ') || routine.title;

                  // Find assigned teaching periods count & unique sections
                  let assignedCount = 0;
                  const sectionsSet = new Set();
                  (routine.schedule || []).forEach((day) => {
                    (day.periods || []).forEach((p) => {
                      if (p.subject && p.subject !== 'Free Period' && p.subject !== '—') {
                        assignedCount++;
                        if (p.sectionName) sectionsSet.add(p.sectionName);
                      }
                    });
                  });

                  const sectionsList = Array.from(sectionsSet);

                  return (
                    <div key={routine._id} className="cd">
                      <div className="cd-top">
                        <Avatar
                          index={idx + 1}
                          size={44}
                          radius={12}
                          src={teacherUser.photo}
                          name={fullName}
                        />
                        <div className="cd-top-info">
                          <h3 className="cd-title" title={fullName}>
                            {fullName}
                          </h3>
                          <p className="cd-sub" title={teacherUser.email}>
                            <User size={13} strokeWidth={1.8} />
                            {teacherUser.email || 'Faculty Member'}
                          </p>
                        </div>
                        <Tag color="g" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                          Active
                        </Tag>
                      </div>

                      <div className="cd-tags">
                        <Tag color="b">{assignedCount} periods / wk</Tag>
                        <Tag>{30 - assignedCount} free periods</Tag>
                        <Tag>5 days / wk</Tag>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--mute)' }}>
                        <School size={13} strokeWidth={1.8} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sectionsList.length > 0 ? sectionsList.join(', ') : 'Faculty Schedule'}
                        </span>
                      </div>

                      <div className="cd-footer">
                        <span className="cd-meta" title={`Teacher T${idx + 1}`}>
                          <span>T{idx + 1}</span>
                        </span>
                        <div className="cd-actions">
                          <button
                            type="button"
                            className="cd-btn-view"
                            onClick={() => handleOpenRoutine(routine)}
                          >
                            View Routine
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </>
      )}

      {/* Routine Detail & Edit Modal */}
      <RoutineEditModal
        routine={selectedRoutine}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRoutine(null);
        }}
      />
    </div>
  );
}
