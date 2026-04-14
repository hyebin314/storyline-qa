import { useState } from 'react'
import { Plus, BookOpen, Megaphone, Image } from 'lucide-react'

const OPTIONS = [
  {
    type: 'album',
    label: '앨범 올리기',
    Icon: Image,
    bg: 'linear-gradient(135deg, #F97316, #FBBF24)',
  },
  {
    type: 'notice',
    label: '공지 작성',
    Icon: Megaphone,
    bg: 'linear-gradient(135deg, #14B8A6, #22C55E)',
  },
  {
    type: 'report',
    label: '알림장 작성',
    Icon: BookOpen,
    bg: 'linear-gradient(135deg, #5E81F4, #8B5CF6)',
  },
]

export default function FAB({ onOpen }) {
  const [open, setOpen] = useState(false)

  const handleOption = (type) => {
    setOpen(false)
    onOpen(type)
  }

  return (
    <>
      {open && (
        <div className="fab-backdrop" onClick={() => setOpen(false)} />
      )}
      <div className="fab-container">
        {open && (
          <div className="fab-options">
            {OPTIONS.map(({ type, label, Icon, bg }) => (
              <div key={type} className="fab-option">
                <span
                  className="fab-option-label"
                  onClick={() => handleOption(type)}
                >
                  {label}
                </span>
                <button
                  className="fab-option-icon"
                  style={{ background: bg, color: 'white' }}
                  onClick={() => handleOption(type)}
                >
                  <Icon size={20} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          className={`fab-main ${open ? 'open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="작성하기"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>
    </>
  )
}
