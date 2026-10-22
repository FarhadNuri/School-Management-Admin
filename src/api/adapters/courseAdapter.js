export function adaptCourse(raw = {}) {
  const teachers = raw.courseTeachers || [];
  const students = raw.courseStudents || [];
  const classItem = raw.courseClass || {};

  const teacherNames = teachers
    .map((t) => (t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() : 'Teacher'))
    .filter(Boolean)
    .join(', ');

  const name = raw.courseName || '—';
  const code = raw.courseCode || '—';
  const shortCode = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'CRS';

  return {
    id: String(raw._id || raw.id || ''),
    rawCourse: raw,
    name,
    code,
    shortCode,
    type: raw.courseType || 'Core',
    status: raw.courseStatus || 'Active',
    isActive: raw.courseStatus === 'Active',
    description: raw.courseDescription || '—',
    class: classItem.className || '—',
    classId: classItem._id ? String(classItem._id) : '',
    teacher: teacherNames || 'No teacher assigned',
    teachers,
    teacherIds: teachers.map((t) => String(t._id || t)),
    enrolled: String(students.length),
    students,
  };
}

export function adaptCoursesList(raw = {}) {
  const courses = raw.courses || [];
  return {
    count: raw.count ?? courses.length,
    courses: courses.map(adaptCourse),
  };
}
