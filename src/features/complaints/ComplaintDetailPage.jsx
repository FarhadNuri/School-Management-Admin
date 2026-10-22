import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { BackLink, InfoCard, Tag, Skeleton } from '../../components/ui';
import { useComplaint } from '../../hooks/queries';

export function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: complaint, isLoading, isError, error, refetch } = useComplaint(id);

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

  return (
    <div>
      <BackLink to="/complaints" label="Back to complaints" />

      {/* Note: "Mark under review" and "Resolve case" buttons removed per prompt spec (no backend status mutation endpoints exist) */}

      <div className="cd" style={{ marginBottom: '14px', marginTop: '12px' }}>
        <div className="row">
          <Tag color="b">{complaint.status}</Tag>
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

      {complaint.activeNotice && (
        <div className="nt">{complaint.activeNotice}</div>
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

      <InfoCard
        title="CASE RECORD"
        rows={[
          ['Complaint ID', complaint.id],
          ['Created', complaint.created],
          ['Updated', complaint.updated],
          ['Resolved', complaint.resolved],
        ]}
      />
    </div>
  );
}
