import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, BookOpen, Edit3, RotateCcw } from 'lucide-react';
import {
  BackLink,
  Tag,
  InfoCard,
  Skeleton,
} from '../../components/ui';
import { CourseModal } from './CourseModal';
import { useCourse } from '../../hooks/queries';

export function CourseDetailPage() {
  const { id } = useParams();
  const { data: course, isLoading, isError, error, refetch } = useCourse(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div>
        <BackLink to="/courses" label="Back to courses" />
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
        <BackLink to="/courses" label="Back to courses" />
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px', marginTop: '12px' }}>
          <b style={{ color: '#C23A52' }}>Course record not found</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Could not load course details'}</p>
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

  return (
    <div>
      <div className="row" style={{ marginBottom: '14px' }}>
        <BackLink to="/courses" label="Back to courses" />
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="pb"
            style={{ height: '40px' }}
            onClick={() => setIsEditOpen(true)}
          >
            <Edit3 size={15} strokeWidth={1.8} /> Edit Course
          </button>
        </span>
      </div>

      <div className="cd" style={{ marginBottom: '14px' }}>
        <div className="row" style={{ alignItems: 'flex-start', gap: '18px' }}>
          <span
            className="tl"
            style={{
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
          <small style={{ color: 'var(--mute)' }}>COURSE TYPE</small>
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
          title="COURSE SPECIFICATION"
          rows={[
            ['Course Title', course.name],
            ['Catalog Code', course.code],
            ['Assigned Section', course.class],
            ['Instructor', course.teacher],
          ]}
        />
        <InfoCard
          title="CURRICULUM & SYLLABUS"
          rows={[
            ['Course Type', course.type],
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

      <CourseModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={course}
      />
    </div>
  );
}
