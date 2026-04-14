import { Home, BookOpen, Megaphone, Image, User } from 'lucide-react'

const TABS = [
  { id: 'home',   label: '홈',    Icon: Home,      dot: false },
  { id: 'report', label: '알림장', Icon: BookOpen,  dot: true  },
  { id: 'notice', label: '공지',   Icon: Megaphone, dot: true  },
  { id: 'album',  label: '앨범',   Icon: Image,     dot: false },
  { id: 'my',     label: '마이',   Icon: User,      dot: false },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className="tab-bar">
      {TABS.map(({ id, label, Icon, dot }) => (
        <button
          key={id}
          className={`tab-item ${activeTab === id ? 'active' : ''}`}
          onClick={() => onTabChange(id)}
        >
          {dot && activeTab !== id && <span className="tab-dot" />}
          <span className="tab-icon-wrap">
            <Icon size={20} strokeWidth={activeTab === id ? 2.2 : 1.8} />
          </span>
          <span className="tab-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
