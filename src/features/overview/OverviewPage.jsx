import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  GraduationCap,
  Users,
  School,
  FileText,
  BookOpen,
  Calendar,
  Paperclip,
  Megaphone,
  RotateCcw,
} from 'lucide-react';
import { IconStat, Skeleton } from '../../components/ui';
import { DonutChart } from './charts/DonutChart';
import { TrendChart } from './charts/TrendChart';
import { ClassSizesChart } from './charts/ClassSizesChart';
import { getDashboard } from '../../api/endpoints/dashboard';
import { getCurrentUser } from '../../api/endpoints/auth';

const ICON_MAP = {
  GraduationCap,
  Users,
  School,
  FileText,
  BookOpen,
  Calendar,
  Paperclip,
  Megaphone,
};

export function OverviewPage() {
  const admin = getCurrentUser() || {};
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const firstName = admin.firstName || data?.rawAdmin?.firstName || 'Administrator';

  if (isLoading) {
    return (
      <div>
        <div className="bn">
          <small>GOOD MORNING</small>
          <h2>Welcome back, {firstName}</h2>
        </div>

        <div className="st4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="sc sx">
              <Skeleton width="38px" height="38px" borderRadius="11px" />
              <div style={{ flex: 1, display: 'grid', gap: '6px' }}>
                <Skeleton width="60%" height="12px" />
                <Skeleton width="40%" height="24px" />
                <Skeleton width="50%" height="10px" />
              </div>
            </div>
          ))}
        </div>

        <div className="c3">
          <div className="cd" style={{ minHeight: '280px' }}>
            <Skeleton width="120px" height="20px" />
            <Skeleton width="170px" height="170px" borderRadius="50%" style={{ margin: '14px auto' }} />
          </div>
          <div className="cd" style={{ minHeight: '280px' }}>
            <Skeleton width="120px" height="20px" />
            <Skeleton width="100%" height="200px" style={{ marginTop: '14px' }} />
          </div>
          <div className="cd" style={{ minHeight: '280px' }}>
            <Skeleton width="120px" height="20px" />
            <Skeleton width="100%" height="200px" style={{ marginTop: '14px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px' }}>
        <b style={{ color: '#C23A52', fontSize: '16px' }}>Failed to load dashboard overview</b>
        <p style={{ color: 'var(--mute)' }}>{error?.message || 'Network or server error'}</p>
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
    );
  }

  const { statCards = [], communityMix, enrollmentTrend, classSizes = [] } = data || {};

  return (
    <div>
      <div className="bn">
        <small>GOOD MORNING</small>
        <h2>Welcome back, {firstName}</h2>
      </div>

      <div className="st4">
        {statCards.map((item) => {
          const IconComp = ICON_MAP[item.icon] || GraduationCap;
          return (
            <IconStat
              key={item.id}
              icon={<IconComp size={17} strokeWidth={1.8} />}
              tint={item.tint}
              label={item.label}
              value={item.value}
              note={item.note}
            />
          );
        })}
      </div>

      <div className="c3">
        <DonutChart data={communityMix} />
        <TrendChart data={enrollmentTrend} />
        <ClassSizesChart data={classSizes} />
      </div>
    </div>
  );
}
