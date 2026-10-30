import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MessageSquare, Ban, CheckCircle, Edit3, RotateCcw, Trash2, Key } from 'lucide-react';
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
import { EnrollStudentWizard } from './EnrollStudentWizard';
import { useStudent, useSetStudentStatus, useDeleteStudent, useResetStudentPassword } from '../../hooks/queries';

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: student, isLoading, isError, error, refetch } = useStudent(id);
  const setStatusMutation = useSetStudentStatus();
  const deleteStudentMutation = useDeleteStudent();
  const resetPasswordMutation = useResetStudentPassword();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [resetCredentials, setResetCredentials] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleResetPassword = async () => {
    try {
      const res = await resetPasswordMutation.mutateAsync(student.id);
      if (res?.credentials) {
        setResetCredentials(res.credentials);
        setResetEmailSent(Boolean(res.emailSent));
        addToast('Password reset successfully.');
      }
    } catch (err) {
      addToast(err?.message || 'Failed to reset password', 'error');
    }
  };

  if (isLoading) {
    return (
      <div>
        <BackLink to="/students" label="Back to students" />
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

  if (isError || !student) {
    return (
      <div>
        <BackLink to="/students" label="Back to students" />
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px', marginTop: '12px' }}>
          <b style={{ color: '#C23A52' }}>Student record not found</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Could not load student details'}</p>
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

  const handleToggleStatus = async () => {
    try {
      const nextStatus = !student.isActive;
      await setStatusMutation.mutateAsync({ id: student.id, isActive: nextStatus });
      addToast(nextStatus ? 'Student activated successfully.' : 'Student account banned.');
      setIsConfirmOpen(false);
    } catch (err) {
      addToast(err?.message || 'Failed to update student status.', 'error');
    }
  };

  const handleDeleteStudent = async () => {
    try {
      await deleteStudentMutation.mutateAsync(student.id);
      addToast(`Student "${student.name}" deleted successfully.`);
      setIsDeleteOpen(false);
      navigate('/students');
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete student', 'error');
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: '14px' }}>
        <BackLink to="/students" label="Back to students" />
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="ghost"
            style={{ margin: 0, color: '#C23A52', borderColor: 'rgba(194, 58, 82, 0.3)', height: '40px' }}
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 size={15} strokeWidth={1.8} /> Delete Student
          </button>
          <button
            type="button"
            className="ghost"
            style={{ margin: 0 }}
            onClick={() => setIsConfirmOpen(true)}
          >
            {student.isActive ? (
              <>
                <Ban size={15} strokeWidth={1.8} /> Ban User
              </>
            ) : (
              <>
                <CheckCircle size={15} strokeWidth={1.8} /> Activate User
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
            <Edit3 size={15} strokeWidth={1.8} /> Edit Student
          </button>
        </span>
      </div>

      <div className="cd" style={{ marginBottom: '14px' }}>
        <div className="row" style={{ alignItems: 'flex-start', gap: '18px' }}>
          <Avatar index={0} size={112} radius={22} src={student.photo} />
          <div>
            <h2 style={{ fontSize: '30px' }}>{student.name}</h2>
            <p>
              {student.class} · {student.classTeacher} · {student.city} · Admitted {student.admittedDate}
            </p>
            <div className="ca" style={{ marginTop: '12px' }}>
              {student.email && student.email !== '—' && (
                <a href={`mailto:${student.email}`}>
                  <span>
                    <Mail size={15} strokeWidth={1.8} /> Email
                  </span>
                </a>
              )}
              {student.phone && student.phone !== '—' && (
                <a href={`tel:${student.phone}`}>
                  <span>
                    <Phone size={15} strokeWidth={1.8} /> Call
                  </span>
                </a>
              )}
              {student.whatsapp && student.whatsapp !== '—' && (
                <a
                  href={`https://wa.me/${student.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="wa">
                    <MessageSquare size={15} strokeWidth={1.8} /> WhatsApp
                  </span>
                </a>
              )}
              {student.altPhone && student.altPhone !== '—' && (
                <a href={`tel:${student.altPhone}`}>
                  <span>
                    <Phone size={15} strokeWidth={1.8} /> Alt. Call
                  </span>
                </a>
              )}
            </div>
          </div>
          <Tag color={student.isActive ? 'g' : 'a'} style={{ marginLeft: 'auto' }}>
            {student.status}
          </Tag>
        </div>
      </div>

      <div className="k3">
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>STATUS</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {student.status}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>AGE</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {student.age}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>ID TYPE</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {student.idType}
          </b>
        </div>
      </div>

      <div className="k2">
        <InfoCard
          title="PERSONAL INFORMATION"
          rows={[
            ['Full name', student.name],
            ['Gender', student.gender],
            ['Date of birth', `${student.dob} (${student.age})`],
            ['ID type', student.idType],
            ['Emergency contact', student.emergencyContact],
          ]}
        />
        <InfoCard
          title="ACADEMIC INFORMATION"
          rows={[
            ['Class / Grade', student.class],
            ['Class teacher', student.classTeacher],
            ['Date of admission', student.admittedDate],
            ['Status', student.status],
          ]}
        />
      </div>

      <div className="k2">
        <InfoCard
          title="PARENT / GUARDIAN"
          rows={[
            ['Name', student.guardianName],
            ['Phone', student.guardianPhone],
            ['Relationship', student.guardianRel],
            ['Guardian Email', student.guardianEmail],
          ]}
        />
        <InfoCard
          title="ADDRESS"
          rows={[
            ['Street', student.street],
            ['City', student.city],
            ['State / Region', student.state],
            ['Country', student.country],
          ]}
        />
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleToggleStatus}
        title={student.isActive ? 'Ban Student Account' : 'Activate Student Account'}
        message={
          student.isActive
            ? `Are you sure you want to ban ${student.name}'s account? They will lose access to the portal.`
            : `Are you sure you want to activate ${student.name}'s account?`
        }
        confirmText={student.isActive ? 'Ban User' : 'Activate User'}
        confirmColor={student.isActive ? '#C23A52' : '#23895B'}
        isLoading={setStatusMutation.isPending}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Delete Student"
        message={`Are you sure you want to permanently delete "${student.name}"? This will delete all student records and unassign them from their class. This action cannot be undone.`}
        confirmText="Delete Student"
        confirmColor="#C23A52"
        isLoading={deleteStudentMutation.isPending}
      />

      <EnrollStudentWizard
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={student}
      />

      {resetCredentials && (
        <CredentialsModal
          isOpen={Boolean(resetCredentials)}
          onClose={() => setResetCredentials(null)}
          title="Password Reset Successful"
          subtitle="A new temporary password has been generated for this student."
          credentials={resetCredentials}
          emailSent={resetEmailSent}
        />
      )}
    </div>
  );
}
