export function adaptDashboardData(raw = {}) {
  const stats = raw.stats || {};
  const population = raw.population || [];
  const enrollmentTrendRaw = raw.enrollmentTrend || [];
  const classSizesRaw = raw.classSizes || [];

  // Stat cards array
  const statCards = [
    {
      id: 'students',
      label: 'Students',
      value: String(stats.students ?? 0),
      note: `${stats.activeUsers ?? 0} active accounts`,
      icon: 'GraduationCap',
      tint: 'bl',
    },
    {
      id: 'teachers',
      label: 'Teachers',
      value: String(stats.teachers ?? 0),
      note: `${stats.guardians ?? 0} guardians`,
      icon: 'Users',
      tint: 'bl',
    },
    {
      id: 'classes',
      label: 'Classes',
      value: String(stats.classes ?? 0),
      note: `${stats.activeCourses ?? 0} active courses`,
      icon: 'School',
      tint: 'gn',
    },
    {
      id: 'complaints',
      label: 'Open complaints',
      value: String(stats.openComplaints ?? 0),
      note: `${stats.complaints ?? 0} total filed`,
      icon: 'FileText',
      tint: 'rd',
    },
    {
      id: 'courses',
      label: 'Courses',
      value: String(stats.courses ?? 0),
      note: 'Catalog size',
      icon: 'BookOpen',
      tint: 'bl',
    },
    {
      id: 'lessons',
      label: 'Lessons this week',
      value: String(stats.lessonsThisWeek ?? 0),
      note: 'Next 7 days',
      icon: 'Calendar',
      tint: 'am',
    },
    {
      id: 'homework',
      label: 'Homework due',
      value: String(stats.homeworksDueSoon ?? 0),
      note: 'Due within a week',
      icon: 'Paperclip',
      tint: 'am',
    },
    {
      id: 'announcements',
      label: 'Announcements',
      value: String(stats.announcements ?? 0),
      note: 'Published notices',
      icon: 'Megaphone',
      tint: 'bl',
    },
  ];

  // Community mix donut
  const totalPop = population.reduce((acc, p) => acc + (p.count || 0), 0);
  const donutColors = ['var(--p1)', '#2B8791', '#F59E6C'];
  const communityMix = {
    total: totalPop,
    items: population.map((p, i) => ({
      label: p.name,
      value: p.count || 0,
      color: donutColors[i % donutColors.length],
    })),
  };

  // Enrollment trend SVG calculation
  const trendLabels = enrollmentTrendRaw.map((b) => b.label);
  const trendCounts = enrollmentTrendRaw.map((b) => b.count || 0);
  const maxTrend = Math.max(...trendCounts, 1);

  // SVG viewBox is 320 x 190. X starts at 28, step 56 across 6 items. Y goes from 160 (0) to 22 (max)
  const coords = trendCounts.map((count, i) => {
    const x = 28 + i * 56;
    const y = Math.round(160 - (count / maxTrend) * 138);
    return `${x} ${y}`;
  });

  const points = coords.length > 0 ? `M${coords.join(' L')}` : 'M28 160 L310 160';
  const lastX = coords.length > 0 ? 28 + (coords.length - 1) * 56 : 310;
  const area = coords.length > 0 ? `M${coords.join(' L')} L${lastX} 160 L28 160Z` : 'M28 160 L310 160Z';

  const enrollmentTrend = {
    labels: trendLabels.length > 0 ? trendLabels : ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    gridLines: [20, 60, 100, 140],
    points,
    area,
  };

  // Class sizes
  const maxClassStudents = Math.max(...classSizesRaw.map((c) => c.students || 0), 1);
  const classSizes = classSizesRaw.map((c) => ({
    name: c.name,
    count: c.students || 0,
    max: maxClassStudents,
  }));

  return {
    statCards,
    communityMix,
    enrollmentTrend,
    classSizes,
    rawAdmin: raw.admin,
  };
}
