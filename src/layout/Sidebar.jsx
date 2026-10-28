import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  GraduationCap,
  Users,
  User,
  School,
  BookOpen,
  Megaphone,
  DollarSign,
  Award,
  LogOut,
} from 'lucide-react';
import { logout } from '../services/auth';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/students', label: 'Students', icon: GraduationCap },
  { to: '/teachers', label: 'Teachers', icon: Users },
  { to: '/guardians', label: 'Guardians', icon: User },
  { to: '/classes', label: 'Classes', icon: School },
  { to: '/courses', label: 'Subjects', icon: BookOpen },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/payments', label: 'Fees & Payments', icon: DollarSign },
  { to: '/complaints', label: 'Complaints', icon: FileText },
  { to: '/publish-grades', label: 'Publish Grades', icon: Award },
];

export function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sb ${isOpen ? 'open' : ''}`} id="sb">
      <div className="logo">
        <b>Northfield</b>
        <small>ADMIN</small>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nv ${isActive ? 'on' : ''}`}
              onClick={onClose}
            >
              <Icon size={17} strokeWidth={1.8} className="i" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div
        className="nv lo"
        onClick={handleLogout}
        role="button"
        tabIndex={0}
      >
        <LogOut size={17} strokeWidth={1.8} className="i" />
        Logout
      </div>
    </aside>
  );
}
