import { useState } from 'react'
import { Pin, Users, Eye, ChevronRight } from 'lucide-react'

const NOTICES = [
  {
    id: 1,
    category: '행사 안내',
    categoryColor: '#5E81F4',
    categoryBg: '#EEF2FF',
    title: '4월 봄 소풍 안내 🌸',
    date: '2026.04.14',
    readCount: 10,
    totalCount: 15,
    unread: false,
    pinned: true,
    preview: '오는 4월 21일(화) 꽃봉오리 공원으로 봄 소풍을 다녀올 예정입니다.',
  },
  {
    id: 2,
    category: '준비물 안내',
    categoryColor: '#F97316',
    categoryBg: '#FFF7ED',
    title: '다음 주 미술 수업 준비물',
    date: '2026.04.13',
    readCount: 8,
    totalCount: 15,
    unread: true,
    pinned: false,
    preview: '색종이, 가위(안전 가위), 풀 등을 지참해 주세요.',
  },
  {
    id: 3,
    category: '건강·안전',
    categoryColor: '#EF4444',
    categoryBg: '#FEE2E2',
    title: '수족구 감염병 예방 안내',
    date: '2026.04.12',
    readCount: 14,
    totalCount: 15,
    unread: false,
    pinned: false,
    preview: '최근 수족구병이 유행하고 있습니다. 손 씻기 생활화 부탁드립니다.',
  },
  {
    id: 4,
    category: '일반 공지',
    categoryColor: '#14B8A6',
    categoryBg: '#CCFBF1',
    title: '5월 가정통신문 발송 예정',
    date: '2026.04.11',
    readCount: 15,
    totalCount: 15,
    unread: false,
    pinned: false,
    preview: '5월 행사 일정 및 원비 납부 안내가 포함될 예정입니다.',
  },
  {
    id: 5,
    category: '식단표',
    categoryColor: '#A855F7',
    categoryBg: '#EDE9FE',
    title: '4월 3주 식단표 안내',
    date: '2026.04.10',
    readCount: 12,
    totalCount: 15,
    unread: true,
    pinned: false,
    preview: '이번 주 식단과 알레르기 정보를 확인해주세요.',
  },
]

const FILTER_TABS = ['전체', '행사 안내', '준비물', '건강·안전', '식단표']

export default function NoticePage() {
  const [filter, setFilter] = useState('전체')

  const filtered = NOTICES.filter(n => {
    if (filter === '전체') return true
    if (filter === '준비물') return n.category === '준비물 안내'
    return n.category === filter
  })

  const unreadCount = NOTICES.filter(n => n.unread).length

  return (
    <>
      <div className="page-header">
        <span className="page-header-title">공지</span>
        <div className="page-header-actions">
          <div className="icon-btn">
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="notice-stats">
        <div className="notice-stat-chip">
          <span className="notice-stat-value">{NOTICES.length}</span>
          <div className="notice-stat-label">전체 공지</div>
        </div>
        <div className="notice-stat-chip">
          <span className="notice-stat-value" style={{ color: '#5E81F4' }}>{unreadCount}</span>
          <div className="notice-stat-label">미확인</div>
        </div>
        <div className="notice-stat-chip">
          <span className="notice-stat-value" style={{ color: '#22C55E' }}>
            {Math.round((NOTICES.reduce((s, n) => s + n.readCount, 0) / NOTICES.reduce((s, n) => s + n.totalCount, 0)) * 100)}%
          </span>
          <div className="notice-stat-label">평균 열람률</div>
        </div>
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
          </button>
        ))}
      </div>

      {/* Notice List */}
      <div className="notice-list">
        {filtered.map(notice => (
          <div key={notice.id} className="notice-item">
            {notice.unread && <div className="notice-unread-dot" />}
            <div className="notice-content">
              <div className="notice-item-top">
                <span
                  className="notice-category"
                  style={{ background: notice.categoryBg, color: notice.categoryColor }}
                >
                  {notice.category}
                </span>
                {notice.pinned && (
                  <Pin size={12} className="notice-pinned-icon" style={{ color: '#F59E0B' }} />
                )}
              </div>
              <div className="notice-title">{notice.title}</div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-3)',
                  marginBottom: 8,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {notice.preview}
              </div>
              <div className="notice-meta">
                <span className="notice-date">{notice.date}</span>
                <span className="notice-read-count">
                  <Eye size={12} />
                  {notice.readCount}/{notice.totalCount}명
                </span>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-3)', flexShrink: 0, alignSelf: 'center' }} />
          </div>
        ))}
      </div>

      <div className="pb-safe" />
    </>
  )
}
