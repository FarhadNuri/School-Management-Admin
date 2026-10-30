import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MessageSquare, Globe, Ban, CheckCircle, Edit3, RotateCcw, ExternalLink, Trash2, Key } from 'lucide-react';
import {
  BackLink,
  Avatar,
  Tag,
  InfoCard,
  ConfirmModal,
  CredentialsModal,
  Skeleton,
  useToast,
} from '../../components/ui';
import { EnrollTeacherWizard } from './EnrollTeacherWizard';
import { useTeacher, useSetTeacherStatus, useDeleteTeacher, useResetTeacherPassword, useCourses } from '../../hooks/queries';

export function TeacherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: teacher, isLoading, isError, error, refetch } = useTeacher(id);
  const { data: coursesData } = useCourses();
  const allCourses = coursesData?.courses || [];
  const setStatusMutation = useSetTeacherStatus();
  const deleteTeacherMutation = useDeleteTeacher();
  const resetPasswordMutation = useResetTeacherPassword();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [resetCredentials, setResetCredentials] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleResetPassword = async () => {
    try {
      const res = await resetPasswordMutation.mutateAsync(teacher.id);
      if (res?.credentials) {
        setResetCredentials(res.credentials);
        setResetEmailSent(Boolean(res.emailSent));
        addToast('Teacher password reset successfully.');
      }
    } catch (err) {
      addToast(err?.message || 'Failed to reset password', 'error');
    }
  };

  if (isLoading) {
    return (
      <div>
        <BackLink to="/teachers" label="Back to teachers" />
        <div className="cd" style={{ padding: '24px', gap: '16px', marginTop: '12px' }}>
          <div className="row" style={{ gap: '18px' }}>
            <Skeleton width="112px" height="112px" borderRadius="22px" />
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

  if (isError || !teacher) {
    return (
      <div>
        <BackLink to="/teachers" label="Back to teachers" />
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px', marginTop: '12px' }}>
          <b style={{ color: '#C23A52' }}>Teacher record not found</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Could not load teacher details'}</p>
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

  const fallbackAssignedCodes = allCourses
    .filter((c) => {
      if (!teacher) return false;
      const matchId = (c.teacherIds || []).includes(teacher.id) || (c.teachers || []).some((th) => String(th.id || th._id) === teacher.id);
      const matchName = c.teacher && c.teacher !== '—' && c.teacher.toLowerCase() === teacher.name.toLowerCase();
      return matchId || matchName;
    })
    .map((c) => c.code || c.name);

  const assignedSubjectCodes = (teacher?.assignedSubjectCodes && teacher.assignedSubjectCodes.length > 0)
    ? teacher.assignedSubjectCodes
    : fallbackAssignedCodes;

  const subjectsCount = assignedSubjectCodes.length;

  const handleToggleStatus = async () => {
    try {
      const nextStatus = !teacher.isActive;
      await setStatusMutation.mutateAsync({ id: teacher.id, isActive: nextStatus });
      addToast(nextStatus ? 'Teacher activated successfully.' : 'Teacher deactivated.');
      setIsConfirmOpen(false);
    } catch (err) {
      addToast(err?.message || 'Failed to update teacher status.', 'error');
    }
  };

  const handleDeleteTeacher = async () => {
    try {
      await deleteTeacherMutation.mutateAsync(teacher.id);
      addToast(`Teacher "${teacher.name}" deleted successfully.`);
      setIsDeleteOpen(false);
      navigate('/teachers');
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete teacher', 'error');
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: '14px' }}>
        <BackLink to="/teachers" label="Back to teachers" />
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="ghost"
            style={{ margin: 0, color: '#C23A52', borderColor: 'rgba(194, 58, 82, 0.3)', height: '40px' }}
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 size={15} strokeWidth={1.8} /> Delete Teacher
          </button>
          <button
            type="button"
            className="ghost"
            style={{ margin: 0 }}
            onClick={() => setIsConfirmOpen(true)}
          >
            {teacher.isActive ? (
              <>
                <Ban size={15} strokeWidth={1.8} /> Deactivate
              </>
            ) : (
              <>
                <CheckCircle size={15} strokeWidth={1.8} /> Activate
              </>
            )}
          </button>
          <button
            type="button"
            className="ghost"
            style={{ margin: 0, height: '40px' }}
            onClick={handleResetPassword}
            disabled={resetPasswordMutation.isPending}
          >
            <Key size={15} strokeWidth={1.8} /> {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
          </button>
          <button
            type="button"
            className="pb"
            style={{ height: '40px' }}
            onClick={() => setIsEditOpen(true)}
          >
            <Edit3 size={15} strokeWidth={1.8} /> Edit Teacher
          </button>
        </span>
      </div>

      <div className="cd" style={{ marginBottom: '14px' }}>
        <div className="row" style={{ alignItems: 'flex-start', gap: '18px' }}>
          <Avatar index={1} size={112} radius={22} src={teacher.photo} />
          <div>
            <h2 style={{ fontSize: '30px' }}>{teacher.name}</h2>
            <p>
              {teacher.qualification} · {teacher.city}
            </p>
            <div className="ca" style={{ marginTop: '12px' }}>
              {teacher.email && teacher.email !== '—' && (
                <a href={`mailto:${teacher.email}`}>
                  <span>
                    <Mail size={15} strokeWidth={1.8} /> Email
                  </span>
                </a>
              )}
              {teacher.phone && teacher.phone !== '—' && (
                <a href={`tel:${teacher.phone}`}>
                  <span>
                    <Phone size={15} strokeWidth={1.8} /> Call
                  </span>
                </a>
              )}
              {teacher.whatsapp && teacher.whatsapp !== '—' && (
                <a
                  href={`https://wa.me/${teacher.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="wa">
                    <MessageSquare size={15} strokeWidth={1.8} /> WhatsApp
                  </span>
                </a>
              )}
              {(teacher.website || teacher.socialMedia?.website) && (
                <a
                  href={
                    (teacher.website || teacher.socialMedia?.website).startsWith('http')
                      ? teacher.website || teacher.socialMedia?.website
                      : `https://${teacher.website || teacher.socialMedia?.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    <Globe size={15} strokeWidth={1.8} /> Website
                  </span>
                </a>
              )}
              {teacher.altPhone && teacher.altPhone !== '—' && (
                <a href={`tel:${teacher.altPhone}`}>
                  <span>
                    <Phone size={15} strokeWidth={1.8} /> Alt. Call
                  </span>
                </a>
              )}
            </div>
          </div>
          <Tag
            color={teacher.isActive ? 'g' : 'a'}
            style={{ marginLeft: 'auto' }}
          >
            {teacher.status}
          </Tag>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>STATUS</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {teacher.status}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>QUALIFICATION</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {teacher.qualification}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>CLASSES</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {teacher.classesCount}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>ASSIGNED SUBJECTS</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {subjectsCount} {subjectsCount === 1 ? 'Subject' : 'Subjects'}
          </b>
        </div>
      </div>

      <div className="k2">
        <InfoCard
          title="PERSONAL INFORMATION"
          rows={[
            ['Full name', teacher.name],
            ['Staff ID', teacher.id],
            ['Date of birth', teacher.dateOfBirth || '—'],
            ['Gender', teacher.gender],
            ['ID type', teacher.idType],
            [
              'ID documents',
              teacher.idFront || teacher.idBack ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {teacher.idFront && (
                    <a
                      href={teacher.idFront}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--acc-blue)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      Front <ExternalLink size={12} />
                    </a>
                  )}
                  {teacher.idBack && (
                    <a
                      href={teacher.idBack}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--acc-blue)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      Back <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ) : 'None uploaded',
            ],
            ['Status', teacher.status],
          ]}
        />
        <InfoCard
          title="CREDENTIALS"
          rows={[
            ['Primary qualification', teacher.qualification],
            [
              'All qualifications',
              teacher.qualificationTitles?.join(', ') || '—',
            ],
            [
              'Certificates on file',
              teacher.qualifications?.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {teacher.qualifications.map((q, idx) => (
                    <a
                      key={idx}
                      href={q}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--acc-blue)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      {teacher.qualificationTitles?.[idx] || `Cert #${idx + 1}`} <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              ) : 'None uploaded',
            ],
          ]}
        />
      </div>

      <div className="k2">
        <InfoCard
          title="CONTACT INFORMATION"
          rows={[
            ['Email', teacher.email],
            ['Phone', teacher.phone],
            ['Alt. phone', teacher.altPhone],
            ['WhatsApp', teacher.whatsapp],
            [
              'Website',
              teacher.website || teacher.socialMedia?.website ? (
                <a
                  href={
                    (teacher.website || teacher.socialMedia?.website).startsWith('http')
                      ? teacher.website || teacher.socialMedia?.website
                      : `https://${teacher.website || teacher.socialMedia?.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--acc-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {teacher.website || teacher.socialMedia?.website} <ExternalLink size={12} />
                </a>
              ) : '—',
            ],
            [
              'LinkedIn',
              teacher.socialMedia?.linkedin ? (
                <a
                  href={
                    teacher.socialMedia.linkedin.startsWith('http')
                      ? teacher.socialMedia.linkedin
                      : `https://${teacher.socialMedia.linkedin}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--acc-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {teacher.socialMedia.linkedin} <ExternalLink size={12} />
                </a>
              ) : '—',
            ],
            [
              'Facebook',
              teacher.socialMedia?.facebook ? (
                <a
                  href={
                    teacher.socialMedia.facebook.startsWith('http')
                      ? teacher.socialMedia.facebook
                      : `https://${teacher.socialMedia.facebook}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--acc-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {teacher.socialMedia.facebook} <ExternalLink size={12} />
                </a>
              ) : '—',
            ],
            [
              'Twitter / X',
              teacher.socialMedia?.twitter ? (
                <a
                  href={
                    teacher.socialMedia.twitter.startsWith('http')
                      ? teacher.socialMedia.twitter
                      : `https://${teacher.socialMedia.twitter}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--acc-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {teacher.socialMedia.twitter} <ExternalLink size={12} />
                </a>
              ) : '—',
            ],
          ]}
        />
        <InfoCard
          title="ASSIGNED SUBJECTS, CLASSES & LOCATION"
          rows={[
            ['Assigned subjects', assignedSubjectCodes.length > 0 ? assignedSubjectCodes.join(', ') : 'No subjects assigned'],
            ['Classes', teacher.assignedClasses?.length > 0 ? teacher.assignedClasses.join(', ') : 'No classes assigned'],
            ['Street', teacher.street],
            ['City', teacher.city],
            ['Region / State', teacher.state],
            ['Country', teacher.country],
          ]}
        />
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleToggleStatus}
        title={teacher.isActive ? 'Deactivate Teacher' : 'Activate Teacher'}
        message={
          teacher.isActive
            ? `Are you sure you want to deactivate ${teacher.name}? They will no longer have access to the staff portal.`
            : `Are you sure you want to activate ${teacher.name}'s account?`
        }
        confirmText={teacher.isActive ? 'Deactivate' : 'Activate'}
        confirmColor={teacher.isActive ? '#C23A52' : '#23895B'}
        isLoading={setStatusMutation.isPending}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteTeacher}
        title="Delete Teacher"
        message={`Are you sure you want to permanently delete "${teacher.name}"? This will remove all qualifications, unassign them from classes and subjects. This action cannot be undone.`}
        confirmText="Delete Teacher"
        confirmColor="#C23A52"
        isLoading={deleteTeacherMutation.isPending}
      />

      <EnrollTeacherWizard
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={teacher}
      />

      {resetCredentials && (
        <CredentialsModal
          isOpen={Boolean(resetCredentials)}
          onClose={() => setResetCredentials(null)}
          title="Password Reset Successful"
          subtitle="A new temporary password has been generated for this teacher."
          credentials={resetCredentials}
          emailSent={resetEmailSent}
        />
      )}
    </div>
  );
}
