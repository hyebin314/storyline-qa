import { useState } from 'react'
import { Grid3X3, FolderOpen, Heart, ChevronRight } from 'lucide-react'

const PHOTOS = [
  { emoji: '🌸', bg: 'linear-gradient(135deg, #FDF4FF, #FCE7F3)', likes: 8, date: '04.14' },
  { emoji: '🎨', bg: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', likes: 5, date: '04.14' },
  { emoji: '🧩', bg: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', likes: 12, date: '04.14' },
  { emoji: '🌈', bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', likes: 7, date: '04.13' },
  { emoji: '🎭', bg: 'linear-gradient(135deg, #CCFBF1, #99F6E4)', likes: 9, date: '04.13' },
  { emoji: '🏃', bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', likes: 4, date: '04.12' },
  { emoji: '🎵', bg: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)', likes: 11, date: '04.12' },
  { emoji: '🌿', bg: 'linear-gradient(135deg, #F0FDF4, #BBF7D0)', likes: 6, date: '04.11' },
  { emoji: '🎈', bg: 'linear-gradient(135deg, #EEF2FF, #C7D2FE)', likes: 15, date: '04.11' },
]

const FOLDERS = [
  { name: '봄 소풍 준비', emoji: '🌸', count: 24, bg: 'linear-gradient(135deg, #FDF4FF, #FCE7F3)', date: '04.14' },
  { name: '미술 활동', emoji: '🎨', count: 18, bg: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', date: '04.13' },
  { name: '자유 놀이', emoji: '🧩', count: 32, bg: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', date: '04.12' },
  { name: '체육 활동', emoji: '🏃', count: 14, bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', date: '04.11' },
]

export default function AlbumPage() {
  const [mode, setMode] = useState('grid')

  const totalLikes = PHOTOS.reduce((s, p) => s + p.likes, 0)

  return (
    <>
      <div className="page-header">
        <span className="page-header-title">앨범</span>
        <div className="page-header-actions">
          <div
            className="icon-btn"
            style={{
              fontSize: 12, fontWeight: 600,
              color: 'var(--text-3)', gap: 3, display: 'flex', alignItems: 'center',
            }}
          >
            <Heart size={14} style={{ color: '#EC4899' }} />
            {totalLikes}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '10px 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        {[
          { label: '이번주 사진', value: `${PHOTOS.length}장`, color: '#5E81F4' },
          { label: '좋아요', value: `${totalLikes}개`, color: '#EC4899' },
          { label: '앨범', value: `${FOLDERS.length}개`, color: '#F97316' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              flex: 1, textAlign: 'center',
              padding: '8px 4px',
              borderRadius: 'var(--r-md)',
              background: 'var(--bg)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Mode Toggle */}
      <div style={{ padding: '12px 16px 10px' }}>
        <div className="album-mode-toggle">
          <button
            className={`album-mode-btn ${mode === 'grid' ? 'active' : ''}`}
            onClick={() => setMode('grid')}
          >
            <Grid3X3 size={15} />
            사진 보기
          </button>
          <button
            className={`album-mode-btn ${mode === 'folder' ? 'active' : ''}`}
            onClick={() => setMode('folder')}
          >
            <FolderOpen size={15} />
            앨범 보기
          </button>
        </div>
      </div>

      {mode === 'grid' ? (
        <>
          {/* Date group */}
          <div style={{ padding: '0 16px 8px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, letterSpacing: '0.04em' }}>
              이번 주 · {PHOTOS.length}장
            </div>
            <div className="album-grid">
              {PHOTOS.map((photo, i) => (
                <div key={i} className="album-photo">
                  <div
                    className="album-photo-inner"
                    style={{ background: photo.bg }}
                  >
                    {photo.emoji}
                  </div>
                  {photo.likes > 0 && (
                    <div className="album-photo-count">
                      <Heart size={9} style={{ display: 'inline', marginRight: 2 }} />
                      {photo.likes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ padding: '0 16px' }}>
          <div className="album-folder-grid">
            {FOLDERS.map((folder, i) => (
              <div key={i} className="album-folder">
                <div className="album-folder-thumb" style={{ background: folder.bg }}>
                  {folder.emoji}
                </div>
                <div className="album-folder-info">
                  <div className="album-folder-name">{folder.name}</div>
                  <div className="album-folder-count">{folder.count}장 · {folder.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pb-safe" />
    </>
  )
}
