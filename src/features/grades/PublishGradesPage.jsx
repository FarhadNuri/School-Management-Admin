import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Plus,
  Save,
  Check,
  Trash2,
  Globe,
  X,
  Edit3,
  AlertCircle,
  Calendar,
  User,
  Search,
  Sparkles
} from 'lucide-react';
import {
  SearchBar,
  Chips,
  Tag,
  Modal,
  ConfirmModal,
  EmptyState,
  CardSkeleton,
  useToast
} from '../../components/ui';
import {
  getAdminGradebooks,
  getAdminGradebookById,
  updateAdminGradebook,
  togglePublishGradebook
} from '../../api/grades';

const ASSESSMENT_TYPES = [
  { id: 'quiz', label: 'Quiz', defaultMarks: 20 },
  { id: 'class_test', label: 'Class Test', defaultMarks: 25 },
  { id: 'assignment', label: 'Assignment', defaultMarks: 20 },
  { id: 'attendance', label: 'Attendance', defaultMarks: 10 },
  { id: 'mid_term', label: 'Mid Term', defaultMarks: 50 },
  { id: 'final_term', label: 'Final Term', defaultMarks: 100 }
];

const calculateLetterGrade = (obtained, max) => {
  if (!max || max <= 0) return { grade: '—', color: 'var(--mute)' };
  const pct = (obtained / max) * 100;
  if (pct >= 90) return { grade: 'A+', color: '#22C55E' };
  if (pct >= 80) return { grade: 'A', color: '#14B8A6' };
  if (pct >= 70) return { grade: 'B', color: '#38BDF8' };
  if (pct >= 60) return { grade: 'C', color: '#FBBF24' };
  if (pct >= 50) return { grade: 'D', color: '#FB923C' };
  return { grade: 'F', color: '#EF4444' };
};

export function PublishGradesPage() {
  const { addToast } = useToast();

  const [gradebooks, setGradebooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusChip, setStatusChip] = useState('All'); // 'All', 'Published', 'Drafts'

  // Editor State
  const [activeGradebookId, setActiveGradebookId] = useState(null);
  const [activeGradebook, setActiveGradebook] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Assessment & Scores State for Editor
  const [assessments, setAssessments] = useState([]);
  const [studentScores, setStudentScores] = useState({});
  const [studentRemarks, setStudentRemarks] = useState({});

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState('quiz');
  const [modalName, setModalName] = useState('');
  const [modalMaxMarks, setModalMaxMarks] = useState(20);

  // Confirm Modals (Replacing all window.confirm)
  const [confirmPublishModal, setConfirmPublishModal] = useState({ isOpen: false, targetGb: null, isLoading: false });
  const [confirmDeleteColumnModal, setConfirmDeleteColumnModal] = useState({ isOpen: false, columnId: null, columnName: '' });
  const [confirmDiscardModal, setConfirmDiscardModal] = useState(false);

  // Fetch all gradebooks
  const fetchGradebooks = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminGradebooks();
      setGradebooks(data?.gradebooks || (Array.isArray(data) ? data : []));
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || 'Failed to load gradebooks', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGradebooks();
  }, []);

  // Filter gradebooks
  const filteredGradebooks = useMemo(() => {
    return gradebooks.filter((g) => {
      if (statusChip === 'Published' && !g.isPublished) return false;
      if (statusChip === 'Drafts' && g.isPublished) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matches =
          (g.className || '').toLowerCase().includes(q) ||
          (g.subject || '').toLowerCase().includes(q) ||
          (g.courseCode || '').toLowerCase().includes(q) ||
          (g.teacherName || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [gradebooks, statusChip, searchTerm]);

  // Counts for KPIs
  const totalCount = gradebooks.length;
  const publishedCount = gradebooks.filter((g) => g.isPublished).length;
  const draftCount = totalCount - publishedCount;

  // Open editor
  const handleOpenEditor = async (id) => {
    setActiveGradebookId(id);
    setIsLoadingDetail(true);
    setHasUnsavedChanges(false);
    try {
      const data = await getAdminGradebookById(id);
      const gb = data?.gradebook || data || {};
      setActiveGradebook(gb);

      const existingAssessments = Array.isArray(gb.assessments) ? gb.assessments : [];
      setAssessments(existingAssessments);

      const initialScores = {};
      const initialRemarks = {};
      (gb.students || []).forEach((s) => {
        initialScores[s.studentId] = s.scores || {};
        initialRemarks[s.studentId] = s.remarks || '';
      });
      setStudentScores(initialScores);
      setStudentRemarks(initialRemarks);
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || 'Failed to load gradebook details', 'error');
      setActiveGradebookId(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Close editor
  const handleBackToCards = () => {
    if (hasUnsavedChanges) {
      setConfirmDiscardModal(true);
      return;
    }
    setActiveGradebookId(null);
    setActiveGradebook(null);
    setHasUnsavedChanges(false);
    fetchGradebooks();
  };

  const handleConfirmDiscard = () => {
    setConfirmDiscardModal(false);
    setActiveGradebookId(null);
    setActiveGradebook(null);
    setHasUnsavedChanges(false);
    fetchGradebooks();
  };

  // Prompt Toggle Publish Modal
  const handlePromptPublishToggle = (gb, e) => {
    if (e) e.stopPropagation();
    setConfirmPublishModal({ isOpen: true, targetGb: gb, isLoading: false });
  };

  // Confirm Toggle Publish
  const handleConfirmPublishToggle = async () => {
    const gb = confirmPublishModal.targetGb;
    if (!gb) return;
    const targetAction = !gb.isPublished;

    try {
      setConfirmPublishModal((prev) => ({ ...prev, isLoading: true }));
      const res = await togglePublishGradebook(gb.id || gb._id, targetAction);
      addToast(res.message || 'Status updated', 'success');

      setGradebooks((prev) =>
        prev.map((item) =>
          (item.id || item._id) === (gb.id || gb._id)
            ? { ...item, isPublished: res.isPublished, status: res.status, publishedAt: res.publishedAt }
            : item
        )
      );

      if (activeGradebook && (activeGradebook.id || activeGradebook._id) === (gb.id || gb._id)) {
        setActiveGradebook((prev) => ({
          ...prev,
          isPublished: res.isPublished,
          status: res.status,
          publishedAt: res.publishedAt
        }));
      }

      setConfirmPublishModal({ isOpen: false, targetGb: null, isLoading: false });
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || 'Failed to toggle publication', 'error');
      setConfirmPublishModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Add Assessment
  const handleAddAssessmentSubmit = (e) => {
    e.preventDefault();
    const finalName = modalName.trim() || ASSESSMENT_TYPES.find((t) => t.id === modalType)?.label || 'Assessment';
    const newId = `asmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newAssessment = {
      id: newId,
      name: finalName,
      type: modalType,
      maxMarks: Math.max(1, Number(modalMaxMarks) || 100),
      date: new Date()
    };

    setAssessments((prev) => [...prev, newAssessment]);
    setHasUnsavedChanges(true);
    setIsAddModalOpen(false);
    addToast(`Added "${finalName}" column. Remember to click "Save Gradebook" to commit.`, 'info');
  };

  // Prompt Delete Column Modal
  const handlePromptDeleteColumn = (asmtId, asmtName) => {
    setConfirmDeleteColumnModal({ isOpen: true, columnId: asmtId, columnName: asmtName });
  };

  // Confirm Delete Column
  const handleConfirmDeleteColumn = () => {
    const asmtId = confirmDeleteColumnModal.columnId;
    setAssessments((prev) => prev.filter((a) => a.id !== asmtId));
    setStudentScores((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((sId) => {
        if (next[sId]) {
          const studentCopy = { ...next[sId] };
          delete studentCopy[asmtId];
          next[sId] = studentCopy;
        }
      });
      return next;
    });
    setHasUnsavedChanges(true);
    setConfirmDeleteColumnModal({ isOpen: false, columnId: null, columnName: '' });
    addToast(`Assessment column removed. Click "Save Gradebook" to persist.`, 'info');
  };

  // Score Input Change
  const handleScoreChange = (studentId, asmtId, val, maxMarks) => {
    const clean = val.replace(/[^\d]/g, '');
    if (clean === '') {
      setStudentScores((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [asmtId]: ''
        }
      }));
      setHasUnsavedChanges(true);
      return;
    }

    let num = Number(clean);
    if (!Number.isNaN(num)) {
      if (num < 0) num = 0;
      if (num > maxMarks) {
        num = maxMarks;
        addToast(`Score cannot exceed maximum marks (${maxMarks})`, 'error');
      }
      setStudentScores((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [asmtId]: num
        }
      }));
      setHasUnsavedChanges(true);
    }
  };

  // Save Gradebook
  const handleSaveGradebook = async () => {
    if (!activeGradebookId || !activeGradebook) return;
    try {
      setIsSaving(true);
      const studentsList = activeGradebook.students || [];
      const payloadGrades = studentsList.map((s) => ({
        studentId: s.studentId,
        scores: studentScores[s.studentId] || {},
        remarks: studentRemarks[s.studentId] || ''
      }));

      await updateAdminGradebook(activeGradebookId, {
        assessments,
        grades: payloadGrades
      });

      addToast('Gradebook updated and saved successfully by Admin', 'success');
      setHasUnsavedChanges(false);
      fetchGradebooks();
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || 'Failed to save gradebook', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Total Max Marks for Editor
  const totalMaxMarks = useMemo(() => {
    return assessments.reduce((acc, a) => acc + (Number(a.maxMarks) || 0), 0);
  }, [assessments]);

  // ==========================================
  // VIEW 1: EDITOR VIEW
  // ==========================================
  if (activeGradebookId && activeGradebook) {
    const studentsList = activeGradebook.students || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Style to prevent spin arrows on inputs */}
        <style>{`
          .grade-input-cell::-webkit-outer-spin-button,
          .grade-input-cell::-webkit-inner-spin-button {
            -webkit-appearance: none !important;
            margin: 0 !important;
          }
          .grade-input-cell {
            -moz-appearance: textfield !important;
          }
        `}</style>

        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ghost"
              onClick={handleBackToCards}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Cards</span>
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                  {activeGradebook.className} • {activeGradebook.subject}
                </h2>
                {activeGradebook.courseCode && (
                  <Tag color="b">{activeGradebook.courseCode}</Tag>
                )}
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
                Teacher: <b style={{ color: 'var(--ink)' }}>{activeGradebook.teacherName || 'Assigned'}</b> • {studentsList.length} enrolled students
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Publish / Unpublish Button */}
            <button
              type="button"
              onClick={() => handlePromptPublishToggle(activeGradebook)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeGradebook.isPublished ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.14)',
                border: activeGradebook.isPublished ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.35)',
                color: activeGradebook.isPublished ? '#EF4444' : '#10B981',
                transition: 'all 0.15s ease'
              }}
            >
              {activeGradebook.isPublished ? <X size={15} /> : <Globe size={15} />}
              <span>{activeGradebook.isPublished ? 'Unpublish' : 'Publish Gradebook'}</span>
            </button>

            {/* Add Assessment Button */}
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setModalType('quiz');
                setModalName(`Quiz ${assessments.filter((a) => a.type === 'quiz').length + 1}`);
                setModalMaxMarks(20);
                setIsAddModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                background: 'var(--card)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} color="var(--p1)" />
              <span>Add Assessment</span>
            </button>

            {/* Save Gradebook Button */}
            <button
              type="button"
              className="pb"
              onClick={handleSaveGradebook}
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--p1), var(--p2))',
                border: 'none',
                color: '#FFFFFF',
                cursor: isSaving ? 'default' : 'pointer',
                boxShadow: '0 4px 14px rgba(30,111,120,0.3)',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : hasUnsavedChanges ? (
                <>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 8px #FFFFFF' }} />
                  <Save size={15} />
                  <span>Save Gradebook</span>
                </>
              ) : (
                <>
                  <Check size={15} color="#22C55E" />
                  <span>Save Gradebook</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Status Banner */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '14px',
            background: activeGradebook.isPublished ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: activeGradebook.isPublished ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeGradebook.isPublished ? (
              <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={18} color="#F59E0B" style={{ flexShrink: 0 }} />
            )}
            <div style={{ fontSize: '13px', color: 'var(--ink)' }}>
              {activeGradebook.isPublished ? (
                <>
                  <b style={{ color: '#10B981' }}>Officially Published:</b> Grades are visible to students in their portal. Teachers are locked from modifying; only administrators can update this gradesheet.
                </>
              ) : (
                <>
                  <b style={{ color: '#F59E0B' }}>Draft Status:</b> Grades are currently hidden from students until you click &quot;Publish Gradebook&quot;. Teachers are locked once published.
                </>
              )}
            </div>
          </div>

          <Tag color={activeGradebook.isPublished ? 'g' : 'a'}>
            {activeGradebook.isPublished ? 'Live on Student Portal' : 'Draft / Awaiting Release'}
          </Tag>
        </div>

        {/* Gradebook Matrix Table */}
        <div
          className="cd"
          style={{
            padding: 0,
            overflow: 'hidden',
            background: 'var(--card)',
            border: '1px solid var(--line)'
          }}
        >
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                minWidth: `${340 + assessments.length * 150 + 200}px`
              }}
            >
              <thead>
                <tr style={{ background: 'var(--soft)', borderBottom: '1px solid var(--line)' }}>
                  {/* Left Column: Student */}
                  <th
                    style={{
                      padding: '16px 20px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: 'var(--mute)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '260px',
                      position: 'sticky',
                      left: 0,
                      background: 'var(--soft)',
                      zIndex: 2,
                      borderRight: '1px solid var(--line)'
                    }}
                  >
                    Student Name
                  </th>

                  {/* Assessment Columns */}
                  {assessments.map((asmt) => (
                    <th
                      key={asmt.id}
                      style={{
                        padding: '14px 16px',
                        textAlign: 'center',
                        minWidth: '150px',
                        borderRight: '1px solid var(--line)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--ink)' }}>
                            {asmt.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handlePromptDeleteColumn(asmt.id, asmt.name)}
                            title={`Delete ${asmt.name}`}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--mute)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '4px'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--mute)')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--mute)', fontWeight: 600 }}>
                          Max: <b style={{ color: 'var(--ink)' }}>{asmt.maxMarks} pts</b>
                        </div>
                      </div>
                    </th>
                  ))}

                  {assessments.length === 0 && (
                    <th style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--mute)', fontSize: '12.5px' }}>
                      No assessments added yet. Click &quot;Add Assessment&quot; to add a column.
                    </th>
                  )}

                  {/* TOTAL */}
                  <th
                    style={{
                      padding: '16px 18px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: 'var(--mute)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '110px',
                      textAlign: 'center',
                      position: 'sticky',
                      right: '180px',
                      background: 'var(--soft)',
                      zIndex: 2,
                      borderLeft: '1px solid var(--line)'
                    }}
                  >
                    TOTAL
                  </th>

                  {/* PERCENT */}
                  <th
                    style={{
                      padding: '16px 14px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: 'var(--mute)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '100px',
                      textAlign: 'center',
                      position: 'sticky',
                      right: '80px',
                      background: 'var(--soft)',
                      zIndex: 2
                    }}
                  >
                    PERCENT
                  </th>

                  {/* GRADE */}
                  <th
                    style={{
                      padding: '16px 14px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: 'var(--mute)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '80px',
                      textAlign: 'center',
                      position: 'sticky',
                      right: 0,
                      background: 'var(--soft)',
                      zIndex: 2
                    }}
                  >
                    GRADE
                  </th>
                </tr>
              </thead>

              <tbody>
                {studentsList.map((student, idx) => {
                  const sScores = studentScores[student.studentId] || {};

                  const totalObtained = assessments.reduce((acc, a) => {
                    const score = sScores[a.id];
                    return acc + (score !== '' && score !== undefined ? Number(score) : 0);
                  }, 0);

                  const { grade: letterGrade, color: gradeColor } = calculateLetterGrade(
                    totalObtained,
                    totalMaxMarks
                  );

                  const percentage =
                    totalMaxMarks > 0 ? Math.round((totalObtained / totalMaxMarks) * 100) : 0;

                  return (
                    <tr
                      key={student.studentId || idx}
                      style={{
                        borderBottom:
                          idx === studentsList.length - 1 ? 'none' : '1px solid var(--line)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 111, 120, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Left: Student Column */}
                      <td
                        style={{
                          padding: '12px 20px',
                          position: 'sticky',
                          left: 0,
                          background: 'var(--card)',
                          zIndex: 1,
                          borderRight: '1px solid var(--line)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {student.photo ? (
                            <img
                              src={student.photo}
                              alt={student.name}
                              style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'rgba(30,111,120,0.15)',
                                color: 'var(--p1)',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 800,
                                fontSize: '13.5px'
                              }}
                            >
                              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--ink)' }}>
                              {student.name}
                            </div>
                            {student.email && (
                              <div style={{ fontSize: '11.5px', color: 'var(--mute)' }}>
                                {student.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Middle: Assessment Scores */}
                      {assessments.map((asmt) => {
                        const scoreVal = sScores[asmt.id];
                        return (
                          <td
                            key={asmt.id}
                            style={{
                              padding: '10px 14px',
                              textAlign: 'center',
                              borderRight: '1px solid var(--line)'
                            }}
                          >
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="grade-input-cell"
                              value={scoreVal !== undefined && scoreVal !== null ? scoreVal : ''}
                              placeholder="—"
                              onChange={(e) =>
                                handleScoreChange(
                                  student.studentId,
                                  asmt.id,
                                  e.target.value,
                                  asmt.maxMarks
                                )
                              }
                              style={{
                                width: '68px',
                                height: '38px',
                                textAlign: 'center',
                                fontSize: '14px',
                                fontWeight: 700,
                                color: 'var(--ink)',
                                background: 'var(--soft)',
                                border: '1px solid var(--line)',
                                borderRadius: '10px',
                                outline: 'none',
                                transition: 'all 0.15s ease'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = 'var(--p1)';
                                e.target.style.boxShadow = '0 0 0 2px rgba(30,111,120,0.25)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'var(--line)';
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          </td>
                        );
                      })}

                      {assessments.length === 0 && (
                        <td style={{ textAlign: 'center', color: 'var(--mute)', fontSize: '13px' }}>—</td>
                      )}

                      {/* TOTAL */}
                      <td
                        style={{
                          padding: '14px 18px',
                          textAlign: 'center',
                          position: 'sticky',
                          right: '180px',
                          background: 'var(--card)',
                          zIndex: 1,
                          borderLeft: '1px solid var(--line)'
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>
                          {totalObtained} / {totalMaxMarks}
                        </span>
                      </td>

                      {/* PERCENT */}
                      <td
                        style={{
                          padding: '14px',
                          textAlign: 'center',
                          position: 'sticky',
                          right: '80px',
                          background: 'var(--card)',
                          zIndex: 1
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mute)' }}>
                          {percentage}%
                        </span>
                      </td>

                      {/* GRADE */}
                      <td
                        style={{
                          padding: '14px',
                          textAlign: 'center',
                          position: 'sticky',
                          right: 0,
                          background: 'var(--card)',
                          zIndex: 1
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '32px',
                            height: '26px',
                            padding: '0 8px',
                            borderRadius: '8px',
                            background: `${gradeColor}20`,
                            color: gradeColor,
                            fontSize: '12px',
                            fontWeight: 800,
                            border: `1px solid ${gradeColor}40`
                          }}
                        >
                          {letterGrade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Assessment (Uses native project Modal) */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Assessment"
          subtitle="Create a new grading column for this class"
          width={480}
        >
          <form onSubmit={handleAddAssessmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Assessment Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {ASSESSMENT_TYPES.map((t) => {
                  const isSelected = modalType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setModalType(t.id);
                        const count = assessments.filter((a) => a.type === t.id).length;
                        setModalName(`${t.label} ${count + 1}`);
                        setModalMaxMarks(t.defaultMarks);
                      }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: isSelected ? '1px solid var(--p1)' : '1px solid var(--line)',
                        background: isSelected ? 'rgba(30,111,120,0.15)' : 'var(--soft)',
                        color: isSelected ? 'var(--p1)' : 'var(--ink)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Column Title
              </label>
              <input
                type="text"
                value={modalName}
                onChange={(e) => setModalName(e.target.value)}
                placeholder="e.g. Mid Term Exam"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'var(--soft)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Maximum Marks
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="grade-input-cell"
                value={modalMaxMarks}
                onChange={(e) => setModalMaxMarks(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="e.g. 50"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'var(--soft)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="row" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="ghost"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pb"
                style={{ height: '40px', padding: '0 20px' }}
              >
                Add Column
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Confirm Delete Assessment Column */}
        <ConfirmModal
          isOpen={confirmDeleteColumnModal.isOpen}
          onClose={() => setConfirmDeleteColumnModal({ isOpen: false, columnId: null, columnName: '' })}
          onConfirm={handleConfirmDeleteColumn}
          title="Remove Assessment Column"
          message={`Are you sure you want to remove "${confirmDeleteColumnModal.columnName}" and all entered marks for this column? Click Save Gradebook afterward to persist changes.`}
          confirmText="Remove Column"
          confirmColor="#EF4444"
        />

        {/* Modal: Confirm Discard Unsaved Changes */}
        <ConfirmModal
          isOpen={confirmDiscardModal}
          onClose={() => setConfirmDiscardModal(false)}
          onConfirm={handleConfirmDiscard}
          title="Discard Unsaved Changes"
          message="You have unsaved grading changes. Do you want to discard them and return to the cards overview?"
          confirmText="Discard Changes"
          confirmColor="#EF4444"
        />

        {/* Modal: Confirm Publish/Unpublish from Editor */}
        <ConfirmModal
          isOpen={confirmPublishModal.isOpen}
          onClose={() => setConfirmPublishModal({ isOpen: false, targetGb: null, isLoading: false })}
          onConfirm={handleConfirmPublishToggle}
          title={confirmPublishModal.targetGb?.isPublished ? 'Revert Gradebook to Draft' : 'Publish Gradebook'}
          message={
            confirmPublishModal.targetGb?.isPublished
              ? `Revert ${confirmPublishModal.targetGb?.className} - ${confirmPublishModal.targetGb?.subject} to draft? Grades will be hidden from students until published again.`
              : `Publish grades for ${confirmPublishModal.targetGb?.className} - ${confirmPublishModal.targetGb?.subject}? Students in this class will immediately be able to view their scores.`
          }
          confirmText={confirmPublishModal.targetGb?.isPublished ? 'Revert to Draft' : 'Publish Gradebook'}
          confirmColor={confirmPublishModal.targetGb?.isPublished ? '#EF4444' : '#10B981'}
          isLoading={confirmPublishModal.isLoading}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW 2: CARDS OVERVIEW VIEW
  // ==========================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Title */}
      <div className="pt">
        <h2>Publish Grades</h2>
        <p>Review teacher gradesheets, make administrative adjustments, and officially publish results to students.</p>
      </div>

      {/* Search Bar - Full Width */}
      <SearchBar
        placeholder="Search class, subject, teacher..."
        value={searchTerm}
        onChange={(val) => setSearchTerm(val)}
        onSearch={(val) => setSearchTerm(val)}
      />

      {/* Filter Chips - Positioned below Search Bar */}
      <Chips
        items={['All', 'Published', 'Drafts']}
        activeItem={statusChip}
        onSelect={setStatusChip}
      />

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="gr">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredGradebooks.length === 0 && (
        <EmptyState
          title="No Gradebooks Found"
          description={
            searchTerm
              ? 'No gradebooks match your current search criteria.'
              : 'Teachers have not initialized any gradebooks yet.'
          }
        />
      )}

      {/* Gradebooks Grid */}
      {!isLoading && filteredGradebooks.length > 0 && (
        <div className="gr">
          {filteredGradebooks.map((gb) => {
            const isPub = Boolean(gb.isPublished);

            return (
              <div
                key={gb.id || gb._id}
                className="cd"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  {/* Top Row: Class Badge + Status Tag */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <Tag color="b">{gb.className || 'Class'}</Tag>
                    <Tag color={isPub ? 'g' : 'a'}>
                      {isPub ? 'Published' : 'Draft (Unpublished)'}
                    </Tag>
                  </div>

                  {/* Subject Name & Course Code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>
                      {gb.subject || 'Subject'}
                    </h3>
                    {gb.courseCode && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'var(--soft)',
                          color: 'var(--mute)'
                        }}
                      >
                        {gb.courseCode}
                      </span>
                    )}
                  </div>

                  {/* Meta Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--mute)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <User size={14} color="var(--p1)" />
                      <span>
                        Teacher: <b style={{ color: 'var(--ink)' }}>{gb.teacherName || 'Assigned'}</b>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <BookOpen size={14} color="var(--p1)" />
                      <span>
                        Assessments: <b style={{ color: 'var(--ink)' }}>{gb.assessmentsCount || 0} columns</b>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Users size={14} color="var(--p1)" />
                      <span>
                        Students Graded: <b style={{ color: 'var(--ink)' }}>{gb.studentsGraded || 0}</b>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div
                  className="cd-footer"
                  style={{
                    borderTop: '1px solid var(--line)',
                    paddingTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => handleOpenEditor(gb.id || gb._id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      background: 'var(--soft)',
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Edit3 size={14} />
                    <span>Update Gradebook</span>
                  </button>

                  {isPub ? (
                    <button
                      type="button"
                      onClick={(e) => handlePromptPublishToggle(gb, e)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#EF4444',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <X size={14} />
                      <span>Unpublish</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handlePromptPublishToggle(gb, e)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Globe size={14} />
                      <span>Publish</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Publish / Unpublish Toggle */}
      <ConfirmModal
        isOpen={confirmPublishModal.isOpen}
        onClose={() => setConfirmPublishModal({ isOpen: false, targetGb: null, isLoading: false })}
        onConfirm={handleConfirmPublishToggle}
        title={confirmPublishModal.targetGb?.isPublished ? 'Revert Gradebook to Draft' : 'Publish Gradebook'}
        message={
          confirmPublishModal.targetGb?.isPublished
            ? `Revert ${confirmPublishModal.targetGb?.className} - ${confirmPublishModal.targetGb?.subject} to draft? Grades will be hidden from students until published again.`
            : `Publish grades for ${confirmPublishModal.targetGb?.className} - ${confirmPublishModal.targetGb?.subject}? Students in this class will immediately be able to view their scores.`
        }
        confirmText={confirmPublishModal.targetGb?.isPublished ? 'Revert to Draft' : 'Publish Gradebook'}
        confirmColor={confirmPublishModal.targetGb?.isPublished ? '#EF4444' : '#10B981'}
        isLoading={confirmPublishModal.isLoading}
      />
    </div>
  );
}
