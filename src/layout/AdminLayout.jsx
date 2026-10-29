import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const ROUTE_CONFIG = {
  '/': { title: 'Overview', subtitle: 'Fri 7 Aug · School operations at a glance' },
  '/complaints': { title: 'Complaints', subtitle: 'Incidents and case records' },
  '/students': { title: 'Students', subtitle: 'Enrollment and student records' },
  '/teachers': { title: 'Teachers', subtitle: 'Faculty and staffing profiles' },
  '/guardians': { title: 'Guardians', subtitle: 'Parent and guardian records' },
  '/classes': { title: 'Classes', subtitle: 'Sections, grades, and schedules' },
  '/courses': { title: 'Subjects', subtitle: 'Curriculum and subject catalog' },
  '/announcements': { title: 'Announcements', subtitle: 'School notices and updates' },
  '/payments': { title: 'Fees & Payments', subtitle: 'Billing and payment tracking' },
  '/profile': { title: 'Profile', subtitle: 'Your admin account settings' },
};

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  let baseRoute = '/';
  let isDetail = false;

  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) {
    baseRoute = '/';
  } else if (segments.length === 1) {
    baseRoute = `/${segments[0]}`;
  } else if (segments.length >= 2) {
    baseRoute = `/${segments[0]}`;
    isDetail = true;
  }

  const config = ROUTE_CONFIG[baseRoute] || {
    title: 'Dashboard',
    subtitle: 'Sunrise Model School Management',
  };

  return (
    <div className="app">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="mn">
        <TopBar
          title={config.title}
          subtitle={config.subtitle}
          isDetail={isDetail}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className="ct" id="ct">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
