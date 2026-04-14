import { useState } from 'react'
import { X, ArrowLeft, BookOpen, Megaphone, Image, Send, Camera, Plus } from 'lucide-react'

const TYPES = [
  {
    id: 'report',
    name: '알림장',
    desc: '아이 하루 기록\n및 전달사항',
    Icon: BookOpen,
    bg: 'linear-gradient(135deg, #5E81F4, #8B5CF6)',
    light: '#EEF2FF',
    color: '#5E81F4',
  },
  {
    id: 'notice',
    name: '공지',
    desc: '원내 공지사항\n및 안내문',
    Icon: Megaphone,
    bg: 'linear-gradient(135deg, #14B8A6, #22C55E)',
    light: '#CCFBF1',
    color: '#14B8A6',
  },
  {
    id: 'album',
    name: '앨범',
    desc: '활동 사진\n및 영상 공유',
    Icon: Image,
    bg: 'linear-gradient(135deg, #F97316, #FBBF24)',
    light: '#FFF7ED',
    color: '#F97316',
  },
]

const STUDENTS = [
  { id: 1, name: '김민준', color: '#EEF2FF', textColor: '#5E81F4' },
  { id: 2, name: '이서연', color: '#FDF4FF', textColor: '#A855F7' },
  { id: 3, name: '박지호', color: '#FFF7ED', textColor: '#F97316' },
  { id: 4, name: '최예린', color: '#F0FDF4', textColor: '#22C55E' },
  { id: 5, name: '정우진', color: '#FFF1F2', textColor: '#F43F5E' },
  { id: 6, name: '한소율', color: '#CCFBF1', textColor: '#14B8A6' },
]

// ───── Report Form ─────
function ReportForm() {
  const [selected, setSelected] = useState([1])
  const [condition, setCondition] = useState('좋음')
  const [meals, setMeals] = useState({ 아침: '완식', 점심: '완식', 간식: '완식' })
  const [nap, setNap] = useState(true)
  const [note, setNote] = useState('')

  const toggleStudent = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  return (
    <div>
      <div className="form-section">
        <div className="form-section-title">
          <BookOpen size={14} style={{ color: '#5E81F4' }} />
          아이 선택
        </div>
        <div className="student-chips">
          {STUDENTS.map(s => (
            <button
              key={s.id}
              className={`student-chip ${selected.includes(s.id) ? 'selected' : ''}`}
              onClick={() => toggleStudent(s.id)}
            >
              <span
                className="student-chip-avatar"
                style={{ background: s.color, color: s.textColor }}
              >
                {s.name[0]}
              </span>
              <span className="student-chip-name">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">
          📋 기본 정보
        </div>
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">날짜</label>
            <input className="form-input" type="date" defaultValue="2026-04-14" />
          </div>
          <div className="form-field">
            <label className="form-label">체온 (℃)</label>
            <input className="form-input" type="number" step="0.1" defaultValue="36.5" placeholder="36.5" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">😊 오늘의 컨디션</div>
        <div className="radio-group">
          {['매우좋음', '좋음', '보통', '나쁨', '아픔'].map(v => (
            <button
              key={v}
              className={`radio-chip ${condition === v ? 'active' : ''}`}
              onClick={() => setCondition(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">🍱 식사 현황</div>
        {Object.entries(meals).map(([meal, val]) => (
          <div key={meal} className="form-field">
            <label className="form-label">{meal}</label>
            <div className="radio-group">
              {['완식', '반식', '미식'].map(v => (
                <button
                  key={v}
                  className={`radio-chip ${val === v ? 'active' : ''}`}
                  onClick={() => setMeals(m => ({ ...m, [meal]: v }))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="form-section">
        <div className="form-section-title">😴 낮잠</div>
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '4px 12px' }}>
          <div className="toggle-field">
            <span className="toggle-field-label">낮잠 여부</span>
            <div className={`toggle ${nap ? 'on' : ''}`} onClick={() => setNap(!nap)}>
              <div className="toggle-thumb" />
            </div>
          </div>
          {nap && (
            <div className="form-row" style={{ paddingBottom: '10px' }}>
              <div className="form-field">
                <label className="form-label">시작</label>
                <input className="form-input" type="time" defaultValue="13:00" />
              </div>
              <div className="form-field">
                <label className="form-label">종료</label>
                <input className="form-input" type="time" defaultValue="14:30" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">💩 배변</div>
        <div className="form-field">
          <label className="form-label">횟수</label>
          <select className="form-input form-select">
            {['0회', '1회', '2회', '3회 이상'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">📝 활동 & 전달사항</div>
        <div className="form-field">
          <label className="form-label">오늘의 활동</label>
          <textarea
            className="form-input form-textarea"
            placeholder="오늘 아이가 참여한 활동이나 특이사항을 작성해주세요."
            defaultValue="오늘은 봄 날씨를 주제로 자유 놀이를 진행했어요. 블록 놀이를 통해 창의력을 발휘했답니다. 🌸"
          />
        </div>
        <div className="form-field">
          <label className="form-label">전달사항</label>
          <textarea
            className="form-input form-textarea"
            placeholder="가정에 전달할 내용을 작성해주세요."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

// ───── Notice Form ─────
function NoticeForm() {
  const [important, setImportant] = useState(false)
  const [target, setTarget] = useState('전체')

  return (
    <div>
      <div className="form-section">
        <div className="form-section-title">
          <Megaphone size={14} style={{ color: '#14B8A6' }} />
          공지 정보
        </div>
        <div className="form-field">
          <label className="form-label">제목</label>
          <input className="form-input" placeholder="공지 제목을 입력해주세요" />
        </div>
        <div className="form-field">
          <label className="form-label">카테고리</label>
          <select className="form-input form-select">
            {['일반 공지', '행사 안내', '준비물 안내', '건강·안전', '식단표'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">📄 내용</div>
        <div className="form-field">
          <textarea
            className="form-input form-textarea"
            style={{ minHeight: 120 }}
            placeholder="공지 내용을 작성해주세요."
            defaultValue=""
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">⚙️ 발송 설정</div>
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '4px 12px' }}>
          <div className="toggle-field">
            <span className="toggle-field-label">중요 공지로 설정</span>
            <div className={`toggle ${important ? 'on' : ''}`} onClick={() => setImportant(!important)}>
              <div className="toggle-thumb" />
            </div>
          </div>
          <div className="toggle-field" style={{ borderBottom: 'none', paddingBottom: '12px' }}>
            <span className="toggle-field-label">수신 대상</span>
            <div className="radio-group">
              {['전체', '우리반'].map(v => (
                <button
                  key={v}
                  className={`radio-chip ${target === v ? 'active' : ''}`}
                  style={{ padding: '5px 11px', fontSize: '12px' }}
                  onClick={() => setTarget(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">📎 파일 첨부</div>
        <div className="upload-area">
          <div className="upload-icon-wrap">
            <Plus size={22} />
          </div>
          <div className="upload-text">파일을 첨부해주세요</div>
          <div className="upload-hint">이미지, PDF 등 최대 10MB</div>
        </div>
      </div>
    </div>
  )
}

// ───── Album Form ─────
function AlbumForm() {
  const [photos, setPhotos] = useState([])
  const [access, setAccess] = useState('우리반')

  return (
    <div>
      <div className="form-section">
        <div className="form-section-title">
          <Image size={14} style={{ color: '#F97316' }} />
          사진 업로드
        </div>
        <div className="upload-area">
          <div className="upload-icon-wrap" style={{ background: '#FFF7ED', color: '#F97316' }}>
            <Camera size={22} />
          </div>
          <div className="upload-text">사진 또는 영상 추가</div>
          <div className="upload-hint">최대 20장 · JPG, PNG, MP4 지원</div>
        </div>
        {photos.length === 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              marginTop: '10px',
            }}
          >
            {['🌸', '🎨', '🧩', '🌈'].map((emoji, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="form-section-title">📝 앨범 정보</div>
        <div className="form-field">
          <label className="form-label">제목</label>
          <input className="form-input" placeholder="앨범 제목 (예: 봄 소풍 🌸)" />
        </div>
        <div className="form-field">
          <label className="form-label">설명</label>
          <textarea
            className="form-input form-textarea"
            placeholder="활동에 대한 간단한 설명을 추가해보세요."
            defaultValue=""
          />
        </div>
        <div className="form-field">
          <label className="form-label">날짜</label>
          <input className="form-input" type="date" defaultValue="2026-04-14" />
        </div>
        <div className="form-field">
          <label className="form-label">활동 태그</label>
          <div className="radio-group">
            {['야외활동', '미술', '음악', '독서', '요리', '체육', '자유놀이'].map(v => (
              <button key={v} className="radio-chip">{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">⚙️ 공개 설정</div>
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '4px 12px' }}>
          <div className="toggle-field" style={{ borderBottom: 'none', paddingBottom: '12px' }}>
            <span className="toggle-field-label">공개 대상</span>
            <div className="radio-group">
              {['우리반', '전체'].map(v => (
                <button
                  key={v}
                  className={`radio-chip ${access === v ? 'active' : ''}`}
                  style={{ padding: '5px 11px', fontSize: '12px' }}
                  onClick={() => setAccess(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ───── Main Drawer ─────
const FORM_MAP = {
  report: { Form: ReportForm, title: '알림장 작성', submitLabel: '알림장 보내기' },
  notice: { Form: NoticeForm, title: '공지 작성', submitLabel: '공지 등록하기' },
  album:  { Form: AlbumForm,  title: '앨범 올리기', submitLabel: '앨범 공유하기' },
}

export default function WriteDrawer({ initialType, onClose }) {
  const [type, setType] = useState(initialType)

  const handleTypeSelect = (t) => setType(t)
  const handleBack = () => setType(null)

  const current = type ? FORM_MAP[type] : null
  const typeInfo = type ? TYPES.find(t => t.id === type) : null

  return (
    <div className="write-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="write-sheet">
        <div className="write-handle" />
        <div className="write-header">
          {type ? (
            <button className="write-back-btn" onClick={handleBack}>
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div style={{ width: 36 }} />
          )}
          <span className="write-title">
            {type ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 24, height: 24,
                    borderRadius: 6,
                    background: typeInfo.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <typeInfo.Icon size={14} color="white" strokeWidth={2} />
                </span>
                {current.title}
              </span>
            ) : (
              '작성하기'
            )}
          </span>
          <button className="write-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="write-body">
          {!type ? (
            <>
              <p className="type-selector-intro" style={{ marginBottom: 20, marginTop: 4 }}>
                어떤 내용을 작성할까요?
              </p>
              <div className="type-grid">
                {TYPES.map(t => (
                  <button key={t.id} className="type-card" onClick={() => handleTypeSelect(t.id)}>
                    <div
                      className="type-icon"
                      style={{ background: t.bg }}
                    >
                      <t.Icon size={24} color="white" strokeWidth={2} />
                    </div>
                    <div className="type-name">{t.name}</div>
                    <div className="type-desc">{t.desc}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <current.Form />
          )}
        </div>

        {type && (
          <div className="write-footer">
            <button className="write-submit-btn" onClick={onClose}>
              <Send size={16} strokeWidth={2} />
              {current.submitLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
