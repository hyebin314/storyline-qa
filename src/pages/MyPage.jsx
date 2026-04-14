import {
  Bell, Shield, HelpCircle, LogOut, ChevronRight,
  Users, BookOpen, Settings, Moon, Smartphone, Star,
} from 'lucide-react'

export default function MyPage() {
  return (
    <>
      <div className="page-header">
        <span className="page-header-title">마이</span>
        <div className="page-header-actions">
          <button className="icon-btn">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="my-profile-card">
        <div className="my-avatar">이</div>
        <div className="my-info">
          <div className="my-name">이지현 선생님</div>
          <div className="my-class">꽃봉오리반 담임 · 만 2세</div>
          <div className="my-stats">
            <div className="my-stat">
              <span className="my-stat-value">15</span>
              <span className="my-stat-label">원생수</span>
            </div>
            <div className="my-stat">
              <span className="my-stat-value">3년</span>
              <span className="my-stat-label">근무기간</span>
            </div>
            <div className="my-stat">
              <span className="my-stat-value">4.9</span>
              <span className="my-stat-label">만족도</span>
            </div>
          </div>
        </div>
      </div>

      {/* This Month Summary */}
      <div style={{ margin: '0 16px 16px' }}>
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-lg)',
          padding: '14px 16px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 12 }}>
            이번 달 활동 요약
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: '알림장 작성', value: '42건', icon: '📋', color: '#5E81F4' },
              { label: '공지 발송', value: '8건',  icon: '📢', color: '#14B8A6' },
              { label: '앨범 사진', value: '56장', icon: '📸', color: '#F97316' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{
                background: 'var(--bg)',
                borderRadius: 'var(--r-md)',
                padding: '10px 8px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu: 학급 관리 */}
      <div className="menu-group">
        <div className="menu-group-title">학급 관리</div>
        {[
          { icon: Users, label: '원생 관리', bg: '#EEF2FF', color: '#5E81F4', right: '15명' },
          { icon: BookOpen, label: '알림장 템플릿', bg: '#FFF7ED', color: '#F97316', right: '5개' },
          { icon: Star, label: '즐겨찾기 기능', bg: '#FEF3C7', color: '#D97706', right: '' },
        ].map(({ icon: Icon, label, bg, color, right }) => (
          <div key={label} className="menu-item">
            <div className="menu-item-icon" style={{ background: bg }}>
              <Icon size={16} style={{ color }} />
            </div>
            <span className="menu-item-label">{label}</span>
            <span className="menu-item-right">
              {right && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{right}</span>}
              <ChevronRight size={15} />
            </span>
          </div>
        ))}
      </div>

      {/* Menu: 알림 & 설정 */}
      <div className="menu-group">
        <div className="menu-group-title">알림 및 설정</div>
        {[
          { icon: Bell,       label: '알림 설정',    bg: '#CCFBF1', color: '#14B8A6' },
          { icon: Moon,       label: '다크 모드',    bg: '#EDE9FE', color: '#8B5CF6' },
          { icon: Smartphone, label: '앱 설정',      bg: '#F0FDF4', color: '#22C55E' },
        ].map(({ icon: Icon, label, bg, color }) => (
          <div key={label} className="menu-item">
            <div className="menu-item-icon" style={{ background: bg }}>
              <Icon size={16} style={{ color }} />
            </div>
            <span className="menu-item-label">{label}</span>
            <span className="menu-item-right">
              <ChevronRight size={15} />
            </span>
          </div>
        ))}
      </div>

      {/* Menu: 지원 */}
      <div className="menu-group">
        <div className="menu-group-title">지원</div>
        {[
          { icon: HelpCircle, label: '도움말 & FAQ',  bg: '#E0F2FE', color: '#0284C7' },
          { icon: Shield,     label: '개인정보 처리방침', bg: '#F3F4F6', color: '#6B7280' },
          { icon: LogOut,     label: '로그아웃',      bg: '#FEE2E2', color: '#EF4444' },
        ].map(({ icon: Icon, label, bg, color }) => (
          <div key={label} className="menu-item">
            <div className="menu-item-icon" style={{ background: bg }}>
              <Icon size={16} style={{ color }} />
            </div>
            <span className="menu-item-label" style={{ color: label === '로그아웃' ? '#EF4444' : undefined }}>
              {label}
            </span>
            {label !== '로그아웃' && (
              <span className="menu-item-right">
                <ChevronRight size={15} />
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '12px 16px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>스토리라인 v2.0.0</div>
      </div>
    </>
  )
}
