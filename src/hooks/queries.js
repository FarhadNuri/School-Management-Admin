import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudents, getStudentById, addStudent, updateStudent, setStudentStatus, deleteStudent } from '../api/endpoints/students';
import { getTeachers, getTeacherById, addTeacher, updateTeacher, setTeacherStatus, deleteTeacher } from '../api/endpoints/teachers';
import { getGuardians, getGuardianById, updateGuardian, setGuardianStatus, deleteGuardian } from '../api/endpoints/guardians';
import { getClasses, getClassById, addClass, updateClass, deleteClass } from '../api/endpoints/classes';
import { getCourses, getCourseById, addCourse, updateCourse, deleteCourse } from '../api/endpoints/courses';
import { getAnnouncements, getAnnouncementById, addAnnouncement, updateAnnouncement, deleteAnnouncement } from '../api/endpoints/announcements';
import { getComplaints, getComplaintById, updateComplaintStatus, deleteComplaint } from '../api/endpoints/complaints';
import { useToast } from '../components/ui';
import { getPayments, getPaymentById, createInvoice, resendInvoice, cancelInvoice } from '../api/endpoints/payments';

// ================= STUDENTS =================
export function useStudents(params) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => getStudents(params),
  });
}

export function useStudent(id) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => getStudentById(id),
    enabled: Boolean(id),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSetStudentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => setStudentStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// ================= TEACHERS =================
export function useTeachers(params) {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: () => getTeachers(params),
  });
}

export function useTeacher(id) {
  return useQuery({
    queryKey: ['teachers', id],
    queryFn: () => getTeacherById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTeacher(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teachers', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSetTeacherStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => setTeacherStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teachers', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// ================= GUARDIANS =================
export function useGuardians(params) {
  return useQuery({
    queryKey: ['guardians', params],
    queryFn: () => getGuardians(params),
  });
}

export function useGuardian(id) {
  return useQuery({
    queryKey: ['guardians', id],
    queryFn: () => getGuardianById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateGuardian(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      queryClient.invalidateQueries({ queryKey: ['guardians', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSetGuardianStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => setGuardianStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      queryClient.invalidateQueries({ queryKey: ['guardians', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteGuardian(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ================= CLASSES =================
export function useClasses(params) {
  return useQuery({
    queryKey: ['classes', params],
    queryFn: () => getClasses(params),
  });
}

export function useClass(id) {
  return useQuery({
    queryKey: ['classes', id],
    queryFn: () => getClassById(id),
    enabled: Boolean(id),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateClass(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['classes', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

// ================= COURSES =================
export function useCourses(params) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => getCourses(params),
  });
}

export function useCourse(id) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => getCourseById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCourse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}


// ================= ANNOUNCEMENTS =================
export function useAnnouncements(params) {
  return useQuery({
    queryKey: ['announcements', params],
    queryFn: () => getAnnouncements(params),
  });
}

export function useAnnouncement(id) {
  return useQuery({
    queryKey: ['announcements', id],
    queryFn: () => getAnnouncementById(id),
    enabled: Boolean(id),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateAnnouncement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ================= COMPLAINTS =================
export function useComplaints() {
  return useQuery({
    queryKey: ['complaints'],
    queryFn: getComplaints,
  });
}

export function useComplaint(id) {
  return useQuery({
    queryKey: ['complaints', id],
    queryFn: () => getComplaintById(id),
    enabled: Boolean(id),
  });
}

export function useDeleteComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteComplaint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, status, resolutionNote }) =>
      updateComplaintStatus(id, { status, resolutionNote }),
    onSuccess: (updatedComplaint, variables) => {
      if (variables?.id && updatedComplaint) {
        queryClient.setQueryData(['complaints', variables.id], updatedComplaint);
      }
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      let toastMessage = 'Complaint status updated';
      if (variables?.status === 'under_review') {
        toastMessage = 'Complaint marked as Under review';
      } else if (variables?.status === 'resolved') {
        toastMessage = 'Complaint resolved';
      } else if (variables?.status === 'pending') {
        toastMessage = 'Complaint reopened';
      }
      addToast(toastMessage, 'success');
    },
    onError: (error) => {
      const message = error?.message || error?.error || 'Failed to update complaint status';
      addToast(message, 'error');
    },
  });
}

// ================= PAYMENTS =================
export function usePayments(params) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => getPayments(params),
  });
}

export function usePayment(id) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => getPaymentById(id),
    enabled: Boolean(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useResendInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resendInvoice,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelInvoice,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
