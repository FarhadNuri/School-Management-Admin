import { PublishGradesPage } from '../features/grades/PublishGradesPage';
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminGuard } from './AdminGuard';
import { AdminLayout } from '../layout/AdminLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { OverviewPage } from '../features/overview/OverviewPage';
import { ComplaintsPage } from '../features/complaints/ComplaintsPage';
import { ComplaintDetailPage } from '../features/complaints/ComplaintDetailPage';
import { StudentsPage } from '../features/students/StudentsPage';
import { StudentDetailPage } from '../features/students/StudentDetailPage';
import { TeachersPage } from '../features/teachers/TeachersPage';
import { TeacherDetailPage } from '../features/teachers/TeacherDetailPage';
import { GuardiansPage } from '../features/guardians/GuardiansPage';
import { GuardianDetailPage } from '../features/guardians/GuardianDetailPage';
import { ClassesPage } from '../features/classes/ClassesPage';
import { ClassDetailPage } from '../features/classes/ClassDetailPage';
import { CoursesPage } from '../features/courses/CoursesPage';
import { CourseDetailPage } from '../features/courses/CourseDetailPage';
import { AnnouncementsPage } from '../features/announcements/AnnouncementsPage';
import { PaymentsPage } from '../features/payments/PaymentsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { RoutinesPage } from '../features/routines/RoutinesPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/', element: <OverviewPage /> },
          { path: '/complaints', element: <ComplaintsPage /> },
          { path: '/complaints/:id', element: <ComplaintDetailPage /> },
          { path: '/publish-grades', element: <PublishGradesPage /> },
          { path: '/students', element: <StudentsPage /> },
          { path: '/students/:id', element: <StudentDetailPage /> },
          { path: '/teachers', element: <TeachersPage /> },
          { path: '/teachers/:id', element: <TeacherDetailPage /> },
          { path: '/guardians', element: <GuardiansPage /> },
          { path: '/guardians/:id', element: <GuardianDetailPage /> },
          { path: '/classes', element: <ClassesPage /> },
          { path: '/classes/:id', element: <ClassDetailPage /> },
          { path: '/routines', element: <RoutinesPage /> },
          { path: '/courses', element: <CoursesPage /> },
          { path: '/courses/:id', element: <CourseDetailPage /> },
          { path: '/announcements', element: <AnnouncementsPage /> },
          { path: '/payments', element: <PaymentsPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
