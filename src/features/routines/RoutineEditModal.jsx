import React, { useState, useEffect } from 'react';
import { X, Save, Edit2, RotateCcw, Clock, Coffee, AlertCircle } from 'lucide-react';
import { Tag, useToast } from '../../components/ui';
import { useUpdateRoutine } from '../../hooks/queries';

const SUBJECT_COLORS = {
  Math: '#D6ECEC',
  'English 1st': '#E8E4F3',
  'English 2nd': '#E0DDF0',
  English: '#E8E4F3',
  Science: '#DDEBDD',
  'Bangla 1st': '#FBE3D6',
  'Bangla 2nd': '#F7D9C9',
  Bangla: '#FBE3D6',
  BGS: '#F6E7CF',
  'Agri/Home Ec': '#E3EAEE',
  ICT: '#E2F0D9',
  Religion: '#FFF2CC',
  'Physical Ed': '#D9E1F2',
  'Arts & Crafts': '#FCE4D6',
  'Free Period': 'var(--soft, #f0f4f4)',
};

const getSubjectColor = (subject) => {
  if (!subject || subject === 'Free Period' || subject === '—') return 'var(--soft, #f0f4f4)';
  if (SUBJECT_COLORS[subject]) return SUBJECT_COLORS[subject];
  for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
    if (subject.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return 'var(--soft, #f0f4f4)';
};

const PERIOD_HEADER_INFO = [
  { p: 1, label: 'Period 1', time: '08:30–09:15', width: '13.5%' },
  { p: 2, label: 'Period 2', time: '09:15–10:00', width: '13.5%' },
  { p: 3, label: 'Period 3', time: '10:00–10:45', width: '13.5%' },
  { isBreak: true, label: 'Tiffin Break', time: '10:45–11:15', width: '9%' },
  { p: 4, label: 'Period 4', time: '11:15–12:00', width: '13.5%' },
  { p: 5, label: 'Period 5', time: '12:00–12:45', width: '13.5%' },
  { p: 6, label: 'Period 6', time: '12:45–01:30', width: '13.5%' },
];

export function RoutineEditModal({ routine, isOpen, onClose }) {
  const { addToast } = useToast();
  const updateRoutineMutation = useUpdateRoutine();

  const [isEditing, setIsEditing] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    if (routine?.schedule) {
      setScheduleData(JSON.parse(JSON.stringify(routine.schedule)));
      setIsEditing(false);
    }
  }, [routine]);

  if (!isOpen || !routine) return null;

  const isClassType = routine.type === 'class';

  const handleCellChange = (dayIndex, periodNumber, field, value) => {
    setScheduleData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const dayObj = copy[dayIndex];
      if (!dayObj) return prev;
      let periodObj = dayObj.periods.find((p) => p.periodNumber === periodNumber);
      if (!periodObj) {
        periodObj = { periodNumber, startTime: '', endTime: '' };
        dayObj.periods.push(periodObj);
      }
      periodObj[field] = value;
      return copy;
    });
  };

  const handleSave = async () => {
    try {
      await updateRoutineMutation.mutateAsync({
        id: routine._id || routine.id,
        data: {
          schedule: scheduleData,
        },
      });
      addToast('Routine updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to update routine', 'error');
    }
  };

  const handleReset = () => {
    if (routine?.schedule) {
      setScheduleData(JSON.parse(JSON.stringify(routine.schedule)));
      setIsEditing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 18, 24, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="cd"
        style={{
          width: '95%',
          maxWidth: '1080px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
          border: '1px solid var(--line)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              className="dt"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isClassType ? 'rgba(30,111,120,0.15)' : 'rgba(245,158,108,0.15)',
              }}
            >
              <Clock
                size={18}
                style={{ color: isClassType ? 'var(--p1)' : '#B25E29' }}
                strokeWidth={2}
              />
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--ink)' }}>
                  {routine.title}
                </h2>
                <Tag color={isClassType ? 'g' : 'a'}>
                  {isClassType ? 'Student Routine' : 'Teacher Schedule'}
                </Tag>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--mute)' }}>
                Academic Year {routine.academicYear || '2025/2026'} • 5 Days / 6 Periods Daily + Tiffin Break
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="cd-btn-view"
                  onClick={handleReset}
                  style={{ height: '32px', fontSize: '12px', fontWeight: 600 }}
                >
                  <RotateCcw size={13} /> Cancel
                </button>
                <button
                  type="button"
                  className="pb"
                  onClick={handleSave}
                  disabled={updateRoutineMutation.isPending}
                  style={{
                    height: '32px',
                    padding: '0 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Save size={13} /> {updateRoutineMutation.isPending ? 'Saving...' : 'Save Routine'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="cd-btn-view"
                onClick={() => setIsEditing(true)}
                style={{ height: '32px', fontSize: '12px', fontWeight: 700 }}
              >
                <Edit2 size={13} /> Edit Routine
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--mute)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '4px',
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Table View */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, background: 'var(--bg)' }}>
          {isEditing && (
            <div
              style={{
                marginBottom: '14px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: 'rgba(30,111,120,0.1)',
                border: '1px solid rgba(30,111,120,0.22)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--ink)',
              }}
            >
              <AlertCircle size={15} style={{ color: 'var(--p1)', flexShrink: 0 }} />
              <span>
                <b>Edit Mode:</b> Update subjects and instructors directly in the table. Click <b>"Save Routine"</b> to apply changes immediately to all dashboards.
              </span>
            </div>
          )}

          <div
            style={{
              borderRadius: '12px',
              border: '1px solid var(--line)',
              background: 'var(--card)',
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'center',
                fontSize: '12px',
                tableLayout: 'fixed',
              }}
            >
              <thead>
                <tr style={{ background: 'var(--soft)', borderBottom: '1px solid var(--line)' }}>
                  <th
                    style={{
                      padding: '10px 12px',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      width: '10%',
                      textAlign: 'left',
                      borderRight: '1px solid var(--line)',
                      fontSize: '12px',
                    }}
                  >
                    Day
                  </th>
                  {PERIOD_HEADER_INFO.map((col, idx) => (
                    <th
                      key={idx}
                      style={{
                        padding: '10px 6px',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        width: col.width,
                        borderRight: idx < PERIOD_HEADER_INFO.length - 1 ? '1px solid var(--line)' : 'none',
                        background: col.isBreak ? 'rgba(245, 158, 108, 0.08)' : 'transparent',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 800 }}>{col.label}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--mute)', marginTop: '1px', fontWeight: 500 }}>
                        {col.time}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((dayObj, dayIdx) => (
                  <tr
                    key={dayObj.day}
                    style={{
                      borderBottom: dayIdx < scheduleData.length - 1 ? '1px solid var(--line)' : 'none',
                    }}
                  >
                    {/* Day Column */}
                    <td
                      style={{
                        padding: '10px 12px',
                        fontWeight: 800,
                        color: 'var(--ink)',
                        textAlign: 'left',
                        background: 'var(--soft)',
                        borderRight: '1px solid var(--line)',
                        fontSize: '12px',
                      }}
                    >
                      {dayObj.day}
                    </td>

                    {/* Periods 1, 2, 3 */}
                    {[1, 2, 3].map((pNum) => {
                      const period = dayObj.periods?.find((p) => p.periodNumber === pNum) || {};
                      const rawSubject = period.subject || '—';
                      const isFree = !rawSubject || rawSubject === 'Free Period' || rawSubject === '—';
                      const pillBg = getSubjectColor(rawSubject);
                      const displayTitle = isFree ? (isClassType ? '—' : 'Free') : rawSubject;
                      const displaySub = isClassType ? period.teacherName : period.sectionName;

                      return (
                        <td
                          key={pNum}
                          style={{
                            padding: '6px',
                            borderRight: '1px solid var(--line)',
                            verticalAlign: 'middle',
                          }}
                        >
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <input
                                type="text"
                                value={period.subject || ''}
                                placeholder="Subject"
                                onChange={(e) => handleCellChange(dayIdx, pNum, 'subject', e.target.value)}
                                style={{
                                  width: '100%',
                                  height: '24px',
                                  padding: '2px 6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  border: '1px solid var(--line)',
                                  background: 'var(--card)',
                                  color: 'var(--ink)',
                                  textAlign: 'center',
                                  boxSizing: 'border-box',
                                }}
                              />
                              <input
                                type="text"
                                value={isClassType ? period.teacherName || '' : period.sectionName || ''}
                                placeholder={isClassType ? 'Teacher' : 'Section'}
                                onChange={(e) =>
                                  handleCellChange(
                                    dayIdx,
                                    pNum,
                                    isClassType ? 'teacherName' : 'sectionName',
                                    e.target.value
                                  )
                                }
                                style={{
                                  width: '100%',
                                  height: '22px',
                                  padding: '2px 6px',
                                  fontSize: '10px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--line)',
                                  background: 'var(--soft)',
                                  color: 'var(--mute)',
                                  textAlign: 'center',
                                  boxSizing: 'border-box',
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                background: pillBg,
                                color: '#0A1C24',
                                padding: '6px 4px',
                                borderRadius: '8px',
                                minHeight: '44px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isFree ? 0.45 : 1,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: '11.5px',
                                  lineHeight: 1.2,
                                  color: isFree ? 'var(--mute)' : '#0A1C24',
                                }}
                              >
                                {displayTitle}
                              </div>
                              {!isFree && displaySub && (
                                <div
                                  style={{
                                    fontSize: '10px',
                                    color: '#41555A',
                                    fontWeight: 600,
                                    marginTop: '2px',
                                  }}
                                >
                                  {isClassType ? `(${displaySub})` : displaySub}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Tiffin Break Column */}
                    <td
                      style={{
                        padding: '6px 4px',
                        background: 'rgba(245, 158, 108, 0.04)',
                        borderRight: '1px solid var(--line)',
                        verticalAlign: 'middle',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '2px',
                          padding: '6px 2px',
                          borderRadius: '6px',
                          background: 'rgba(245, 158, 108, 0.14)',
                          color: '#B25E29',
                          fontWeight: 800,
                          fontSize: '10px',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        <Coffee size={11} />
                        <span>Break</span>
                      </div>
                    </td>

                    {/* Periods 4, 5, 6 */}
                    {[4, 5, 6].map((pNum) => {
                      const period = dayObj.periods?.find((p) => p.periodNumber === pNum) || {};
                      const rawSubject = period.subject || '—';
                      const isFree = !rawSubject || rawSubject === 'Free Period' || rawSubject === '—';
                      const pillBg = getSubjectColor(rawSubject);
                      const displayTitle = isFree ? (isClassType ? '—' : 'Free') : rawSubject;
                      const displaySub = isClassType ? period.teacherName : period.sectionName;

                      return (
                        <td
                          key={pNum}
                          style={{
                            padding: '6px',
                            borderRight: pNum < 6 ? '1px solid var(--line)' : 'none',
                            verticalAlign: 'middle',
                          }}
                        >
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <input
                                type="text"
                                value={period.subject || ''}
                                placeholder="Subject"
                                onChange={(e) => handleCellChange(dayIdx, pNum, 'subject', e.target.value)}
                                style={{
                                  width: '100%',
                                  height: '24px',
                                  padding: '2px 6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  border: '1px solid var(--line)',
                                  background: 'var(--card)',
                                  color: 'var(--ink)',
                                  textAlign: 'center',
                                  boxSizing: 'border-box',
                                }}
                              />
                              <input
                                type="text"
                                value={isClassType ? period.teacherName || '' : period.sectionName || ''}
                                placeholder={isClassType ? 'Teacher' : 'Section'}
                                onChange={(e) =>
                                  handleCellChange(
                                    dayIdx,
                                    pNum,
                                    isClassType ? 'teacherName' : 'sectionName',
                                    e.target.value
                                  )
                                }
                                style={{
                                  width: '100%',
                                  height: '22px',
                                  padding: '2px 6px',
                                  fontSize: '10px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--line)',
                                  background: 'var(--soft)',
                                  color: 'var(--mute)',
                                  textAlign: 'center',
                                  boxSizing: 'border-box',
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                background: pillBg,
                                color: '#0A1C24',
                                padding: '6px 4px',
                                borderRadius: '8px',
                                minHeight: '44px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isFree ? 0.45 : 1,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: '11.5px',
                                  lineHeight: 1.2,
                                  color: isFree ? 'var(--mute)' : '#0A1C24',
                                }}
                              >
                                {displayTitle}
                              </div>
                              {!isFree && displaySub && (
                                <div
                                  style={{
                                    fontSize: '10px',
                                    color: '#41555A',
                                    fontWeight: 600,
                                    marginTop: '2px',
                                  }}
                                >
                                  {isClassType ? `(${displaySub})` : displaySub}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
