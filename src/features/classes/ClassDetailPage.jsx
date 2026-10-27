import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Edit3, RotateCcw, Trash2 } from 'lucide-react';
import {
  BackLink,
  Tag,
  InfoCard,
  Skeleton,
  ClassImageTile,
  ConfirmModal,
  useToast,
} from '../../components/ui';
import { ClassModal } from './ClassModal';
import { useClass, useDeleteClass } from '../../hooks/queries';

export function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: classData, isLoading, isError, error, refetch } = useClass(id);
  const deleteClassMutation = useDeleteClass();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div>
        <BackLink to="/classes" label="Back to classes" />
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

  if (isError || !classData) {
    return (
      <div>
        <BackLink to="/classes" label="Back to classes" />
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px', marginTop: '12px' }}>
          <b style={{ color: '#C23A52' }}>Class record not found</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Could not load class details'}</p>
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

  const capacityNum = Number(classData.capacity) || 30;
  const enrolledNum = Number(classData.enrolled) || 0;
  const utilization = Math.min(100, Math.round((enrolledNum / capacityNum) * 100));

  const teacherNames = (classData.teachers || []).map((t) => {
    if (t.user) return `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim();
    return t.name || 'Teacher';
  }).filter(Boolean);

  const courseNames = (classData.courses || []).map((c) => {
    return `${c.courseName || c.name || 'Subject'} (${c.courseCode || c.code || ''})`;
  });

  const handleDeleteClass = async () => {
    try {
      await deleteClassMutation.mutateAsync(id);
      addToast(`Class "${classData.name}" deleted successfully.`);
      setIsDeleteOpen(false);
      navigate('/classes');
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete class', 'error');
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: '14px' }}>
        <BackLink to="/classes" label="Back to classes" />
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="ghost"
            style={{ margin: 0, color: '#C23A52', borderColor: 'rgba(194, 58, 82, 0.3)', height: '40px' }}
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 size={15} strokeWidth={1.8} /> Delete Class
          </button>
          <button
            type="button"
            className="pb"
            style={{ height: '40px' }}
            onClick={() => setIsEditOpen(true)}
          >
            <Edit3 size={15} strokeWidth={1.8} /> Edit Class
          </button>
        </span>
      </div>

      <div className="cd" style={{ marginBottom: '14px' }}>
        <div className="row" style={{ alignItems: 'flex-start', gap: '18px' }}>
          <ClassImageTile
            src={classData.coverImage}
            grade={classData.grade}
            size={64}
            radius={18}
            alt={classData.name}
          />
          <div>
            <h2 style={{ fontSize: '30px' }}>{classData.name}</h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={14} strokeWidth={1.8} /> {classData.teacher} · <Calendar size={14} strokeWidth={1.8} />{' '}
              {classData.academicYear}
            </p>
          </div>
          <Tag color={classData.isActive ? 'g' : 'a'} style={{ marginLeft: 'auto' }}>
            {classData.status}
          </Tag>
        </div>
      </div>

      <div className="k3">
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>STATUS</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {classData.status}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>ENROLLED STUDENTS</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {classData.enrolled}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>SUBJECTS ASSIGNED</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {classData.coursesCount}
          </b>
        </div>
      </div>

      <div className="k2">
        <InfoCard
          title="CLASS SECTION DETAILS"
          rows={[
            ['Class Name', classData.name],
            ['Section Code', classData.code],
            ['Cohort Grade', `Grade ${classData.grade}`],
            ['Academic Session', classData.academicYear],
            ['Max Capacity', `${classData.capacity} Students`],
          ]}
        />
        <InfoCard
          title="TEACHERS & SUBJECTS"
          rows={[
            ['Assigned Teachers', teacherNames.length > 0 ? teacherNames.join(', ') : 'None assigned'],
            ['Assigned Subjects', courseNames.length > 0 ? courseNames.join(', ') : 'None assigned'],
            ['Current Utilization', `${utilization}% (${enrolledNum}/${capacityNum})`],
          ]}
        />
      </div>

      <div className="k2">
        <InfoCard
          title="OVERVIEW & DESCRIPTION"
          rows={[
            ['Cohort description', classData.description !== '—' ? classData.description : 'Standard academic cohort'],
            ['Enrollment status', enrolledNum >= capacityNum ? 'Cohort Full' : 'Open for enrollment'],
          ]}
        />
        <InfoCard
          title="ADMINISTRATIVE ACTIONS"
          rows={[
            ['Attendance Tracking', 'Daily digital register enabled'],
            ['Parent Portal', 'Visible to enrolled guardians'],
            ['Grade Posting', 'Term reports published online'],
          ]}
        />
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteClass}
        title="Delete Class"
        message={`Are you sure you want to delete "${classData.name}"? This will unassign all teachers, subjects, and students associated with this class. This action cannot be undone.`}
        confirmText="Delete Class"
        confirmColor="#C23A52"
        isLoading={deleteClassMutation.isPending}
      />

      <ClassModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={classData}
      />
    </div>
  );
}
