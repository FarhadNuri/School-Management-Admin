import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, BookOpen, Edit3, RotateCcw, Trash2 } from 'lucide-react';
import {
  BackLink,
  Tag,
  InfoCard,
  Skeleton,
  ConfirmModal,
  useToast,
} from '../../components/ui';
import { CourseModal } from './CourseModal';
import { useCourse, useDeleteCourse } from '../../hooks/queries';

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: course, isLoading, isError, error, refetch } = useCourse(id);
  const deleteCourseMutation = useDeleteCourse();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div>
        <BackLink to="/courses" label="Back to subjects" />
        <div className="cd" style={{ padding: '24px', gap: '16px', marginTop: '12px' }}>
          <div className="row" style={{ gap: '18px' }}>
            <Skeleton width="64px" height="64px" borderRadius="18px" />
            <div style={{ flex: 1, display: 'grid', gap: '10px' }}>
              <Skeleton width="40%" height="28px" />
              <Skeleton width="60%" height="16px" />
              <Skeleton width="50%" height="36px" borderRadius="12px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div>
        <BackLink to="/courses" label="Back to subjects" />
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px', marginTop: '12px' }}>
          <b style={{ color: '#C23A52' }}>Subject record not found</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Could not load subject details'}</p>
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
      </div>
    );
  }

  const hasMaterialsOrAssignments = course.materialsCount != null || course.assignmentsCount != null;
  const hasQuizzesOrExams = course.quizzesCount != null || course.examsCount != null;

  const handleDeleteCourse = async () => {
    try {
      await deleteCourseMutation.mutateAsync(id);
      addToast(`Subject "${course.name}" deleted successfully.`);
      setIsDeleteOpen(false);
      navigate('/courses');
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete subject', 'error');
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: '14px' }}>
        <BackLink to="/courses" label="Back to subjects" />
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="ghost"
            style={{ margin: 0, color: '#C23A52', borderColor: 'rgba(194, 58, 82, 0.3)', height: '40px' }}
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 size={15} strokeWidth={1.8} /> Delete Subject
          </button>
          <button
            type="button"
            className="pb"
            style={{ height: '40px' }}
            onClick={() => setIsEditOpen(true)}
          >
            <Edit3 size={15} strokeWidth={1.8} /> Edit Subject
          </button>
        </span>
      </div>

      <div className="cd" style={{ marginBottom: '14px' }}>
        <div className="row" style={{ alignItems: 'flex-start', gap: '18px' }}>
          {course.coverImage ? (
            <img
              src={course.coverImage}
              alt={course.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
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
              display: course.coverImage ? 'none' : 'flex',
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              flexDirection: 'column',
              fontSize: '18px',
              lineHeight: '1.1',
              background: 'rgba(70,140,190,.12)',
              color: '#2A6E9C',
            }}
          >
            <small style={{ fontSize: '9px' }}>{course.code}</small>
            {course.shortCode}
          </span>
          <div>
            <h2 style={{ fontSize: '30px' }}>{course.name}</h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={14} strokeWidth={1.8} /> {course.teacher} · <BookOpen size={14} strokeWidth={1.8} />{' '}
              {course.class}
            </p>
            <p style={{ marginTop: '4px' }}>{course.description}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            <Tag color={course.isActive ? 'g' : 'a'}>{course.status}</Tag>
            <Tag color="b">{course.type}</Tag>
          </div>
        </div>
      </div>

      <div className="k3">
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>STATUS</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {course.status}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>SUBJECT TYPE</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {course.type}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>ENROLLED</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {course.enrolled}
          </b>
        </div>
      </div>

      <div className="k2">
        <InfoCard
          title="SUBJECT SPECIFICATION"
          rows={[
            ['Subject Title', course.name],
            ['Catalog Code', course.code],
            ['Assigned Section', course.class],
            ['Instructor', course.teacher],
          ]}
        />
        <InfoCard
          title="CURRICULUM & SYLLABUS"
          rows={[
            ['Subject Type', course.type],
            ['Status', course.status],
            ['Description', course.description],
          ]}
        />
      </div>

      {(hasMaterialsOrAssignments || hasQuizzesOrExams) && (
        <div className="k2">
          {hasMaterialsOrAssignments && (
            <InfoCard
              title="MATERIALS & RESOURCES"
              rows={[
                ['Lecture Handouts', `${course.materialsCount || 0} materials`],
                ['Active Assignments', `${course.assignmentsCount || 0} active`],
              ]}
            />
          )}
          {hasQuizzesOrExams && (
            <InfoCard
              title="ASSESSMENTS"
              rows={[
                ['Quizzes Conducted', `${course.quizzesCount || 0} quizzes`],
                ['Term Examinations', `${course.examsCount || 0} exams scheduled`],
              ]}
            />
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteCourse}
        title="Delete Subject"
        message={`Are you sure you want to delete "${course.name}" (${course.code})? This will unassign the subject from any linked class section. This action cannot be undone.`}
        confirmText="Delete Subject"
        confirmColor="#C23A52"
        isLoading={deleteCourseMutation.isPending}
      />

      <CourseModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={course}
      />
    </div>
  );
}
