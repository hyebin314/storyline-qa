import { Bell, ChevronRight, BookOpen, Megaphone, Image, Users, ClipboardList, TrendingUp, Star, MessageCircle } from 'lucide-react'

const TODAY = '2026년 4월 14일 화요일'

// ───── Mini ring chart ─────
function MealRing({ pct, color }) {
  const r = 22, c = 28
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <div className="meal-ring">
      <svg width={c * 2} height={c * 2} viewBox={`0 0 ${c * 2} ${c * 2}`}>
        <circle className="meal-ring-track" cx={c} cy={c} r={r} />
        <circle
          className="meal-ring-fill"
          cx={c} cy={c} r={r}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="meal-ring-text">{pct}%</div>
    </div>
  )
}

// ───── Week bar chart ─────
const DAYS = [
  { day: '월', count: 13, today: false },
  { day: '화', count: 12, today: true  },
  { day: '수', count: 0,  today: false },
  { day: '목', count: 0,  today: false },
  { day: '금', count: 0,  today: false },
]
const MAX_COUNT = 15

function WeekChart() {
  return (
    <div className="week-chart">
      {DAYS.map(({ day, count, today }) => (
        <div key={day} className={`bar-group ${today ? 'bar-today' : ''}`}>
          <div className="bar-track">
            <div
              className="bar"
              style={{
                height: count ? `${(count / MAX_COUNT) * 100}%` : '4px',
                background: today
                  ? 'linear-gradient(180deg, #5E81F4, #8B5CF6)'
                  : count ? '#C7D2FE' : '#E5E7EB',
                opacity: !count ? 0.4 : 1,
              }}
            />
          </div>
          <span className="bar-day" style={{ color: today ? 'var(--primary)' : undefined, fontWeight: today ? 700 : undefined }}>
            {day}
          </span>
        </div>
      ))}
    </div>
  )
}

// ───── Activity feed ─────
const ACTIVITIES = [
  { name: '김민준 부모님', text: '알림장 확인했어요 👍 오늘도 고마워요 선생님!', time: '5분 전', bg: '#EEF2FF', color: '#5E81F4' },
  { name: '이서연 부모님', text: '낮잠 잘 잤군요 ☺️ 집에서도 컨디션 좋겠네요', time: '23분 전', bg: '#FDF4FF', color: '#A855F7' },
  { name: '박지호 부모님', text: '점심을 반식만 했네요, 저녁은 많이 챙겨줄게요!', time: '1시간 전', bg: '#FFF7ED', color: '#F97316' },
  { name: '최예린 부모님', text: '사진 감사해요! 너무 귀엽네요 🌸', time: '2시간 전', bg: '#F0FDF4', color: '#22C55E' },
]

export default function HomePage({ onOpenWrite }) {
  return (
    <>
      {/* ── Banner ── */}
      <div className="home-banner">
        <div className="home-banner-top">
          <div className="app-logo">
            <div className="app-logo-icon">🌱</div>
            <span className="app-logo-name">스토리라인</span>
          </div>
          <div className="home-banner-actions">
            <button className="banner-icon-btn">
              <Bell size={18} />
              <span className="banner-badge" />
            </button>
            <div className="teacher-avatar-btn">이</div>
          </div>
        </div>
        <div className="home-greeting">안녕하세요,<br />이지현 선생님 🌸</div>
        <div className="home-date-row" style={{ marginTop: 6 }}>
          <span className="home-date">{TODAY}</span>
          <span className="home-class-tag">꽃봉오리반</span>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="quick-stats">
        {/* 등원 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: '#EEF2FF', color: '#5E81F4' }}>
              <Users size={16} />
            </div>
            <span className="stat-tag" style={{ background: '#DCFCE7', color: '#16A34A' }}>등원중</span>
          </div>
          <div className="stat-value">12<span>/15명</span></div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: '80%', background: 'linear-gradient(90deg, #5E81F4, #8B5CF6)' }} />
          </div>
          <div className="stat-label">결석 2명 · 미등원 1명</div>
        </div>

        {/* 알림장 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: '#FFF7ED', color: '#F97316' }}>
              <BookOpen size={16} />
            </div>
            <span className="stat-tag" style={{ background: '#FEF3C7', color: '#D97706' }}>미완 4건</span>
          </div>
          <div className="stat-value">8<span>/12건</span></div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: '67%', background: 'linear-gradient(90deg, #F97316, #FBBF24)' }} />
          </div>
          <div className="stat-label">오늘 알림장 작성률</div>
        </div>

        {/* 공지 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: '#CCFBF1', color: '#14B8A6' }}>
              <Megaphone size={16} />
            </div>
            <span className="stat-tag" style={{ background: '#CCFBF1', color: '#0D9488' }}>미읽음 2</span>
          </div>
          <div className="stat-value">3<span>건</span></div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: '100%', background: 'linear-gradient(90deg, #14B8A6, #22C55E)' }} />
          </div>
          <div className="stat-label">이번주 공지 발송</div>
        </div>

        {/* 앨범 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: '#FDF4FF', color: '#A855F7' }}>
              <Image size={16} />
            </div>
            <span className="stat-tag" style={{ background: '#EDE9FE', color: '#7C3AED' }}>이번주</span>
          </div>
          <div className="stat-value">14<span>장</span></div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: '70%', background: 'linear-gradient(90deg, #A855F7, #EC4899)' }} />
          </div>
          <div className="stat-label">학부모 좋아요 38개</div>
        </div>
      </div>

      {/* ── Action Required ── */}
      <div className="section">
        <div className="section-header">
          <span className="section-title">⚡ 지금 해야 할 일</span>
        </div>
      </div>
      <div className="action-list">
        <div className="action-card" onClick={() => onOpenWrite('report')}>
          <div className="action-icon" style={{ background: '#FEF3C7' }}>
            <ClipboardList size={20} style={{ color: '#D97706' }} />
          </div>
          <div className="action-info">
            <div className="action-title">미작성 알림장 4건</div>
            <div className="action-desc">박지호, 최예린 외 2명</div>
          </div>
          <span className="action-cta">작성하기</span>
        </div>
        <div className="action-card">
          <div className="action-icon" style={{ background: '#CCFBF1' }}>
            <Megaphone size={20} style={{ color: '#14B8A6' }} />
          </div>
          <div className="action-info">
            <div className="action-title">예약 공지 발송 대기</div>
            <div className="action-desc">4월 현장학습 안내 · 오늘 오후 3시</div>
          </div>
          <span className="action-cta">확인</span>
        </div>
      </div>

      {/* ── Class Insights ── */}
      <div className="section">
        <div className="section-header">
          <span className="section-title">📊 학급 인사이트</span>
          <span className="section-more">
            더보기 <ChevronRight size={14} />
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Week attendance */}
          <div className="insight-card">
            <div className="insight-title">
              <TrendingUp size={14} style={{ color: '#5E81F4' }} />
              이번 주 등원 현황 (평균 12.5명)
            </div>
            <WeekChart />
          </div>

          {/* Meal stats */}
          <div className="insight-card">
            <div className="insight-title">🍱 오늘 식사 현황 (12명 기준)</div>
            <div className="meal-grid">
              <div className="meal-item">
                <div className="meal-label">아침 식사</div>
                <MealRing pct={83} color="#5E81F4" />
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>완식률</div>
              </div>
              <div className="meal-item">
                <div className="meal-label">점심 급식</div>
                <MealRing pct={75} color="#14B8A6" />
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>완식률</div>
              </div>
              <div className="meal-item">
                <div className="meal-label">오후 간식</div>
                <MealRing pct={92} color="#F97316" />
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>완식률</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Shortcuts ── */}
      <div className="section">
        <div className="section-header">
          <span className="section-title">🔗 바로가기</span>
        </div>
        <div className="shortcut-grid">
          <div className="shortcut-item" onClick={() => onOpenWrite('report')}>
            <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #5E81F4, #8B5CF6)' }}>
              <BookOpen size={22} color="white" />
            </div>
            <span className="shortcut-label">알림장<br/>작성</span>
          </div>
          <div className="shortcut-item" onClick={() => onOpenWrite('notice')}>
            <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #14B8A6, #22C55E)' }}>
              <Megaphone size={22} color="white" />
            </div>
            <span className="shortcut-label">공지<br/>작성</span>
          </div>
          <div className="shortcut-item" onClick={() => onOpenWrite('album')}>
            <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #F97316, #FBBF24)' }}>
              <Image size={22} color="white" />
            </div>
            <span className="shortcut-label">앨범<br/>업로드</span>
          </div>
          <div className="shortcut-item">
            <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #EC4899, #F97316)' }}>
              <Users size={22} color="white" />
            </div>
            <span className="shortcut-label">원생<br/>관리</span>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section-header">
          <span className="section-title">
            <MessageCircle size={15} style={{ display: 'inline', verticalAlign: -3, marginRight: 4, color: '#5E81F4' }} />
            최근 학부모 반응
          </span>
          <span className="section-more">전체보기 <ChevronRight size={14} /></span>
        </div>
      </div>
      <div className="activity-list">
        {ACTIVITIES.map((a, i) => (
          <div key={i} className="activity-item">
            <div className="activity-avatar" style={{ background: a.bg, color: a.color }}>
              {a.name[0]}
            </div>
            <div className="activity-body">
              <div className="activity-name">{a.name}</div>
              <div className="activity-text">{a.text}</div>
            </div>
            <span className="activity-time">{a.time}</span>
          </div>
        ))}
      </div>

      <div className="pb-safe" />
    </>
  )
}
