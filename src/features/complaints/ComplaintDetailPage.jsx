import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, RotateCcw, Image as ImageIcon, Trash2 } from 'lucide-react';
import { BackLink, InfoCard, Tag, Skeleton, Modal, ConfirmModal, useToast } from '../../components/ui';
import { useComplaint, useUpdateComplaintStatus, useDeleteComplaint } from '../../hooks/queries';
import { getStatusConfig } from './status';
import { getCurrentUser } from '../../api/endpoints/auth';
import { formatDate } from '../../api/adapters/helpers';

export function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const currentUser = getCurrentUser();

  const { data: complaint, isLoading, isError, error, refetch } = useComplaint(id);
  const updateStatusMutation = useUpdateComplaintStatus();
  const deleteComplaintMutation = useDeleteComplaint();
  const isUpdating = updateStatusMutation.isPending;

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    targetStatus: null,
    title: '',
    message: '',
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  if (isLoading) {
    return (
      <div>
        <BackLink to="/complaints" label="Back to complaints" />
        <div className="cd" style={{ padding: '24px', gap: '16px', marginTop: '12px' }}>
          <Skeleton width="40%" height="28px" />
          <Skeleton width="60%" height="16px" />
          <Skeleton width="100%" height="80px" borderRadius="12px" />
        </div>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div>
        <BackLink to="/complaints" label="Back to complaints" />
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px', marginTop: '12px' }}>
          <b style={{ color: '#C23A52' }}>Complaint record not found</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Could not load complaint details'}</p>
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

  const currentStatus = (complaint.statusKey || 'pending').toLowerCase();
  const statusCfg = getStatusConfig(currentStatus);

  const handleOpenConfirm = (targetStatus) => {
    if (targetStatus === 'under_review') {
      setConfirmState({
        isOpen: true,
        targetStatus: 'under_review',
        title: 'Move this case to Under review?',
        message: 'Move this case to Under review?',
      });
    } else if (targetStatus === 'pending') {
      setConfirmState({
        isOpen: true,
        targetStatus: 'pending',
        title: 'Reopen this case?',
        message: 'Reopen this case?',
      });
    }
  };

  const handleConfirmStatus = () => {
    if (!confirmState.targetStatus) return;
    updateStatusMutation.mutate(
      { id, status: confirmState.targetStatus },
      {
        onSuccess: () => {
          setConfirmState({ isOpen: false, targetStatus: null, title: '', message: '' });
        },
      }
    );
  };

  const handleResolveCase = (e) => {
    if (e) e.preventDefault();
    const trimmed = resolutionNote.trim();
    updateStatusMutation.mutate(
      {
        id,
        status: 'resolved',
        ...(trimmed ? { resolutionNote: trimmed } : {}),
      },
      {
        onSuccess: () => {
          setResolveModalOpen(false);
          setResolutionNote('');
        },
      }
    );
  };

  function getAdminName(changedBy) {
    if (changedBy && typeof changedBy === 'object') {
      const fullName = `${changedBy.firstName || ''} ${changedBy.lastName || ''}`.trim();
      if (fullName) return fullName;
      if (changedBy.name) return changedBy.name;
    }
    if (currentUser) {
      if (changedBy && String(changedBy) === String(currentUser._id || currentUser.id)) {
        const currentFullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
        if (currentFullName) return currentFullName;
        if (currentUser.name) return currentUser.name;
      }
    }
    if (typeof changedBy === 'string' && changedBy.length > 0 && !changedBy.match(/^[0-9a-fA-F]{24}$/)) {
      return changedBy;
    }
    return 'Admin';
  }

  const handleDeleteComplaint = async () => {
    try {
      await deleteComplaintMutation.mutateAsync(complaint.id);
      addToast('Complaint deleted successfully.');
      setIsDeleteOpen(false);
      navigate('/complaints');
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete complaint', 'error');
    }
  };

  const caseRecordRows = [
    ['Complaint ID', complaint.id],
    ['Created', complaint.created],
    ['Updated', complaint.updated],
    ['Resolved', complaint.resolvedAt ? formatDate(complaint.resolvedAt) : complaint.resolved],
  ];
  if (complaint.resolutionNote && complaint.resolutionNote.trim()) {
    caseRecordRows.push(['Resolution note', complaint.resolutionNote]);
  }

  const historyList = (complaint.statusHistory || []).slice().reverse();

  return (
    <div>
      {/* Header action area right of BackLink */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <BackLink to="/complaints" label="Back to complaints" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <button
            type="button"
            className="ghost"
            style={{ margin: 0, color: '#C23A52', borderColor: 'rgba(194, 58, 82, 0.3)', height: '36px' }}
            onClick={() => setIsDeleteOpen(true)}
            disabled={isUpdating || deleteComplaintMutation.isPending}
          >
            <Trash2 size={15} strokeWidth={1.8} /> Delete Complaint
          </button>
          {currentStatus === 'pending' && (
            <>
              <button
                type="button"
                className="ghost"
                style={{ margin: 0 }}
                onClick={() => handleOpenConfirm('under_review')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Mark under review'}
              </button>
              <button
                type="button"
                className="pb"
                style={{ margin: 0, height: '36px', padding: '0 16px' }}
                onClick={() => setResolveModalOpen(true)}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Resolve case'}
              </button>
            </>
          )}

          {(currentStatus === 'under_review' || currentStatus === 'in_progress') && (
            <>
              <button
                type="button"
                className="ghost"
                style={{ margin: 0 }}
                onClick={() => handleOpenConfirm('pending')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Reopen'}
              </button>
              <button
                type="button"
                className="pb"
                style={{ margin: 0, height: '36px', padding: '0 16px' }}
                onClick={() => setResolveModalOpen(true)}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Resolve case'}
              </button>
            </>
          )}

          {currentStatus === 'resolved' && (
            <button
              type="button"
              className="ghost"
              style={{ margin: 0 }}
              onClick={() => handleOpenConfirm('pending')}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Reopen case'}
            </button>
          )}
        </div>
      </div>

      <div className="cd" style={{ marginBottom: '14px', marginTop: '12px' }}>
        <div className="row">
          <Tag color={statusCfg.tagClass}>{statusCfg.label}</Tag>
          <Tag color={complaint.severityColor || 'b'}>{complaint.severity}</Tag>
          <Tag>{complaint.category}</Tag>
        </div>
        <h2 style={{ fontSize: '28px' }}>{complaint.title}</h2>
        <span
          className="tg"
          style={{ width: 'fit-content', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <Calendar size={14} strokeWidth={1.8} /> Filed {complaint.filedDate}
        </span>
        <p>{complaint.description}</p>
      </div>

      <div className="k3">
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>PRIORITY</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {complaint.severity}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>CATEGORY</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {complaint.category}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>FILED</small>
          <b className="hd" style={{ fontSize: '20px' }}>
            {complaint.filedDate}
          </b>
        </div>
      </div>

      <div className="k2">
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>COMPLAINANT</small>
          <h3>{complaint.complainant}</h3>
          <span style={{ color: 'var(--mute)', fontSize: '12px' }}>
            {complaint.role} {complaint.complainantId !== '—' ? `· ${complaint.complainantId}` : ''}
          </span>
          <b
            style={{ color: 'var(--p1)', cursor: 'pointer', marginTop: '4px', display: 'inline-block' }}
            onClick={() => navigate('/guardians')}
          >
            View profile
          </b>
        </div>
        <div className="cd" style={{ background: 'rgba(214,69,90,.07)' }}>
          <small style={{ color: 'var(--mute)' }}>REPORTED PARTY</small>
          <h3>{complaint.reportedParty}</h3>
        </div>
      </div>

      {statusCfg.noticeText && (
        <div
          className="nt"
          style={
            statusCfg.noticeTone === 'green'
              ? { background: 'rgba(48, 160, 110, .13)', color: '#23895B' }
              : undefined
          }
        >
          {statusCfg.noticeText}
        </div>
      )}

      {/* Photo Evidence Card */}
      {complaint.photoEvidence && complaint.photoEvidence.length > 0 && (
        <div className="cd" style={{ borderRadius: '16px', marginBottom: '14px' }}>
          <small style={{ color: 'var(--mute)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <ImageIcon size={14} /> PHOTO EVIDENCE
          </small>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
            {complaint.photoEvidence.map((photoUrl, idx) => (
              <a
                key={idx}
                href={photoUrl}
                target="_blank"
                rel="noreferrer"
                style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)' }}
              >
                <img
                  src={photoUrl}
                  alt={`Evidence ${idx + 1}`}
                  style={{ width: '140px', height: '110px', objectFit: 'cover', display: 'block' }}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="k2">
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>RELATED STUDENTS</small>
          <p>{complaint.relatedStudents || 'None specified'}</p>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)' }}>WITNESSES</small>
          <p>{complaint.witnesses || 'No witnesses recorded'}</p>
        </div>
      </div>

      <InfoCard title="CASE RECORD" rows={caseRecordRows} />

      {/* STATUS HISTORY CARD */}
      {historyList.length > 0 && (
        <div className="cd" style={{ marginTop: '14px' }}>
          <small style={{ letterSpacing: '.1em', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase' }}>
            STATUS HISTORY
          </small>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {historyList.map((item, idx) => {
              const itemCfg = getStatusConfig(item.status);
              const adminName = getAdminName(item.changedBy);
              const itemDate = formatDate(item.changedAt);

              return (
                <div
                  key={item._id || item.id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    paddingBottom: idx < historyList.length - 1 ? '12px' : '0',
                    borderBottom: idx < historyList.length - 1 ? '1px solid var(--line)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Tag color={itemCfg.tagClass}>{itemCfg.label}</Tag>
                    <span style={{ fontSize: '13px', color: 'var(--ink)' }}>
                      by {adminName}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--mute)', marginLeft: 'auto' }}>
                      {itemDate}
                    </span>
                  </div>
                  {item.note && (
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--mute)', fontStyle: 'italic' }}>
                      {item.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirm Modal for Under review / Reopen */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => !isUpdating && setConfirmState({ isOpen: false, targetStatus: null, title: '', message: '' })}
        onConfirm={handleConfirmStatus}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={isUpdating ? 'Updating...' : 'Confirm'}
        confirmColor="var(--p1)"
        isLoading={isUpdating}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteComplaint}
        title="Delete Complaint"
        message={`Are you sure you want to permanently delete this complaint ("${complaint.title}")? This action cannot be undone.`}
        confirmText="Delete Complaint"
        confirmColor="#C23A52"
        isLoading={deleteComplaintMutation.isPending}
      />

      {/* Resolve Case Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => !isUpdating && setResolveModalOpen(false)}
        title="Resolve case"
        width={520}
      >
        <form onSubmit={handleResolveCase}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'var(--mute)', letterSpacing: '.1em' }}>
                RESOLUTION NOTE (OPTIONAL)
              </label>
              <small style={{ color: 'var(--mute)', fontSize: '11px', fontWeight: 600 }}>
                {resolutionNote.length} / 500
              </small>
            </div>
            <textarea
              rows={4}
              placeholder="Add details on how this issue was resolved..."
              value={resolutionNote}
              maxLength={500}
              onChange={(e) => setResolutionNote(e.target.value.slice(0, 500))}
              disabled={isUpdating}
            />
          </div>

          <div className="row" style={{ justifyContent: 'space-between', marginTop: '16px' }}>
            <button
              type="button"
              className="ghost"
              style={{ margin: 0 }}
              onClick={() => setResolveModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pb"
              style={{ margin: 0, height: '38px', padding: '0 18px' }}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Resolve case'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
