'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

// ─── Date helpers ─────────────────────────────────────────

function getMonday(date) {
  const d   = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function fmtTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // return new Date(date).toLocaleTimeString();
}

function fmtDate(date) {
  return new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function fmtWeekRange(monday) {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const start = monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const end   = sunday.toLocaleDateString('en-GB', { day: 'numeric', month: sameMonth ? undefined : 'short', year: 'numeric' });
  return `${start} – ${end}`;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const COURSE_LABELS = {
  NOORANI_QAIDA:    'Noorani Qaida',
  QURAN_RECITATION: 'Quran Recitation',
  TAJWEED:          'Tajweed',
  HIFZ:             'Hifz',
  ISLAMIC_STUDIES:  'Islamic Studies',
  ONE_TO_ONE:       '1-on-1',
};

const ATTENDANCE_CONFIG = {
  PRESENT: { label: 'Present',  color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', icon: '✓' },
  LATE:    { label: 'Late',     color: '#f97316', bg: '#fff7ed', border: '#fed7aa', icon: '⏰' },
  ABSENT:  { label: 'Absent',   color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '✗' },
  EXCUSED: { label: 'Excused',  color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: '📋' },
};

// ─── Status badge ─────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    SCHEDULED:  { label: 'Scheduled',  color: '#28b7d9', bg: 'rgba(40,183,217,0.10)' },
    COMPLETED:  { label: 'Completed',  color: '#22c55e', bg: 'rgba(34,197,94,0.10)'  },
    CANCELLED:  { label: 'Cancelled',  color: '#ef4444', bg: 'rgba(239,68,68,0.10)'  },
    MISSED:     { label: 'Missed',     color: '#f97316', bg: 'rgba(249,115,22,0.10)' },
  };
  const s = map[status] || { label: status, color: '#94a3b8', bg: '#f0f4f8' };
  return (
    <span style={{
      fontSize:     11,
      fontWeight:   700,
      color:        s.color,
      background:   s.bg,
      borderRadius: 6,
      padding:      '3px 8px',
      whiteSpace:   'nowrap',
    }}>
      {s.label}
    </span>
  );
}

// ─── Attendance status button ─────────────────────────────
function AttendanceBtn({ value, selected, onClick, disabled }) {
  const cfg = ATTENDANCE_CONFIG[value];
  return (
    <button
      onClick={() => !disabled && onClick(value)}
      disabled={disabled}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            6,
        padding:        '8px 14px',
        borderRadius:   8,
        border:         `1.5px solid ${selected ? cfg.border : '#e2e8f0'}`,
        background:     selected ? cfg.bg : 'white',
        color:          selected ? cfg.color : '#64748b',
        fontSize:       13,
        fontWeight:     selected ? 700 : 500,
        cursor:         disabled ? 'not-allowed' : 'pointer',
        opacity:        disabled ? 0.5 : 1,
        transition:     'all 150ms ease',
      }}
    >
      <span>{cfg.icon}</span>
      {cfg.label}
    </button>
  );
}

// ─── Zoom link editor ─────────────────────────────────────
function ZoomLinkEditor({ sessionId, initialLink, onSaved, apiFetch }) {
  const [editing,  setEditing]  = useState(false);
  const [value,    setValue]    = useState(initialLink || '');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/api/teacher/sessions/${sessionId}`, {
        method: 'PATCH',
        body:   JSON.stringify({ zoomLink: value.trim() || null }),
      });
      onSaved(value.trim() || null);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {initialLink ? (
          <a
            href={initialLink}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: '#0e6e8a', fontWeight: 600, wordBreak: 'break-all' }}
          >
            {initialLink}
          </a>
        ) : (
          <span style={{ fontSize: 13, color: '#94a3b8' }}>No zoom link set</span>
        )}
        <button
          onClick={() => setEditing(true)}
          style={{
            padding:      '4px 10px',
            borderRadius: 6,
            border:       '1px solid #e2e8f0',
            background:   'white',
            color:        '#64748b',
            fontSize:     12,
            fontWeight:   600,
            cursor:       'pointer',
            flexShrink:   0,
          }}
        >
          {initialLink ? 'Edit' : 'Add link'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="https://zoom.us/j/..."
          style={{
            flex:         1,
            padding:      '8px 12px',
            borderRadius: 8,
            border:       '1px solid #e2e8f0',
            fontSize:     13,
            outline:      'none',
            fontFamily:   'inherit',
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding:      '8px 14px',
            borderRadius: 8,
            border:       'none',
            background:   '#0d2840',
            color:        'white',
            fontSize:     13,
            fontWeight:   700,
            cursor:       saving ? 'wait' : 'pointer',
          }}
        >
          {saving ? '…' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setValue(initialLink || ''); }}
          style={{
            padding:      '8px 10px',
            borderRadius: 8,
            border:       '1px solid #e2e8f0',
            background:   'white',
            color:        '#64748b',
            fontSize:     13,
            cursor:       'pointer',
          }}
        >
          Cancel
        </button>
      </div>
      {error && <div style={{ fontSize: 12, color: '#ef4444' }}>{error}</div>}
    </div>
  );
}

// ─── Attendance panel ─────────────────────────────────────
function AttendancePanel({ session, record, onMarked, onUpdated, apiFetch }) {
  const [selectedStatus, setSelectedStatus] = useState(record?.status || null);
  const [notes,          setNotes]          = useState(record?.notes  || '');
  const [editing,        setEditing]        = useState(!record);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState('');

  // Sync if record changes externally
  useEffect(() => {
    if (record) {
      setSelectedStatus(record.status);
      setNotes(record.notes || '');
      setEditing(false);
    }
  }, [record]);

  const isPastSession = new Date(session.scheduledAt) < new Date(Date.now() - 30 * 60 * 1000);

  const handleSubmit = async () => {
    if (!selectedStatus) {
      setError('Select an attendance status');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (record) {
        // Update existing
        const data = await apiFetch(`/api/teacher/attendance/${record.id}`, {
          method: 'PATCH',
          body:   JSON.stringify({ status: selectedStatus, notes }),
        });
        onUpdated(data.record);
      } else {
        // Create new
        const data = await apiFetch('/api/teacher/attendance', {
          method: 'POST',
          body:   JSON.stringify({ sessionId: session.id, status: selectedStatus, notes }),
        });
        onMarked(data.record);
      }
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Session is in the future — don't show attendance marking
  if (!isPastSession && !record) {
    return (
      <div style={{
        padding:      '12px 14px',
        borderRadius: 8,
        background:   'rgba(40,183,217,0.06)',
        border:       '1px solid rgba(40,183,217,0.15)',
        fontSize:     13,
        color:        '#0e6e8a',
        fontWeight:   600,
      }}>
        ⏳ Attendance can be marked during or after the session.
      </div>
    );
  }

  // Already marked + not editing
  if (record && !editing) {
    const cfg = ATTENDANCE_CONFIG[record.status];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          6,
            padding:      '6px 12px',
            borderRadius: 8,
            background:   cfg.bg,
            border:       `1.5px solid ${cfg.border}`,
            color:        cfg.color,
            fontSize:     13,
            fontWeight:   700,
          }}>
            {cfg.icon} {cfg.label}
          </span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Marked {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => setEditing(true)}
            style={{
              marginLeft:   'auto',
              padding:      '5px 12px',
              borderRadius: 6,
              border:       '1px solid #e2e8f0',
              background:   'white',
              color:        '#64748b',
              fontSize:     12,
              fontWeight:   600,
              cursor:       'pointer',
            }}
          >
            Edit
          </button>
        </div>
        {record.notes && (
          <div style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>
            "{record.notes}"
          </div>
        )}
      </div>
    );
  }

  // Mark / Edit form
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Past session warning if unmarked */}
      {isPastSession && !record && (
        <div style={{
          padding:      '8px 12px',
          borderRadius: 8,
          background:   'rgba(249,115,22,0.08)',
          border:       '1px solid rgba(249,115,22,0.2)',
          fontSize:     12,
          color:        '#c2410c',
          fontWeight:   600,
        }}>
          ⚠️ This session hasn't been marked yet.
        </div>
      )}

      {/* Status buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Object.keys(ATTENDANCE_CONFIG).map(status => (
          <AttendanceBtn
            key={status}
            value={status}
            selected={selectedStatus === status}
            onClick={setSelectedStatus}
            disabled={saving}
          />
        ))}
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Optional notes (e.g. student joined 5 min late, excellent focus today)…"
        rows={2}
        style={{
          width:        '100%',
          padding:      '10px 12px',
          borderRadius: 8,
          border:       '1px solid #e2e8f0',
          fontSize:     13,
          fontFamily:   'inherit',
          resize:       'vertical',
          outline:      'none',
          boxSizing:    'border-box',
          color:        '#0f172a',
        }}
      />

      {error && (
        <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={saving || !selectedStatus}
          style={{
            padding:      '9px 18px',
            borderRadius: 8,
            border:       'none',
            background:   saving || !selectedStatus ? '#e2e8f0' : '#0d2840',
            color:        saving || !selectedStatus ? '#94a3b8' : 'white',
            fontSize:     13,
            fontWeight:   700,
            cursor:       saving || !selectedStatus ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : record ? 'Update Attendance' : 'Mark Attendance'}
        </button>
        {record && editing && (
          <button
            onClick={() => { setEditing(false); setSelectedStatus(record.status); setNotes(record.notes || ''); }}
            style={{
              padding:      '9px 14px',
              borderRadius: 8,
              border:       '1px solid #e2e8f0',
              background:   'white',
              color:        '#64748b',
              fontSize:     13,
              cursor:       'pointer',
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Session card ─────────────────────────────────────────
function SessionCard({ session, expanded, onToggle, attendanceRecord, onAttendanceMarked, onAttendanceUpdated, onZoomLinkSaved, apiFetch }) {
  const scheduled = new Date(session.scheduledAt);
  console.log("scheduled date:", session.scheduledAt);
  const now       = new Date();
  const diffMins  = Math.round((scheduled - now) / 60000);
  const isLive    = diffMins >= -30 && diffMins <= 30;
  const isUnmarkedPast = scheduled < new Date(now - 30 * 60 * 1000) && !attendanceRecord;

  const childName   = session.student?.name || session.student?.email?.split('@')[0] || 'Student';
  const courseLabel = COURSE_LABELS[session.courseType] || session.courseType;

  return (
    <div style={{
      background:   'white',
      borderRadius: 12,
      border:       `1px solid ${isLive ? '#28b7d9' : isUnmarkedPast ? '#fed7aa' : '#e2e8f0'}`,
      overflow:     'hidden',
      transition:   'box-shadow 150ms ease',
      boxShadow:    isLive ? '0 0 0 3px rgba(40,183,217,0.10)' : 'none',
    }}>

      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            14,
          width:          '100%',
          padding:        '16px 18px',
          background:     'transparent',
          border:         'none',
          cursor:         'pointer',
          textAlign:      'left',
        }}
      >
        {/* Time */}
        <div style={{ minWidth: 56, flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {fmtTime(session.scheduledAt)}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
            {session.durationMins || 30} min
          </div>
        </div>

        <div style={{ width: 1, height: 36, background: '#e2e8f0', flexShrink: 0 }} />

        {/* Student + course */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              {childName}
            </span>
            <span style={{
              fontSize:     11,
              fontWeight:   700,
              color:        '#0e6e8a',
              background:   'rgba(40,183,217,0.10)',
              borderRadius: 4,
              padding:      '2px 7px',
            }}>
              {courseLabel}
            </span>
            {isLive && (
              <span style={{
                fontSize:     11,
                fontWeight:   700,
                color:        '#faa71a',
                background:   'rgba(250,167,26,0.12)',
                borderRadius: 4,
                padding:      '2px 7px',
                animation:    'pulse 2s ease infinite',
              }}>
                ● Live
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <StatusBadge status={session.status} />
            {isUnmarkedPast && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316' }}>
                ⚠️ Attendance not marked
              </span>
            )}
            {attendanceRecord && (
              <span style={{
                fontSize:   11,
                fontWeight: 700,
                color:      ATTENDANCE_CONFIG[attendanceRecord.status]?.color || '#94a3b8',
              }}>
                {ATTENDANCE_CONFIG[attendanceRecord.status]?.icon} {ATTENDANCE_CONFIG[attendanceRecord.status]?.label}
              </span>
            )}
          </div>
        </div>

        {/* Live join button */}
        {isLive && session.zoomLink && (
          <a
            href={session.zoomLink}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            5,
              padding:        '8px 14px',
              borderRadius:   8,
              background:     '#faa71a',
              color:          '#0d2840',
              fontSize:       13,
              fontWeight:     700,
              textDecoration: 'none',
              flexShrink:     0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Join Now
          </a>
        )}

        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            flexShrink:  0,
            color:       '#94a3b8',
            transform:   expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition:  'transform 200ms ease',
          }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div style={{
          borderTop:  '1px solid #e2e8f0',
          padding:    '20px 18px',
          background: '#fafbfc',
          display:    'flex',
          flexDirection: 'column',
          gap:        20,
        }}>

          {/* Student info */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 8 }}>
              Student
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {[
                ['Name',     childName],
                ['Age',      session.student?.age ? `${session.student.age} yrs` : '—'],
                ['Country',  session.student?.country  || '—'],
                ['Timezone', session.student?.timezone || '—'],
                ['Parent',   session.student?.parentName || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Zoom link */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 8 }}>
              Zoom Link
            </div>
            <ZoomLinkEditor
              sessionId={session.id}
              initialLink={session.zoomLink}
              onSaved={onZoomLinkSaved}
              apiFetch={apiFetch}
            />
          </div>

          {/* Attendance */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 8 }}>
              Attendance
            </div>
            <AttendancePanel
              session={session}
              record={attendanceRecord}
              onMarked={onAttendanceMarked}
              onUpdated={onAttendanceUpdated}
              apiFetch={apiFetch}
            />
          </div>

          {/* Teacher notes if any */}
          {session.teacherNotes && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 8 }}>
                Your Notes
              </div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                {session.teacherNotes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function Skeleton({ height = 80 }) {
  return (
    <div style={{
      height,
      borderRadius: 12,
      background:   '#f0f4f8',
      animation:    'shimmer 1.5s ease infinite',
    }} />
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function SchedulePage() {
  const { getToken } = useAuth();

  const [monday,         setMonday]         = useState(() => getMonday(new Date()));
  const [sessions,       setSessions]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [selectedDay,    setSelectedDay]    = useState(null);   // null = all week
  const [expandedId,     setExpandedId]     = useState(null);
  const [attendanceMap,  setAttendanceMap]  = useState({});     // { sessionId: record | null }
  const [loadingAttMap,  setLoadingAttMap]  = useState({});     // { sessionId: bool }

  // Shared authenticated fetch
  const apiFetch = useCallback(async (path, options = {}) => {
    const token = await getToken();
    const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }, [getToken]);

  // Fetch sessions for the selected week
  // const fetchSessions = useCallback(async (weekMonday) => {
  //   setLoading(true);
  //   setError(null);
  //   setExpandedId(null);
  //   setAttendanceMap({});

  //   const from = weekMonday.toISOString();
  //   const to   = addDays(weekMonday, 6);
  //   to.setHours(23, 59, 59, 999);

  //   try {
  //     const data = await apiFetch(
  //       `/api/teacher/sessions?from=${from}&to=${to.toISOString()}`
  //     );
  //     console.log("data loaded for this teacher:", data);
  //     setSessions(data.sessions || []);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [apiFetch]);

  const fetchSessions = useCallback(async (weekMonday) => {
    setLoading(true);
    setError(null);
    setExpandedId(null);

    const from = weekMonday.toISOString();
    const to   = addDays(weekMonday, 6);
    to.setHours(23, 59, 59, 999);

    try {
      const data = await apiFetch(
        `/api/teacher/sessions?from=${from}&to=${to.toISOString()}`
      );
      const list = data.sessions || [];
      setSessions(list);

      // Seed attendance from the list response — each session already carries
      // its attendance record (or null). This makes collapsed cards correct on
      // first paint; no per-card fetch needed.
      const seeded = {};
      for (const s of list) {
        seeded[s.id] = s.attendance ?? null;   // record | null (null = genuinely unmarked)
      }
      setAttendanceMap(seeded);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchSessions(monday);
  }, [monday]);

  // Fetch attendance when expanding a session
  // const handleToggle = async (sessionId) => {
  //   if (expandedId === sessionId) {
  //     setExpandedId(null);
  //     return;
  //   }
  //   setExpandedId(sessionId);

  //   // Only fetch if we don't already have it
  //   if (attendanceMap[sessionId] !== undefined) return;

  //   setLoadingAttMap(prev => ({ ...prev, [sessionId]: true }));
  //   try {
  //     const data = await apiFetch(`/api/teacher/attendance/session/${sessionId}`);
  //     setAttendanceMap(prev => ({ ...prev, [sessionId]: data.attendance }));
  //   } catch {
  //     setAttendanceMap(prev => ({ ...prev, [sessionId]: null }));
  //   } finally {
  //     setLoadingAttMap(prev => ({ ...prev, [sessionId]: false }));
  //   }
  // };

  // Expand / collapse. Attendance is already seeded from the list — no fetch.
  const handleToggle = (sessionId) => {
    setExpandedId(prev => (prev === sessionId ? null : sessionId));
  };

  // Update sessions state when zoom link saved
  const handleZoomLinkSaved = (sessionId, newLink) => {
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, zoomLink: newLink } : s)
    );
  };

  // Update sessions + attendance map after marking/updating attendance
  const handleAttendanceMarked = (sessionId, record) => {
    setAttendanceMap(prev => ({ ...prev, [sessionId]: record }));
    setSessions(prev =>
      prev.map(s => s.id === sessionId
        ? { ...s, status: ['PRESENT', 'LATE'].includes(record.status) ? 'COMPLETED' : 'MISSED' }
        : s
      )
    );
  };

  // Week navigation
  const prevWeek = () => setMonday(m => addDays(m, -7));
  const nextWeek = () => setMonday(m => addDays(m, 7));
  const goToday  = () => { setMonday(getMonday(new Date())); setSelectedDay(null); };

  // Build day strips with session counts
  const dayData = Array.from({ length: 7 }, (_, i) => {
    const date  = addDays(monday, i);
    const count = sessions.filter(s => isSameDay(s.scheduledAt, date)).length;
    const hasUnmarked = sessions.some(s =>
      isSameDay(s.scheduledAt, date) &&
      new Date(s.scheduledAt) < new Date(Date.now() - 30 * 60 * 1000) &&
      !attendanceMap[s.id]
    );
    return { date, count, hasUnmarked, label: DAYS[i] };
  });

  // Filter sessions by selected day
  const filteredSessions = selectedDay
    ? sessions.filter(s => isSameDay(s.scheduledAt, selectedDay))
    : sessions;

  const isCurrentWeek = isSameDay(monday, getMonday(new Date()));

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Class Schedule
        </div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
          Manage sessions, mark attendance, and update class links.
        </div>
      </div>

      {/* Week navigation */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            12,
        marginBottom:   20,
        flexWrap:       'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={prevWeek}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          34,
              height:         34,
              borderRadius:   8,
              border:         '1px solid #e2e8f0',
              background:     'white',
              color:          '#64748b',
              cursor:         'pointer',
              fontSize:       16,
            }}
          >
            ‹
          </button>
          <button
            onClick={nextWeek}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          34,
              height:         34,
              borderRadius:   8,
              border:         '1px solid #e2e8f0',
              background:     'white',
              color:          '#64748b',
              cursor:         'pointer',
              fontSize:       16,
            }}
          >
            ›
          </button>
        </div>

        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {fmtWeekRange(monday)}
        </div>

        {!isCurrentWeek && (
          <button
            onClick={goToday}
            style={{
              padding:      '6px 12px',
              borderRadius: 8,
              border:       '1px solid #e2e8f0',
              background:   'white',
              color:        '#64748b',
              fontSize:     13,
              fontWeight:   600,
              cursor:       'pointer',
            }}
          >
            This week
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8' }}>
          {loading ? 'Loading…' : `${sessions.length} session${sessions.length !== 1 ? 's' : ''} this week`}
        </div>
      </div>

      {/* Day filter strip */}
      <div style={{
        display:       'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap:           6,
        marginBottom:  24,
      }}>
        {dayData.map(({ date, count, label }) => {
          const isSelected = selectedDay && isSameDay(date, selectedDay);
          const isToday    = isSameDay(date, new Date());
          return (
            <button
              key={label}
              onClick={() => setSelectedDay(
                selectedDay && isSameDay(date, selectedDay) ? null : date
              )}
              style={{
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                padding:        '10px 4px',
                borderRadius:   10,
                border:         `1px solid ${isSelected ? '#0d2840' : '#e2e8f0'}`,
                background:     isSelected ? '#0d2840' : isToday ? '#f7f9fb' : 'white',
                cursor:         'pointer',
                transition:     'all 150ms ease',
              }}
            >
              <span style={{
                fontSize:   11,
                fontWeight: 700,
                color:      isSelected ? 'rgba(255,255,255,0.6)' : '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {label}
              </span>
              <span style={{
                fontSize:   14,
                fontWeight: isToday ? 800 : 600,
                color:      isSelected ? 'white' : isToday ? '#28b7d9' : '#0f172a',
                marginTop:  2,
              }}>
                {date.getDate()}
              </span>
              {count > 0 && (
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                  {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                    <div key={i} style={{
                      width:        5,
                      height:       5,
                      borderRadius: '50%',
                      background:   isSelected ? 'rgba(255,255,255,0.7)' : '#28b7d9',
                    }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Session list */}
      {error && (
        <div style={{
          padding:      '14px 18px',
          borderRadius: 10,
          background:   'rgba(239,68,68,0.08)',
          border:       '1px solid rgba(239,68,68,0.2)',
          color:        '#dc2626',
          fontSize:     14,
          fontWeight:   600,
          marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton height={76} />
          <Skeleton height={76} />
          <Skeleton height={76} />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '60px 20px',
          background:     'white',
          borderRadius:   12,
          border:         '1px solid #e2e8f0',
          textAlign:      'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            {selectedDay ? `No classes on ${fmtDate(selectedDay)}` : 'No classes this week'}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            {selectedDay ? 'Select a different day or clear the filter.' : 'Enjoy the break!'}
          </div>
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              style={{
                marginTop:    16,
                padding:      '8px 16px',
                borderRadius: 8,
                border:       '1px solid #e2e8f0',
                background:   'white',
                color:        '#64748b',
                fontSize:     13,
                fontWeight:   600,
                cursor:       'pointer',
              }}
            >
              Show all sessions
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredSessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              expanded={expandedId === session.id}
              onToggle={() => handleToggle(session.id)}
              // attendanceRecord={
              //   loadingAttMap[session.id]
              //     ? undefined
              //     : attendanceMap[session.id]
              // }
              attendanceRecord={attendanceMap[session.id] ?? null}
              onAttendanceMarked={(record) => handleAttendanceMarked(session.id, record)}
              onAttendanceUpdated={(record) => handleAttendanceMarked(session.id, record)}
              onZoomLinkSaved={(newLink) => handleZoomLinkSaved(session.id, newLink)}
              apiFetch={apiFetch}
            />
          ))}
        </div>
      )}
    </>
  );
}