import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, MessageSquare, Ban, CheckCircle, Edit3, RotateCcw } from 'lucide-react';
import {
  BackLink,
  Avatar,
  Tag,
  InfoCard,
  Modal,
  FormField,
  FieldError,
  ConfirmModal,
  Skeleton,
  useToast,
} from '../../components/ui';
import { useGuardian, useSetGuardianStatus, useUpdateGuardian } from '../../hooks/queries';

export function GuardianDetailPage() {
  const { id } = useParams();
  const { addToast } = useToast();
  const { data: guardian, isLoading, isError, error, refetch } = useGuardian(id);
  const setStatusMutation = useSetGuardianStatus();
  const updateGuardianMutation = useUpdateGuardian();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    altPhone: '',
    whatsapp: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Ghana',
  });
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    if (guardian) {
      setEditForm({
        firstName: guardian.firstName || '',
        lastName: guardian.lastName || '',
        phone: guardian.phone !== '—' ? guardian.phone : '',
        altPhone: guardian.altPhone !== '—' ? guardian.altPhone : '',
        whatsapp: guardian.whatsapp !== '—' ? guardian.whatsapp : '',
        street: guardian.street !== '—' ? guardian.street : '',
        city: guardian.city !== '—' ? guardian.city.split(',')[0].trim() : '',
        state: guardian.state !== '—' ? guardian.state : '',
        zip: guardian.zip !== '—' ? guardian.zip : '',
        country: guardian.country !== '—' ? guardian.country : 'Ghana',
      });
    }
  }, [guardian]);

  if (isLoading) {
    return (
      <div>
        <BackLink to="/guardians" label="Back to guardians" />
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

  if (isError || !guardian) {
    return (
      <div>
        <BackLink to="/guardians" label="Back to guardians" />
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px', marginTop: '12px' }}>
          <b style={{ color: '#C23A52' }}>Guardian record not found</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Could not load guardian details'}</p>
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
      const nextStatus = !guardian.isActive;
      await setStatusMutation.mutateAsync({ id: guardian.id, isActive: nextStatus });
      addToast(nextStatus ? 'Guardian account activated.' : 'Guardian account deactivated.');
      setIsConfirmOpen(false);
    } catch (err) {
      addToast(err?.message || 'Failed to update guardian status.', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!editForm.firstName.trim()) errs.firstName = 'First name is required';
    if (!editForm.lastName.trim()) errs.lastName = 'Last name is required';
    if (!editForm.phone.trim()) errs.phone = 'Phone number is required';

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    try {
      await updateGuardianMutation.mutateAsync({
        id: guardian.id,
        data: {
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          contactInfo: {
            phone: editForm.phone.trim(),
            altPhone: editForm.altPhone.trim(),
            whatsapp: editForm.whatsapp.trim(),
          },
          address: {
            street: editForm.street.trim(),
            city: editForm.city.trim(),
            state: editForm.state.trim(),
            zip: editForm.zip.trim(),
            country: editForm.country.trim(),
          },
        },
      });
      addToast('Guardian details updated successfully.');
      setIsEditOpen(false);
    } catch (err) {
      addToast(err?.message || 'Failed to update guardian details.', 'error');
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: '14px' }}>
        <BackLink to="/guardians" label="Back to guardians" />
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="ghost"
            style={{ margin: 0 }}
            onClick={() => setIsConfirmOpen(true)}
          >
            {guardian.isActive ? (
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
            className="pb"
            style={{ height: '40px' }}
            onClick={() => setIsEditOpen(true)}
          >
            <Edit3 size={15} strokeWidth={1.8} /> Edit Guardian
          </button>
        </span>
      </div>

      <div className="cd" style={{ marginBottom: '14px' }}>
        <div className="row" style={{ alignItems: 'flex-start', gap: '18px' }}>
          <Avatar index={2} size={112} radius={22} src={guardian.photo} />
          <div>
            <h2 style={{ fontSize: '30px' }}>{guardian.name}</h2>
            <p>
              {guardian.relationship} · {guardian.studentsCount} · {guardian.city}
            </p>
            <div className="ca" style={{ marginTop: '12px' }}>
              {guardian.email && guardian.email !== '—' && (
                <a href={`mailto:${guardian.email}`}>
                  <span>
                    <Mail size={15} strokeWidth={1.8} /> Email
                  </span>
                </a>
              )}
              {guardian.phone && guardian.phone !== '—' && (
                <a href={`tel:${guardian.phone}`}>
                  <span>
                    <Phone size={15} strokeWidth={1.8} /> Call
                  </span>
                </a>
              )}
              {guardian.whatsapp && guardian.whatsapp !== '—' && (
                <a
                  href={`https://wa.me/${guardian.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="wa">
                    <MessageSquare size={15} strokeWidth={1.8} /> WhatsApp
                  </span>
                </a>
              )}
              {guardian.altPhone && guardian.altPhone !== '—' && (
                <a href={`tel:${guardian.altPhone}`}>
                  <span>
                    <Phone size={15} strokeWidth={1.8} /> Alt. Call
                  </span>
                </a>
              )}
            </div>
          </div>
          <Tag
            color={guardian.isActive ? 'g' : 'a'}
            style={{ marginLeft: 'auto' }}
          >
            {guardian.status}
          </Tag>
        </div>
      </div>

      <div className="k3">
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>STATUS</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {guardian.status}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>RELATIONSHIP</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {guardian.relationship}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>STUDENTS</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {guardian.studentsCount}
          </b>
        </div>
      </div>

      <div className="k2">
        <InfoCard
          title="PERSONAL INFORMATION"
          rows={[
            ['Full name', guardian.name],
            ['Relationship', guardian.relationship],
            ['ID type', guardian.idType],
            ['Status', guardian.status],
          ]}
        />
        <InfoCard
          title="CONTACT INFORMATION"
          rows={[
            ['Email', guardian.email],
            ['Phone', guardian.phone],
            ['Alt. phone', guardian.altPhone],
            ['WhatsApp', guardian.whatsapp],
          ]}
        />
      </div>

      <div className="k2">
        <InfoCard
          title="LINKED STUDENTS"
          rows={
            guardian.students && guardian.students.length > 0
              ? guardian.students.map((st, i) => [`Student ${i + 1}`, st])
              : [['Linked students', 'No linked students']]
          }
        />
        <InfoCard
          title="RESIDENTIAL ADDRESS"
          rows={[
            ['Street', guardian.street],
            ['City', guardian.city],
            ['State / Region', guardian.state],
            ['Postal code', guardian.zip],
            ['Country', guardian.country],
          ]}
        />
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleToggleStatus}
        title={guardian.isActive ? 'Deactivate Guardian' : 'Activate Guardian'}
        message={
          guardian.isActive
            ? `Are you sure you want to deactivate ${guardian.name}? They will lose access to the portal.`
            : `Are you sure you want to activate ${guardian.name}'s account?`
        }
        confirmText={guardian.isActive ? 'Deactivate' : 'Activate'}
        confirmColor={guardian.isActive ? '#C23A52' : '#23895B'}
        isLoading={setStatusMutation.isPending}
      />

      {/* Edit Guardian Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Guardian"
        subtitle="Update contact and residential details."
        width={560}
      >
        <form onSubmit={handleSaveEdit} style={{ display: 'grid', gap: '14px' }}>
          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="FIRST NAME *"
                value={editForm.firstName}
                onChange={(v) => {
                  setEditForm((p) => ({ ...p, firstName: v }));
                  setEditErrors((e) => ({ ...e, firstName: undefined }));
                }}
              />
              <FieldError error={editErrors.firstName} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="LAST NAME *"
                value={editForm.lastName}
                onChange={(v) => {
                  setEditForm((p) => ({ ...p, lastName: v }));
                  setEditErrors((e) => ({ ...e, lastName: undefined }));
                }}
              />
              <FieldError error={editErrors.lastName} />
            </div>
          </div>

          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="PHONE *"
                value={editForm.phone}
                onChange={(v) => {
                  setEditForm((p) => ({ ...p, phone: v }));
                  setEditErrors((e) => ({ ...e, phone: undefined }));
                }}
              />
              <FieldError error={editErrors.phone} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="ALT. PHONE"
                value={editForm.altPhone}
                onChange={(v) => setEditForm((p) => ({ ...p, altPhone: v }))}
              />
            </div>
          </div>

          <FormField
            label="WHATSAPP"
            value={editForm.whatsapp}
            onChange={(v) => setEditForm((p) => ({ ...p, whatsapp: v }))}
          />

          <FormField
            label="STREET ADDRESS"
            value={editForm.street}
            onChange={(v) => setEditForm((p) => ({ ...p, street: v }))}
          />

          <div className="row">
            <FormField
              label="CITY"
              value={editForm.city}
              onChange={(v) => setEditForm((p) => ({ ...p, city: v }))}
              style={{ flex: 1 }}
            />
            <FormField
              label="STATE / REGION"
              value={editForm.state}
              onChange={(v) => setEditForm((p) => ({ ...p, state: v }))}
              style={{ flex: 1 }}
            />
          </div>

          <div className="row">
            <FormField
              label="POSTAL CODE"
              value={editForm.zip}
              onChange={(v) => setEditForm((p) => ({ ...p, zip: v }))}
              style={{ flex: 1 }}
            />
            <FormField
              label="COUNTRY"
              value={editForm.country}
              onChange={(v) => setEditForm((p) => ({ ...p, country: v }))}
              style={{ flex: 1 }}
            />
          </div>

          <div className="row" style={{ justifyContent: 'space-between', marginTop: '10px' }}>
            <button
              type="button"
              className="ghost"
              style={{ margin: 0 }}
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pb"
              disabled={updateGuardianMutation.isPending}
            >
              {updateGuardianMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
