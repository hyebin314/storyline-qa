import { useState } from 'react'
import { Search, ChevronRight, Filter } from 'lucide-react'

const STUDENTS = [
  { id: 1, name: '김민준', status: 'done',    preview: '컨디션 좋음 · 점심 완식 · 낮잠 1h30m', bg: '#EEF2FF', color: '#5E81F4', absent: false },
  { id: 2, name: '이서연', status: 'done',    preview: '컨디션 좋음 · 점심 완식 · 낮잠 2h',    bg: '#FDF4FF', color: '#A855F7', absent: false },
  { id: 3, name: '박지호', status: 'pending', preview: '미작성',                                bg: '#FFF7ED', color: '#F97316', absent: false },
  { id: 4, name: '최예린', status: 'done',    preview: '컨디션 보통 · 점심 반식 · 낮잠 1h',    bg: '#F0FDF4', color: '#22C55E', absent: false },
  { id: 5, name: '정우진', status: 'pending', preview: '미작성',                                bg: '#FFF1F2', color: '#F43F5E', absent: false },
  { id: 6, name: '한소율', status: 'done',    preview: '컨디션 매우좋음 · 점심 완식 · 낮잠 없음', bg: '#CCFBF1', color: '#14B8A6', absent: false },
  { id: 7, name: '오지민', status: 'absent',  preview: '결석',                                  bg: '#F3F4F6', color: '#6B7280', absent: true  },
  { id: 8, name: '강태양', status: 'done',    preview: '컨디션 좋음 · 점심 완식 · 낮잠 1h',    bg: '#FFFBEB', color: '#D97706', absent: false },
  { id: 9, name: '윤하은', status: 'pending', preview: '미작성',                                bg: '#FEF3C7', color: '#D97706', absent: false },
  { id: 10, name: '임준호', status: 'done',   preview: '컨디션 좋음 · 점심 완식 · 낮잠 1h30m', bg: '#E0F2FE', color: '#0284C7', absent: false },
  { id: 11, name: '신지아', status: 'done',   preview: '컨디션 좋음 · 점심 완식 · 낮잠 2h',    bg: '#FCE7F3', color: '#DB2777', absent: false },
  { id: 12, name: '배수현', status: 'pending', preview: '미작성',                               bg: '#F5F3FF', color: '#7C3AED', absent: false },
]

const FILTER_TABS = ['전체', '미작성', '작성완료', '결석']

export default function DailyReportPage() {
  const [filter, setFilter] = useState('전체')
  const [search, setSearch] = useState('')

  const filtered = STUDENTS.filter(s => {
    const matchSearch = s.name.includes(search)
    if (filter === '전체') return matchSearch
    if (filter === '미작성') return s.status === 'pending' && matchSearch
    if (filter === '작성완료') return s.status === 'done' && matchSearch
    if (filter === '결석') return s.status === 'absent' && matchSearch
    return matchSearch
  })

  const doneCount    = STUDENTS.filter(s => s.status === 'done').length
  const pendingCount = STUDENTS.filter(s => s.status === 'pending').length
  const absentCount  = STUDENTS.filter(s => s.status === 'absent').length

  return (
    <>
      <div className="page-header">
        <span className="page-header-title">알림장</span>
        <div className="page-header-actions">
          <button className="icon-btn">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="report-summary-bar">
        <div className="rsum-chip">
          <span className="rsum-value" style={{ color: '#16A34A' }}>{doneCount}</span>
          <span className="rsum-label">작성완료</span>
        </div>
        <div className="rsum-chip">
          <span className="rsum-value" style={{ color: '#D97706' }}>{pendingCount}</span>
          <span className="rsum-label">미작성</span>
        </div>
        <div className="rsum-chip">
          <span className="rsum-value" style={{ color: '#6B7280' }}>{absentCount}</span>
          <span className="rsum-label">결석</span>
        </div>
        <div className="rsum-chip">
          <span className="rsum-value">{STUDENTS.length}</span>
          <span className="rsum-label">전체</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px 8px', position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 28, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-3)',
          }}
        />
        <input
          className="form-input"
          style={{ paddingLeft: 38 }}
          placeholder="원생 이름으로 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="tab-filter">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            className={`tab-chip ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
            {tab === '미작성' && pendingCount > 0 && (
              <span style={{
                marginLeft: 4,
                background: filter === tab ? 'rgba(255,255,255,0.3)' : '#FEF3C7',
                color: filter === tab ? 'white' : '#D97706',
                borderRadius: 99, padding: '0 5px', fontSize: 10, fontWeight: 700,
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Date Label */}
      <div className="report-date-label">
        2026년 4월 14일 화요일 · 꽃봉오리반
      </div>

      {/* Student List */}
      <div className="report-date-group">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">해당하는 원생이 없어요</div>
          </div>
        ) : (
          filtered.map(student => (
            <div key={student.id} className="report-item">
              <div
                className="student-avatar"
                style={{
                  background: student.bg,
                  color: student.color,
                  border: `2px solid ${student.color}20`,
                }}
              >
                {student.name[0]}
              </div>
              <div className="report-info">
                <div className="report-student-name">{student.name}</div>
                <div className="report-preview">{student.preview}</div>
              </div>
              <span
                className={`report-status ${student.status}`}
              >
                {student.status === 'done' ? '작성완료' : student.status === 'absent' ? '결석' : '미작성'}
              </span>
              <ChevronRight size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            </div>
          ))
        )}
      </div>

      <div className="pb-safe" />
    </>
  )
}
