import { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwWj-Suzvf1p2MZ1kSgxvV0-sfUcXT9Yk",
  authDomain: "storyline-qa.firebaseapp.com",
  projectId: "storyline-qa",
  storageBucket: "storyline-qa.firebasestorage.app",
  messagingSenderId: "267930617309",
  appId: "1:267930617309:web:57199d839aa612ae2f6234",
};
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(firebaseApp);
const DB_DOC = "data/main";

async function saveToFirebase(data) {
  try {
    await setDoc(doc(db, "data", "main"), { projects: JSON.stringify(data) });
  } catch(e) { console.error("Firebase 저장 오류:", e); }
}

async function loadFromFirebase() {
  try {
    const snap = await getDoc(doc(db, "data", "main"));
    if (snap.exists()) return JSON.parse(snap.data().projects);
  } catch(e) { console.error("Firebase 불러오기 오류:", e); }
  return null;
}

function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
}

async function generateQAFromSpec(specText, versionInfo, enabledColumns) {
  const cols = enabledColumns.filter(c => c !== "platform" && c !== "assignee" && c !== "memo");
  const res = await fetch("/api/generate-qa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content: `You are a QA engineer. Generate QA test cases in Korean from a product spec.\nReturn ONLY a valid JSON array, no markdown, no explanation, no extra text.\nIMPORTANT: All values must be written in Korean only. Do NOT use Japanese, English, or any other language.\nEach item must have: ${cols.join(",")}`,
        },
        { role: "user", content: `버전: ${JSON.stringify(versionInfo)}\n기획서:\n${specText}\n\nJSON 배열만 반환하세요.` }
      ]
    }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(`HTTP ${res.status}: ${JSON.stringify(e)}`); }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "[]";
  const jsonStr = raw.includes('[') ? raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1) : "[]";
  const parsed = JSON.parse(jsonStr);

// 모든 필드값을 문자열로 강제 변환
return parsed.map(item => {
  const obj = {};
  for (const key in item) {
    const val = item[key];
    if (Array.isArray(val)) {
      obj[key] = val.join("\n");
    } else if (typeof val === "object" && val !== null) {
      obj[key] = JSON.stringify(val);
    } else {
      obj[key] = String(val ?? "");
    }
  }
  return obj;
});
}

const ALL_COLUMNS = [
  { key:"title",        label:"제목",        required:true  },
  { key:"account",      label:"계정",        required:false },
  { key:"precondition", label:"사전조건",    required:false },
  { key:"testSteps",    label:"테스트 단계", required:true  },
  { key:"expected",     label:"기대 결과",   required:true  },
  { key:"note",         label:"실제 결과(비고)",        required:false },
  { key:"memo",         label:"메모",        required:false },
];
const DEFAULT_ENABLED = ALL_COLUMNS.map(c => c.key);
const STATUS_META = {
  "미테스트": { bg:"#F1F5F9", text:"#64748B", dot:"#94A3B8", border:"#E2E8F0" },
  "성공":     { bg:"#ECFDF5", text:"#059669", dot:"#059669", border:"#A7F3D0" },
  "실패":     { bg:"#FEF2F2", text:"#DC2626", dot:"#DC2626", border:"#FECACA" },
  "보류":     { bg:"#FFFBEB", text:"#D97706", dot:"#D97706", border:"#FDE68A" },
};
const SEVERITY_META = {
  "긴급": { color:"#DC2626", bg:"#FEF2F2" },
  "높음": { color:"#EA580C", bg:"#FFF7ED" },
  "보통": { color:"#CA8A04", bg:"#FEFCE8" },
  "낮음": { color:"#16A34A", bg:"#F0FDF4" },
};
const PLATFORM_OPTIONS = ["iOS","Android","Web","PC","공통"];
const nowStr = () => new Date().toLocaleString("ko-KR",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
let _id = 1;
const uid = () => `id_${_id++}_${Date.now()}`;
const MINT = "#0D9488";
const MINT_LIGHT = "#CCFBF1";
const MINT_MID = "#14B8A6";

const S = {
  btn: { background:"#FFFFFF",border:"1px solid #E2E8F0",color:"#64748B",padding:"5px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all .15s" },
  primaryBtn: { background:`linear-gradient(135deg,${MINT},${MINT_MID})`,border:"none",color:"#FFFFFF",padding:"9px 22px",borderRadius:10,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:700,boxShadow:"0 2px 8px rgba(13,148,136,.3)" },
  secBtn: { background:"#FFFFFF",border:"1px solid #E2E8F0",color:"#64748B",padding:"9px 18px",borderRadius:10,cursor:"pointer",fontSize:13,fontFamily:"inherit" },
  input: { background:"#FFFFFF",border:"1px solid #E2E8F0",color:"#1E293B",padding:"9px 12px",borderRadius:10,fontSize:13,width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box",transition:"border-color .15s" },
  label: { fontSize:11,color:"#94A3B8",display:"block",marginBottom:5,letterSpacing:0.5,textTransform:"uppercase",fontWeight:700 },
  th: { padding:"11px 14px",textAlign:"left",fontSize:11,color:"#94A3B8",fontWeight:700,letterSpacing:0.5,whiteSpace:"nowrap",textTransform:"uppercase" },
  td: { padding:"11px 14px",fontSize:13,verticalAlign:"top" },
  divider: { width:1,height:24,background:"#E2E8F0",margin:"0 4px" },
  card: { background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:14,padding:"16px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.06)" },
};

function Modal({ title, onClose, children, wide }) {
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.35)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)" }}>
      <div style={{ background:"#FFFFFF",borderRadius:18,padding:30,width:wide?740:440,maxWidth:"95vw",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <h3 style={{ margin:0,color:"#0F172A",fontSize:16,fontWeight:800 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"#F1F5F9",border:"none",color:"#64748B",cursor:"pointer",fontSize:18,width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.4)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)" }}>
      <div style={{ background:"#FFFFFF",borderRadius:16,padding:28,width:340,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
        <div style={{ fontSize:36,marginBottom:14 }}>🗑️</div>
        <p style={{ margin:"0 0 22px",color:"#1E293B",fontSize:14,fontWeight:600,lineHeight:1.7 }}>{message}</p>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={onConfirm} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"none",background:"#DC2626",color:"#fff",fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer" }}>삭제</button>
          <button onClick={onClose} style={{ flex:1,padding:"10px 0",borderRadius:10,border:"1px solid #E2E8F0",background:"#fff",color:"#64748B",fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer" }}>취소</button>
        </div>
      </div>
    </div>
  );
}

function CompleteModal({ count, onConfirm }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.4)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)" }}>
      <div style={{ background:"#FFFFFF",borderRadius:20,padding:36,width:380,textAlign:"center",boxShadow:"0 24px 80px rgba(0,0,0,.18)" }}>
        <div style={{ fontSize:52,marginBottom:16 }}>✅</div>
        <h3 style={{ margin:"0 0 10px",color:"#0F172A",fontSize:18,fontWeight:800 }}>QA 시트 생성 완료!</h3>
        <p style={{ margin:"0 0 6px",color:"#64748B",fontSize:14 }}>총 <span style={{ color:MINT,fontWeight:800,fontSize:18 }}>{count}개</span>의 테스트 케이스가 생성되었습니다.</p>
        <p style={{ margin:"0 0 26px",color:"#94A3B8",fontSize:13 }}>확인을 누르면 QA 시트로 이동합니다.</p>
        <button onClick={onConfirm} style={{ ...S.primaryBtn,width:"100%",padding:"12px 0",fontSize:15 }}>QA 시트 확인하기 →</button>
      </div>
    </div>
  );
}

function AssigneeModal({ onConfirm, onSkip }) {
  const [assignees, setAssignees] = useState([""]);
  const addRow = () => setAssignees(a => [...a, ""]);
  const updateRow = (i, v) => setAssignees(a => a.map((x, idx) => idx===i ? v : x));
  const removeRow = (i) => setAssignees(a => a.filter((_, idx) => idx!==i));
  const handleConfirm = () => {
    const filtered = assignees.map(a => a.trim()).filter(Boolean);
    onConfirm(filtered);
  };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.4)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)" }}>
      <div style={{ background:"#FFFFFF",borderRadius:20,padding:36,width:420,boxShadow:"0 24px 80px rgba(0,0,0,.18)" }}>
        <div style={{ fontSize:42,marginBottom:14,textAlign:"center" }}>👤</div>
        <h3 style={{ margin:"0 0 8px",color:"#0F172A",fontSize:17,fontWeight:800,textAlign:"center" }}>담당자 입력</h3>
        <p style={{ margin:"0 0 20px",color:"#94A3B8",fontSize:13,textAlign:"center",lineHeight:1.8 }}>생성될 QA 케이스에 담당자를 지정하세요.<br/>여러 명 입력 시 순서대로 배분됩니다.</p>
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:14 }}>
          {assignees.map((a, i) => (
            <div key={i} style={{ display:"flex",gap:8,alignItems:"center" }}>
              <input value={a} onChange={e => updateRow(i, e.target.value)}
                style={{ ...S.input, flex:1 }} placeholder={`담당자 ${i+1}`} autoFocus={i===0} />
              {assignees.length > 1 && (
                <button onClick={() => removeRow(i)} style={{ ...S.btn,padding:"8px 10px",color:"#DC2626",borderColor:"#FECACA",flexShrink:0 }}>×</button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addRow} style={{ ...S.btn,width:"100%",marginBottom:16,padding:"9px 0",color:MINT,borderColor:MINT+"44",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
          + 담당자 추가
        </button>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={handleConfirm} style={{ ...S.primaryBtn,flex:1,padding:"11px 0" }}>확인</button>
          <button onClick={onSkip} style={{ ...S.secBtn,flex:1,padding:"11px 0" }}>건너뛰기</button>
        </div>
      </div>
    </div>
  );
}

function ColConfigModal({ enabled, setEnabled, onClose }) {
  const toggle = (key, required) => {
    if (required) return;
    setEnabled(p => p.includes(key) ? p.filter(k => k!==key) : [...p, key]);
  };
  return (
    <Modal title="⚙ 설정" onClose={onClose}>
      <p style={{ margin:"0 0 12px",fontSize:13,fontWeight:700,color:"#1E293B" }}>QA 시트 컬럼 설정</p>
      <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
        {ALL_COLUMNS.map(c => {
          const on = enabled.includes(c.key);
          return (
            <div key={c.key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F8FAFC",padding:"10px 14px",borderRadius:10,border:"1px solid #E2E8F0" }}>
              <div>
                <span style={{ color:on?"#1E293B":"#94A3B8",fontSize:13,fontWeight:600 }}>{c.label}</span>
                {c.required && <span style={{ fontSize:10,color:MINT,marginLeft:8,background:MINT_LIGHT,padding:"2px 7px",borderRadius:6,fontWeight:700 }}>필수</span>}
              </div>
              <div onClick={() => toggle(c.key, c.required)}
                style={{ width:44,height:24,borderRadius:99,cursor:c.required?"not-allowed":"pointer",background:on?MINT:"#E2E8F0",transition:"all .2s",position:"relative",flexShrink:0 }}>
                <div style={{ width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?23:3,transition:"all .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={onClose} style={{ ...S.primaryBtn,width:"100%" }}>저장</button>
    </Modal>
  );
}

function VersionModal({ version, onSave, onClose }) {
  const isEdit = !!version?.id;
  const [form, setForm] = useState(
    isEdit ? { name:version.name, type:version.type, customType:!["앱","웹"].includes(version.type) }
           : { name:"", type:"앱", customType:false }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const handleSave = () => {
    if (!form.name.trim() || !form.type.trim()) return;
    onSave({ ...version, name:form.name.trim(), type:form.type.trim() });
  };
  return (
    <Modal title={isEdit?"버전 수정":"새 버전 추가"} onClose={onClose}>
      <label style={S.label}>버전명</label>
      <input value={form.name} onChange={e => set("name",e.target.value)} onKeyDown={e => e.key==="Enter"&&handleSave()} style={S.input} placeholder="예: v1.1.1, WEB-1" autoFocus />
      <label style={{ ...S.label,marginTop:16 }}>플랫폼 유형</label>
      <div style={{ display:"flex",gap:8 }}>
        {["앱","웹","직접 입력"].map(t => (
          <button key={t} onClick={() => { if(t==="직접 입력"){set("customType",true);set("type","");}else{set("customType",false);set("type",t);} }}
            style={{ ...S.btn,flex:1,padding:"10px 0",fontWeight:800,fontSize:13,
              background:(t==="직접 입력"?form.customType:form.type===t&&!form.customType)?MINT_LIGHT:"#F8FAFC",
              borderColor:(t==="직접 입력"?form.customType:form.type===t&&!form.customType)?MINT:"#E2E8F0",
              color:(t==="직접 입력"?form.customType:form.type===t&&!form.customType)?MINT:"#94A3B8" }}>{t}</button>
        ))}
      </div>
      {form.customType && <input value={form.type} onChange={e => set("type",e.target.value)} style={{ ...S.input,marginTop:10 }} placeholder="예: 어드민, OMS 등" />}
      <div style={{ display:"flex",gap:8,marginTop:18 }}>
        <button onClick={handleSave} style={S.primaryBtn}>{isEdit?"수정":"추가"}</button>
        <button onClick={onClose} style={S.secBtn}>취소</button>
      </div>
    </Modal>
  );
}

function QAEditModal({ item, enabledCols, onSave, onClose }) {
  const [form, setForm] = useState({ ...item, memo:"" });
  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const visibleCols = ALL_COLUMNS.filter(c => enabledCols.includes(c.key));
  return (
    <Modal title={item.id?"QA 케이스 편집":"QA 케이스 추가"} onClose={onClose} wide>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={S.label}>상태</label>
          <div style={{ display:"flex",gap:8 }}>
            {["미테스트","성공","실패","보류"].map(s => (
              <button key={s} onClick={() => set("status",s)} style={{ flex:1,padding:"8px 0",borderRadius:9,fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer",
                border:`1px solid ${form.status===s?STATUS_META[s].border:"#E2E8F0"}`,
                background:form.status===s?STATUS_META[s].bg:"#F8FAFC",
                color:form.status===s?STATUS_META[s].text:"#94A3B8" }}>{s}</button>
            ))}
          </div>
        </div>
        <div>
            <label style={S.label}>담당자</label>
            <input value={form.assignee||""} onChange={e => set("assignee",e.target.value)} style={S.input} placeholder=" " />
          </div>
        {visibleCols.map(c => {
          const isLong = ["testSteps","precondition","expected","note","memo"].includes(c.key);
          return (
            <div key={c.key} style={{ gridColumn:isLong?"1/-1":"auto" }}>
              <label style={S.label}>{c.label}</label>
              {isLong
                ? <textarea value={c.key==="memo"?(form.memo||""):form[c.key]||""} onChange={e => set(c.key,e.target.value)}
                    style={{ ...S.input,height:c.key==="memo"?68:84,resize:"vertical" }}
                    placeholder={c.key==="memo"?"메모를 입력하세요":""} />
                : <input value={form[c.key]||""} onChange={e => set(c.key,e.target.value)} style={S.input} />
              }
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:14 }}>
        <label style={S.label}>피그마 링크 (선택)</label>
        <div style={{ display:"flex",gap:8 }}>
          <input value={form.figmaUrl||""} onChange={e => set("figmaUrl",e.target.value)}
            style={{ ...S.input,flex:1 }} placeholder="https://www.figma.com/..." />
          {form.figmaUrl && (
            <a href={form.figmaUrl} target="_blank" rel="noreferrer"
              style={{ ...S.primaryBtn,textDecoration:"none",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" }}>
              🎨 열기
            </a>
          )}
        </div>
      </div>
      <div style={{ display:"flex",gap:8,marginTop:20 }}>
        <button onClick={() => onSave(form)} style={S.primaryBtn}>저장</button>
        <button onClick={onClose} style={S.secBtn}>취소</button>
      </div>
    </Modal>
  );
}

function IssueEditModal({ item, qaItems, onSave, onClose }) {
  const fileRef = useRef();
  const [form, setForm] = useState({
    type:item?.type||"이슈", title:item?.title||"", scenario:item?.scenario||"",
    expected:item?.expected||"", attachments:item?.attachments||[], memo:item?.memo||"",
    severity:item?.severity||"보통", issueStatus:item?.issueStatus||"미처리",
    reporter:item?.reporter||"", assignee:item?.assignee||"", reviewer:item?.reviewer||"", linkedQA:item?.linkedQA||"",
    id:item?.id||null, createdAt:item?.createdAt||null,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => res({ name:file.name,url:ev.target.result,kind:file.type.startsWith("video")?"video":"image" });
      reader.readAsDataURL(file);
    }))).then(arr => set("attachments",[...form.attachments,...arr]));
    e.target.value="";
  };
  const typeBtn = (t, icon, accent) => (
    <button onClick={() => set("type",t)} style={{ flex:1,padding:"10px 0",borderRadius:10,fontFamily:"inherit",fontWeight:800,fontSize:13,cursor:"pointer",
      border:`1px solid ${form.type===t?accent+"88":"#E2E8F0"}`,
      background:form.type===t?accent+"12":"#F8FAFC",
      color:form.type===t?accent:"#94A3B8",transition:"all .15s" }}>{icon}  {t}</button>
  );
  const stepLabel = (n, text) => (
    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
      <div style={{ width:22,height:22,borderRadius:"50%",background:MINT_LIGHT,color:MINT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0 }}>{n}</div>
      <label style={{ ...S.label,margin:0,color:"#64748B" }}>{text}</label>
    </div>
  );
  return (
    <Modal title="이슈 등록" onClose={onClose} wide>
      <div style={{ display:"flex",gap:10,marginBottom:22 }}>
        {typeBtn("이슈","🐞","#DC2626")}
        {typeBtn("수정","🔧","#D97706")}
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        <div>
          <label style={S.label}>제목</label>
          <input value={form.title} onChange={e => set("title",e.target.value)} style={S.input} placeholder="이슈 제목을 입력하세요" autoFocus />
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <div>
            <label style={S.label}>심각도</label>
            <select value={form.severity} onChange={e => set("severity",e.target.value)} style={S.input}>
              {["긴급","높음","보통","낮음"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>상태</label>
            <select value={form.issueStatus} onChange={e => set("issueStatus",e.target.value)} style={S.input}>
             {["미처리","진행중","보류","해결됨"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
          <div>
            <label style={S.label}>제보자</label>
            <input value={form.reporter||""} onChange={e => set("reporter",e.target.value)} style={S.input} placeholder=" " />
          </div>
          <div>
            <label style={S.label}>담당자</label>
            <input value={form.assignee||""} onChange={e => set("assignee",e.target.value)} style={S.input} placeholder=" " />
          </div>
          <div>
            <label style={S.label}>검토자</label>
            <input value={form.reviewer||""} onChange={e => set("reviewer",e.target.value)} style={S.input} placeholder=" " />
          </div>
        </div>
        <div style={{ borderTop:"1px solid #F1F5F9",paddingTop:16 }}>
          {stepLabel(1,"이슈 상황 및 재현 시나리오")}
          <textarea value={form.scenario} onChange={e => set("scenario",e.target.value)}
            placeholder={"재현 시나리오를 단계별로 작성하세요.\n예) 1. 앱 실행 후 로그인\n2. 마이페이지 진입\n3. 프로필 수정 버튼 탭\n→ 크래시 발생"}
            style={{ ...S.input,height:110,resize:"vertical",lineHeight:1.7 }} />
        </div>
        <div>
          {stepLabel(2,"예상 결과")}
          <textarea value={form.expected} onChange={e => set("expected",e.target.value)}
            placeholder="정상 동작 시 기대되는 결과를 작성하세요."
            style={{ ...S.input,height:80,resize:"vertical",lineHeight:1.7 }} />
        </div>
        <div>
          {stepLabel(3,"스크린샷 / 영상")}
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFiles} style={{ display:"none" }} />
          <button onClick={() => fileRef.current.click()}
            style={{ ...S.btn,width:"100%",padding:"11px 0",borderStyle:"dashed",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:"#94A3B8",borderColor:"#CBD5E1" }}>
            <span style={{ fontSize:18 }}>+</span> 파일 첨부 (이미지 / 영상)
          </button>
          {form.attachments?.length>0 && (
            <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginTop:10 }}>
              {form.attachments.map((a,i) => (
                <div key={i} style={{ position:"relative",borderRadius:10,overflow:"hidden",border:"1px solid #E2E8F0" }}>
                  {a.kind==="video"
                    ? <video src={a.url} controls style={{ width:120,height:80,objectFit:"cover",display:"block",borderRadius:6 }} />
                    : <img src={a.url} alt={a.name} style={{ width:90,height:68,objectFit:"cover",display:"block" }} />
                  }
                  <button onClick={() => set("attachments",form.attachments.filter((_,j) => j!==i))}
                    style={{ position:"absolute",top:3,right:3,width:18,height:18,borderRadius:"50%",background:"rgba(0,0,0,.55)",border:"none",color:"#fff",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",padding:0 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {stepLabel(4,"메모")}
          <textarea value={form.memo||""} onChange={e => set("memo",e.target.value)}
            placeholder="추가 내용, 참고 링크 등"
            style={{ ...S.input,height:68,resize:"vertical",lineHeight:1.7 }} />
        </div>
        <div>
          <label style={S.label}>피그마 링크 (선택)</label>
          <div style={{ display:"flex",gap:8 }}>
            <input value={form.figmaUrl||""} onChange={e => set("figmaUrl",e.target.value)}
              style={{ ...S.input,flex:1 }} placeholder="https://www.figma.com/..." />
            {form.figmaUrl && (
              <a href={form.figmaUrl} target="_blank" rel="noreferrer"
                style={{ ...S.primaryBtn,textDecoration:"none",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" }}>
                🎨 열기
              </a>
            )}
          </div>
        </div>
        <div>
          <label style={S.label}>QA 시트 링크</label>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <input readOnly value={`${window.location.origin}?tab=qa&project=${form.projectId||""}&version=${form.versionId||""}`}
              style={{ ...S.input,flex:1,background:"#F8FAFC",color:"#94A3B8",fontSize:12 }} />
            <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}?tab=qa&project=${form.projectId||""}&version=${form.versionId||""}`);
                alert("QA 시트 링크가 복사되었습니다!");
              }}
              style={{ ...S.primaryBtn,whiteSpace:"nowrap",padding:"9px 16px" }}>
              🔗 복사
            </button>
          </div>
        </div>
      </div>
      <div style={{ display:"flex",gap:8,marginTop:20 }}>
        <button onClick={() => onSave(form)} style={S.primaryBtn}>저장</button>
        <button onClick={onClose} style={S.secBtn}>취소</button>
      </div>
    </Modal>
  );
}

function TrashTab({ trash, onRestore, onDeleteForever, onEmptyTrash }) {
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [confirmForever, setConfirmForever] = useState(null);
  const typeLabel = { qa:"🧪 QA 케이스", issue:"🐞 이슈", spec:"📂 기획서" };
  const typeColor = { qa:MINT, issue:"#DC2626", spec:"#7C3AED" };
  return (
    <div style={{ maxWidth:880,margin:"0 auto" }}>
      <div style={{ marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
        <div>
          <h2 style={{ margin:0,color:"#0F172A",fontSize:19,fontWeight:800 }}>휴지통</h2>
          <p style={{ margin:"5px 0 0",color:"#94A3B8",fontSize:13 }}>삭제된 항목을 복구하거나 영구 삭제하세요</p>
        </div>
        {trash.length>0 && (
          <button onClick={() => setConfirmEmpty(true)}
            style={{ ...S.btn,color:"#DC2626",borderColor:"#FECACA",fontWeight:700 }}>
            🗑️ 휴지통 비우기
          </button>
        )}
      </div>
      {confirmEmpty && <ConfirmModal message="휴지통을 비우시겠습니까? 복구할 수 없습니다." onConfirm={() => { onEmptyTrash(); setConfirmEmpty(false); }} onClose={() => setConfirmEmpty(false)} />}
      {confirmForever && <ConfirmModal message="영구 삭제하시겠습니까? 복구할 수 없습니다." onConfirm={() => { onDeleteForever(confirmForever); setConfirmForever(null); }} onClose={() => setConfirmForever(null)} />}
      {trash.length===0 ? (
        <div style={{ textAlign:"center",color:"#94A3B8",padding:"60px 0",border:"2px dashed #E2E8F0",borderRadius:14,fontSize:13 }}>
          휴지통이 비어있습니다
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {[...trash].reverse().map(item => (
            <div key={item.id} style={{ ...S.card,display:"flex",alignItems:"center",gap:12 }}>
              <span style={{ fontSize:11,padding:"3px 10px",borderRadius:99,fontWeight:700,background:typeColor[item._type]+"18",color:typeColor[item._type],whiteSpace:"nowrap" }}>
                {typeLabel[item._type]}
              </span>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,color:"#0F172A",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                  {item.title||item.name||"제목 없음"}
                </div>
                <div style={{ fontSize:11,color:"#94A3B8",marginTop:2 }}>삭제일: {item._deletedAt}</div>
              </div>
              <div style={{ display:"flex",gap:6 }}>
                <button onClick={() => onRestore(item)}
                  style={{ ...S.btn,color:MINT,borderColor:MINT+"44",fontWeight:700,fontSize:12 }}>↩ 복구</button>
                <button onClick={() => setConfirmForever(item.id)}
                  style={{ ...S.btn,color:"#DC2626",borderColor:"#FECACA",fontWeight:700,fontSize:12 }}>영구 삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardTab({ projects, setActiveProjectId, setActiveVersionId, setTab }) {
  return (
    <div style={{ maxWidth:1000,margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ margin:0,color:"#0F172A",fontSize:19,fontWeight:800 }}>대시보드</h2>
        <p style={{ margin:"5px 0 0",color:"#94A3B8",fontSize:13 }}>전체 프로젝트 및 버전 현황을 한눈에 확인하세요</p>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        {projects.map(project => {
          const totalQA = project.versions.reduce((acc, v) => acc + (v.qaItems?.length||0), 0);
          const totalIssues = project.versions.reduce((acc, v) => acc + (v.issues?.length||0), 0);
          return (
            <div key={project.id} style={{ ...S.card }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:MINT_LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>📁</div>
                  <div>
                    <div style={{ fontWeight:800,color:"#0F172A",fontSize:15 }}>{project.name}</div>
                    <div style={{ fontSize:12,color:"#94A3B8" }}>버전 {project.versions.length}개 · QA {totalQA}건 · 이슈 {totalIssues}건</div>
                  </div>
                </div>
              </div>
              {project.versions.length===0 ? (
                <div style={{ textAlign:"center",color:"#CBD5E1",padding:"20px 0",border:"1px dashed #E2E8F0",borderRadius:10,fontSize:13 }}>
                  버전이 없습니다
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10 }}>
                  {project.versions.map(version => {
                    const qaItems = version.qaItems||[];
                    const issues = version.issues||[];
                    const pass = qaItems.filter(q => q.status==="성공").length;
                    const fail = qaItems.filter(q => q.status==="실패").length;
                    const hold = qaItems.filter(q => q.status==="보류").length;
                    const untested = qaItems.filter(q => q.status==="미테스트"||!q.status).length;
                    const pct = qaItems.length ? Math.round(pass/qaItems.length*100) : 0;
                    const openIssues = issues.filter(i => i.issueStatus!=="해결됨").length;
                    return (
                      <div key={version.id}
                        onClick={() => { setActiveProjectId(project.id); setActiveVersionId(version.id); setTab("qa"); }}
                        style={{ background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:12,padding:"14px 16px",cursor:"pointer",transition:"all .15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor=MINT; e.currentTarget.style.background=MINT_LIGHT; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.background="#F8FAFC"; }}>
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                          <span style={{ fontWeight:800,color:"#0F172A",fontSize:13 }}>{version.name}</span>
                          <span style={{ fontSize:11,padding:"2px 8px",borderRadius:99,background:MINT_LIGHT,color:MINT,fontWeight:700 }}>{version.type}</span>
                        </div>
                        <div style={{ background:"#E2E8F0",borderRadius:99,height:6,overflow:"hidden",marginBottom:8 }}>
                          <div style={{ height:"100%",borderRadius:99,background:`linear-gradient(90deg,${MINT},${MINT_MID})`,width:pct+"%",transition:"width .5s" }} />
                        </div>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"#94A3B8",marginBottom:8 }}>
                          <span>통과율 <strong style={{ color:MINT }}>{pct}%</strong></span>
                          <span>QA <strong style={{ color:"#0F172A" }}>{qaItems.length}건</strong></span>
                        </div>
                        <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                          {untested>0 && <span style={{ fontSize:10,padding:"2px 6px",borderRadius:99,...STATUS_META["미테스트"],fontWeight:700 }}>미테스트 {untested}</span>}
                          {pass>0 && <span style={{ fontSize:10,padding:"2px 6px",borderRadius:99,...STATUS_META["성공"],fontWeight:700 }}>성공 {pass}</span>}
                          {fail>0 && <span style={{ fontSize:10,padding:"2px 6px",borderRadius:99,...STATUS_META["실패"],fontWeight:700 }}>실패 {fail}</span>}
                          {hold>0 && <span style={{ fontSize:10,padding:"2px 6px",borderRadius:99,...STATUS_META["보류"],fontWeight:700 }}>보류 {hold}</span>}
                        </div>
                        {openIssues>0 && (
                          <div style={{ marginTop:8,fontSize:11,color:"#DC2626",fontWeight:700 }}>🐞 미해결 이슈 {openIssues}건</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpecTab({ specText, setSpecText, onGenerate, generating, activeVersion, onAddVersion }) {
  const [inputMode, setInputMode] = useState("text");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const fileRef = useRef();
  const hasApiKey = !!import.meta.env.VITE_GROQ_API_KEY;
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (["txt","md"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = ev => { setSpecText(ev.target.result); setUploadedFileName(file.name); };
      reader.readAsText(file,"UTF-8");
    } else { setUploadedFileName(file.name); }
    e.target.value="";
  };
  return (
    <div style={{ maxWidth:880,margin:"0 auto" }}>
      <div style={{ marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
        <div>
          <h2 style={{ margin:0,color:"#0F172A",fontSize:19,fontWeight:800 }}>기획서 입력</h2>
          <p style={{ margin:"5px 0 0",color:"#94A3B8",fontSize:13 }}>기획서를 입력하면 AI가 QA 테스트 케이스를 자동 생성합니다</p>
        </div>
        {activeVersion && (
          <div style={{ background:MINT_LIGHT,border:`1px solid ${MINT}44`,borderRadius:9,padding:"6px 14px",fontSize:12,color:MINT,fontWeight:700 }}>
            [{activeVersion.type}] {activeVersion.name}
          </div>
        )}
      </div>
      {!hasApiKey && (
        <div style={{ background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:12,padding:"14px 18px",marginBottom:18,fontSize:13,color:"#C2410C",fontWeight:600 }}>
          ⚠ .env 파일에 VITE_GROQ_API_KEY를 설정해야 QA 시트를 생성할 수 있습니다.
        </div>
      )}
      {!activeVersion && (
        <div style={{ background:"#FFFBEB",border:"1px dashed #FDE68A",borderRadius:12,padding:20,marginBottom:18,textAlign:"center",color:"#D97706",fontSize:13,fontWeight:600 }}>
          ⚠ 먼저 버전을 추가하세요.
          <button onClick={onAddVersion} style={{ ...S.btn,marginLeft:12,color:MINT,borderColor:MINT+"44",fontWeight:700 }}>+ 버전 추가</button>
        </div>
      )}
      <div style={{ display:"flex",gap:0,marginBottom:14,background:"#F1F5F9",borderRadius:10,padding:3,width:"fit-content" }}>
        {[["text","✏️  직접 입력"],["file","📎  파일 업로드"]].map(([mode,label]) => (
          <button key={mode} onClick={() => setInputMode(mode)} style={{ padding:"7px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700,transition:"all .15s",
            background:inputMode===mode?"#FFFFFF":"transparent",
            color:inputMode===mode?"#0F172A":"#94A3B8",
            boxShadow:inputMode===mode?"0 1px 4px rgba(0,0,0,.08)":"none" }}>{label}</button>
        ))}
      </div>
      {inputMode==="text" ? (
        <textarea value={specText} onChange={e => setSpecText(e.target.value)}
          placeholder={"기획서 내용을 여기에 붙여넣거나 직접 입력하세요.\n\n예시:\n- 기능명: 회원가입\n- 이메일, 비밀번호, 닉네임 입력 필드\n- 이메일 중복 체크 필요\n- 비밀번호 8자 이상, 특수문자 포함 필수"}
          style={{ ...S.input,height:300,resize:"vertical",lineHeight:1.8,fontSize:13,borderRadius:14 }} />
      ) : (
        <div>
          <input ref={fileRef} type="file" accept=".txt,.md" onChange={handleFile} style={{ display:"none" }} />
          <div onClick={() => fileRef.current.click()}
            style={{ border:"2px dashed #CBD5E1",borderRadius:14,padding:"48px 24px",textAlign:"center",cursor:"pointer",background:"#F8FAFC",transition:"all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=MINT; e.currentTarget.style.background=MINT_LIGHT; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#CBD5E1"; e.currentTarget.style.background="#F8FAFC"; }}>
            <div style={{ fontSize:36,marginBottom:10 }}>📄</div>
            {uploadedFileName
              ? <div><p style={{ margin:"0 0 4px",fontWeight:700,color:"#1E293B",fontSize:14 }}>{uploadedFileName}</p><p style={{ margin:0,color:"#94A3B8",fontSize:12 }}>클릭하여 다른 파일 선택</p></div>
              : <div><p style={{ margin:"0 0 4px",fontWeight:700,color:"#1E293B",fontSize:14 }}>파일을 클릭해서 선택하세요</p><p style={{ margin:0,color:"#94A3B8",fontSize:12 }}>지원 형식: .txt, .md</p></div>
            }
          </div>
          {uploadedFileName && specText && (
            <div style={{ marginTop:14 }}>
              <label style={S.label}>추출된 내용 미리보기</label>
              <textarea value={specText} onChange={e => setSpecText(e.target.value)} style={{ ...S.input,height:180,resize:"vertical",lineHeight:1.7,fontSize:12,borderRadius:12 }} />
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop:14 }}>
        <label style={S.label}>피그마 링크 (선택)</label>
        <div style={{ display:"flex",gap:8 }}>
          <input value={figmaUrl} onChange={e => setFigmaUrl(e.target.value)}
            style={{ ...S.input,flex:1 }} placeholder="https://www.figma.com/..." />
          {figmaUrl && (
            <a href={figmaUrl} target="_blank" rel="noreferrer"
              style={{ ...S.primaryBtn,textDecoration:"none",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" }}>
              🎨 피그마 열기
            </a>
          )}
        </div>
      </div>
      <div style={{ marginTop:16,display:"flex",gap:12,alignItems:"center" }}>
        <button onClick={onGenerate} disabled={generating||!specText.trim()||!activeVersion}
          style={{ ...S.primaryBtn,opacity:(generating||!specText.trim()||!activeVersion)?0.45:1,
            cursor:(generating||!specText.trim()||!activeVersion)?"not-allowed":"pointer",minWidth:190,
            display:"flex",alignItems:"center",gap:8,justifyContent:"center" }}>
          {generating ? <><span style={{ display:"inline-block",animation:"spin 1s linear infinite",fontSize:15 }}>⟳</span> 분석 중...</> : "✨  QA 시트 생성"}
        </button>
        {generating && <span style={{ fontSize:12,color:MINT,fontWeight:600 }}>기획서를 분석하고 있습니다...</span>}
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      <div style={{ marginTop:28,...S.card,background:"#F0FDFA",border:`1px solid ${MINT}33` }}>
        <p style={{ margin:"0 0 10px",fontSize:13,color:MINT,fontWeight:800 }}>💡 더 정확한 QA 시트를 원한다면</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px",color:"#64748B",fontSize:12,lineHeight:2.1 }}>
          {["기능 목적, 대상 사용자, 동작 방식 명확히 서술","예외 케이스, 제약 조건, 에러 메시지 포함","API 연동, 서버 조건 등 기술적 요건 포함","UI/UX 요구사항 (버튼 텍스트, 화면 전환 등) 명시"].map(t => (
            <div key={t} style={{ display:"flex",gap:8,alignItems:"flex-start" }}><span style={{ color:MINT,marginTop:1 }}>▸</span>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpecHistoryTab({ specs, onDelete, onEdit, onUpdateQA, updatingSpecId }) {
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const handleEditStart = (spec, e) => {
    e.stopPropagation();
    setExpanded(spec.id);
    setEditingId(spec.id);
    setEditContent(spec.content);
  };
  const [updatingId, setUpdatingId] = useState(null);
  const handleEditSave = (spec) => { onEdit(spec.id, editContent); setEditingId(null); };
  useEffect(() => {
    if (updatingId) { onUpdateQA(updatingId, editContent); setUpdatingId(null); }
  }, [updatingId]);
  return (
    <div style={{ maxWidth:880,margin:"0 auto" }}>
      <div style={{ marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
        <div>
          <h2 style={{ margin:0,color:"#0F172A",fontSize:19,fontWeight:800 }}>기획서 히스토리</h2>
          <p style={{ margin:"5px 0 0",color:"#94A3B8",fontSize:13 }}>QA 생성 시 자동 저장된 기획서 이력입니다</p>
        </div>
        <div style={{ background:"#F1F5F9",borderRadius:9,padding:"6px 14px",fontSize:12,color:"#64748B",fontWeight:700 }}>총 {specs.length}건</div>
      </div>
      {confirmDeleteId && <ConfirmModal message="정말 삭제하시겠습니까?" onConfirm={() => { onDelete(confirmDeleteId); setConfirmDeleteId(null); }} onClose={() => setConfirmDeleteId(null)} />}
      {specs.length===0 ? (
        <div style={{ textAlign:"center",color:"#94A3B8",padding:"60px 0",border:"2px dashed #E2E8F0",borderRadius:14,fontSize:13 }}>
          아직 저장된 기획서가 없습니다. QA를 생성하면 자동으로 기록됩니다.
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {[...specs].reverse().map(spec => (
            <div key={spec.id} style={{ ...S.card,transition:"box-shadow .15s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow=S.card.boxShadow}>
              <div style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }} onClick={() => setExpanded(e => e===spec.id?null:spec.id)}>
                <div style={{ width:10,height:10,borderRadius:"50%",background:MINT,flexShrink:0 }} />
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4 }}>
                    <span style={{ fontWeight:800,color:"#0F172A",fontSize:14 }}>{spec.title||"제목 없음"}</span>
                    <span style={{ fontSize:11,padding:"2px 9px",borderRadius:99,background:MINT_LIGHT,color:MINT,fontWeight:700 }}>[{spec.versionType}] {spec.versionName}</span>
                    <span style={{ fontSize:11,padding:"2px 9px",borderRadius:99,background:"#ECFDF5",color:"#059669",fontWeight:700 }}>QA {spec.qaCount}건</span>
                    {spec.editedAt && <span style={{ fontSize:11,padding:"2px 9px",borderRadius:99,background:"#FFF7ED",color:"#D97706",fontWeight:700 }}>✏️ 수정됨</span>}
                  </div>
                  <div style={{ fontSize:12,color:"#94A3B8" }}>
                    📅 {spec.savedAt} · {spec.project}
                    {spec.editedAt && <span style={{ marginLeft:8,color:"#D97706" }}>· 마지막 수정: {spec.editedAt}</span>}
                  </div>
                </div>
                <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                  <button onClick={e => handleEditStart(spec,e)} style={{ ...S.btn,padding:"3px 9px",fontSize:11,color:MINT,borderColor:MINT+"44" }}>편집</button>
                  <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(spec.id); }} style={{ ...S.btn,padding:"3px 9px",fontSize:11,color:"#DC2626",borderColor:"#FECACA" }}>삭제</button>
                  <span style={{ color:"#CBD5E1",fontSize:14,userSelect:"none" }}>{expanded===spec.id?"▲":"▼"}</span>
                </div>
              </div>
              {expanded===spec.id && (
                <div style={{ marginTop:14,paddingTop:14,borderTop:"1px solid #F1F5F9" }}>
                  <label style={S.label}>기획서 내용</label>
                  {updatingSpecId===spec.id && (
                    <div style={{ background:"#F0FDF4",border:"1px solid #A7F3D0",borderRadius:10,padding:"12px 16px",marginBottom:12,fontSize:13,color:"#059669",fontWeight:600 }}>
                      ⟳ QA 시트를 업데이트하고 있습니다...
                    </div>
                  )}
                  {editingId===spec.id ? (
                    <div>
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                        style={{ ...S.input,height:280,resize:"vertical",lineHeight:1.8,fontSize:12,borderRadius:12,marginBottom:10 }} />
                      <div style={{ display:"flex",gap:8 }}>
                        <button onClick={() => handleEditSave(spec)} style={S.primaryBtn}>저장</button>
                        <button onClick={() => { handleEditSave(spec); setUpdatingId(spec.id); }} style={{ ...S.primaryBtn,background:"linear-gradient(135deg,#7C3AED,#A78BFA)" }}>저장 + QA 업데이트</button>
                        <button onClick={() => setEditingId(null)} style={S.secBtn}>취소</button>
                      </div>
                    </div>
                  ) : (
                    <pre style={{ margin:0,color:"#475569",fontSize:12,lineHeight:1.8,whiteSpace:"pre-wrap",wordBreak:"break-word",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:10,padding:14,maxHeight:280,overflowY:"auto",fontFamily:"inherit" }}>
                      {spec.content}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QATab({ qaItems, stats, enabledCols, filterStatus, setFilterStatus, searchQ, setSearchQ, onEdit, onStatusChange, onDelete, onDeleteMultiple, onReorder, onAdd, activeVersion }) {
  const [hover, setHover] = useState(null);
  const [checked, setChecked] = useState([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const allChecked = qaItems.length > 0 && checked.length === qaItems.length;
  const toggleAll = () => setChecked(allChecked ? [] : qaItems.map(q => q.id));
  const toggleOne = (id) => setChecked(p => p.includes(id) ? p.filter(i => i!==id) : [...p, id]);  // 플랫폼 제외한 컬럼
  const visibleCols = ALL_COLUMNS.filter(c => enabledCols.includes(c.key));
  // 담당자 목록 추출
  const assignees = [...new Set([
    ...qaItems.map(q => q.assignee).filter(Boolean),
    ...qaItems.flatMap(q => Object.keys(q.assigneeStatuses||{}))
  ])];
  const visibleAssignees = filterStatus==="전체"
    ? assignees
    : assignees.filter(a => qaItems.some(q => (q.assigneeStatuses?.[a]||"미테스트")===filterStatus));

  return (
    <div>
      <div style={{ display:"flex",gap:10,marginBottom:20 }}>
        {[
          { label:"전체",val:stats.total,color:"#475569" },
          { label:"성공",val:stats.pass,color:"#059669" },
          { label:"실패",val:stats.fail,color:"#DC2626" },
          { label:"보류",val:stats.hold,color:"#D97706" },
          { label:"통과율",val:stats.pct+"%",color:MINT },
        ].map(s => (
          <div key={s.label} style={{ ...S.card,flex:1,minWidth:0,padding:"13px 16px" }}>
            <div style={{ fontSize:10,color:"#94A3B8",marginBottom:5,letterSpacing:0.5,fontWeight:700,textTransform:"uppercase" }}>{s.label}</div>
            <div style={{ fontSize:24,fontWeight:800,color:s.color }}>{s.val}</div>
          </div>
        ))}
        <div style={{ ...S.card,flex:2,minWidth:0,padding:"13px 16px" }}>
          <div style={{ fontSize:10,color:"#94A3B8",marginBottom:8,letterSpacing:0.5,fontWeight:700,textTransform:"uppercase" }}>진행 현황</div>
          <div style={{ background:"#F1F5F9",borderRadius:99,height:8,overflow:"hidden" }}>
            <div style={{ height:"100%",borderRadius:99,background:`linear-gradient(90deg,${MINT},${MINT_MID})`,width:stats.pct+"%",transition:"width .5s" }} />
          </div>
          <div style={{ display:"flex",gap:12,marginTop:7,fontSize:11,color:"#94A3B8",fontWeight:600 }}>
            <span style={{ color:"#059669" }}>성공 {stats.pass}</span>
            <span style={{ color:"#DC2626" }}>실패 {stats.fail}</span>
            <span style={{ color:"#D97706" }}>보류 {stats.hold}</span>
            <span>미테스트 {stats.total-stats.pass-stats.fail-stats.hold}</span>
          </div>
        </div>
      </div>

      <div style={{ display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap" }}>
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍  제목, 담당자 검색"
          style={{ ...S.input,width:220,padding:"8px 12px" }} />
        <div style={{ display:"flex",gap:5 }}>
          {["전체","미테스트","성공","실패","보류"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ ...S.btn,fontSize:12,padding:"6px 13px",fontWeight:600,
              background:filterStatus===s?(STATUS_META[s]?.bg||MINT_LIGHT):"#FFFFFF",
              borderColor:filterStatus===s?(STATUS_META[s]?.border||MINT):"#E2E8F0",
              color:filterStatus===s?(STATUS_META[s]?.text||MINT):"#64748B" }}>{s}</button>
          ))}
        </div>
        <div style={{ marginLeft:"auto",display:"flex",gap:8 }}>
          {checked.length>0 && (
            <button onClick={() => setConfirmBulkDelete(true)}
              style={{ ...S.btn,color:"#DC2626",borderColor:"#FECACA",fontWeight:700,fontSize:12,padding:"7px 14px" }}>
              🗑️ 선택 삭제 ({checked.length})
            </button>
          )}
          <button onClick={onAdd} disabled={!activeVersion}
            style={{ ...S.primaryBtn,fontSize:12,padding:"7px 18px",opacity:activeVersion?1:.45 }}>
            + 케이스 추가
          </button>
        </div>
      </div>
      {confirmBulkDelete && (
        <ConfirmModal
          message={`선택한 ${checked.length}개의 QA 케이스를 삭제하시겠습니까?`}
          onConfirm={() => { onDeleteMultiple(checked); setChecked([]); setConfirmBulkDelete(false); }}
          onClose={() => setConfirmBulkDelete(false)} />
      )}

      {qaItems.length===0 ? (
        <div style={{ textAlign:"center",color:"#94A3B8",padding:"60px 0",border:"2px dashed #E2E8F0",borderRadius:14,fontSize:13 }}>
          {activeVersion?"QA 케이스가 없습니다. 기획서 탭에서 생성하거나 직접 추가하세요.":"버전을 선택하세요."}
        </div>
      ) : (
        <div style={{ overflowX:"auto",borderRadius:14,border:"1px solid #E2E8F0",boxShadow:"0 1px 4px rgba(0,0,0,.05)" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
            <thead>
              <tr style={{ background:"#F8FAFC",borderBottom:"1px solid #E2E8F0" }}>
                <th style={{ ...S.th,width:36 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ cursor:"pointer",width:15,height:15 }} />
                </th>
                <th style={{ ...S.th,width:40 }}></th>
                <th style={{ ...S.th,width:40 }}>#</th>
                {visibleCols.map(c => <th key={c.key} style={S.th}>{c.label}</th>)}
                {/* 담당자 이름을 컬럼 헤더로 */}
                {visibleAssignees.map(a => (
                  <th key={a} style={{ ...S.th,minWidth:110,textAlign:"center" }}>
                    <div style={{ color:"#0F172A",fontWeight:800,fontSize:12,marginBottom:4 }}>👤 {a}</div>
                    <div style={{ fontSize:10,color:"#94A3B8",fontWeight:600 }}>상태</div>
                  </th>
                ))}
                <th style={{ ...S.th,width:70 }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {qaItems.map((item, idx) => (
                <tr key={item.id}
                  style={{ borderBottom:"1px solid #F1F5F9",background:hover===item.id?"#F8FAFC":"#FFFFFF",transition:"background .1s" }}
                  onMouseEnter={() => setHover(item.id)} onMouseLeave={() => setHover(null)}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderTop="2px solid "+MINT; }}
                  onDragLeave={e => { e.currentTarget.style.borderTop=""; }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.style.borderTop="";
                    const dragId = e.dataTransfer.getData("dragId");
                    if (dragId !== item.id) onReorder(dragId, item.id);
                  }}>
                  <td style={{ ...S.td,textAlign:"center" }}>
                    <input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggleOne(item.id)} style={{ cursor:"pointer",width:15,height:15 }} />
                  </td>
                  <td style={{ ...S.td,textAlign:"center",width:40 }}
                    draggable
                    onDragStart={e => { e.dataTransfer.setData("dragId", item.id); e.currentTarget.closest("tr").style.opacity="0.4"; }}
                    onDragEnd={e => { e.currentTarget.closest("tr").style.opacity="1"; }}>
                    <div style={{ cursor:"grab",color:"#CBD5E1",fontSize:18,userSelect:"none",lineHeight:1 }}>⠿</div>
                  </td>
                  <td style={{ ...S.td,color:"#CBD5E1",fontWeight:700 }}>{idx+1}</td>
                  {visibleCols.map(c => (
                    <td key={c.key} style={{ ...S.td,maxWidth:c.key==="testSteps"?200:160 }}>
                      {c.key==="testSteps"
  ? <div style={{ whiteSpace:"pre-line",color:"#94A3B8",fontSize:12,lineHeight:1.6 }}>
      {(() => { const lines = String(item[c.key]||"").split("\n"); return lines.slice(0,3).join("\n") + (lines.length>3?"\n…":""); })()}
    </div>
                        : c.key==="memo"
                          ? <input value={item.memo||""} onChange={e => onStatusChange(item.id, null, { memo:e.target.value })}
                              style={{ ...S.input,padding:"4px 8px",fontSize:12,background:"transparent",border:"1px solid transparent",minWidth:80 }}
                              placeholder="메모 입력"
                              onFocus={e => e.target.style.border="1px solid #E2E8F0"}
                              onBlur={e => e.target.style.border="1px solid transparent"} />
                          : <span style={{ color:c.key==="title"?"#1E293B":"#64748B",fontWeight:c.key==="title"?700:400 }}>{item[c.key]||"—"}</span>
                      }
                    </td>
                  ))}
                 {/* 담당자별 상태 드롭다운 */}
                  {visibleAssignees.map(a => {
                    const aStatus = item.assigneeStatuses?.[a] || "미테스트";
                    const show = filterStatus==="전체" || aStatus===filterStatus;
                    return (
                      <td key={a} style={{ ...S.td,textAlign:"center" }}>
                        {show ? (
                          <select value={aStatus}
                            onChange={e => onStatusChange(item.id, null, { assigneeStatuses:{ ...(item.assigneeStatuses||{}), [a]:e.target.value } })}
                            style={{ background:STATUS_META[aStatus].bg,color:STATUS_META[aStatus].text,
                              border:`1px solid ${STATUS_META[aStatus].border}`,borderRadius:7,padding:"4px 8px",fontSize:11,cursor:"pointer",outline:"none",fontFamily:"inherit",fontWeight:700 }}>
                            {["미테스트","성공","실패","보류"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span style={{ color:"#E2E8F0" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                  <td style={S.td}>
                    <div style={{ display:"flex",gap:5 }}>
                      <button onClick={() => onEdit(item)} title="수정" style={{ ...S.btn,padding:"4px 8px",fontSize:15,color:MINT,borderColor:MINT+"44" }}>✏️</button>
                      <button onClick={() => onDelete(item.id)} title="삭제" style={{ ...S.btn,padding:"4px 8px",fontSize:15,color:"#DC2626",borderColor:"#FECACA" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function IMSTab({ issues, allIssues, filterSev, setFilterSev, searchQ, setSearchQ, onEdit, onDelete, onAdd, onDeleteMultiple, qaItems, activeVersion }) {
  const [filterType, setFilterType] = useState("전체");
  const [hover, setHover] = useState(null);
  const [checked, setChecked] = useState([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const allChecked = issues.length > 0 && checked.length === issues.length;
  const toggleAll = () => setChecked(allChecked ? [] : issues.map(i => i.id));
  const toggleOne = (id) => setChecked(p => p.includes(id) ? p.filter(i => i!==id) : [...p, id]);
  const stats = {
    total:allIssues.length,
    open:allIssues.filter(i => i.issueStatus!=="해결됨").length,
    resolved:allIssues.filter(i => i.issueStatus==="해결됨").length,
    critical:allIssues.filter(i => i.severity==="긴급").length,
  };
const issueStatusColor = {
    "미처리":{ bg:"#F1F5F9",text:"#64748B" },
    "진행중":{ bg:"#FFF7ED",text:"#EA580C" },
    "해결됨":{ bg:"#ECFDF5",text:"#059669" },
    "보류":  { bg:"#FFFBEB",text:"#D97706" },
  };
  const displayed = issues.filter(i => {
    if (filterType!=="전체" && i.type!==filterType) return false;
    if (filterSev!=="전체" && i.severity!==filterSev) return false;
    if (searchQ && !i.title?.includes(searchQ)) return false;
    return true;
  });
  return (
    <div>
           <div style={{ display:"flex",gap:10,marginBottom:20 }}>
        {[
          { label:"전체 이슈",val:stats.total,color:"#475569" },
          { label:"미처리",val:allIssues.filter(i=>i.issueStatus==="미처리"||!i.issueStatus).length,color:"#64748B" },
          { label:"진행중",val:allIssues.filter(i=>i.issueStatus==="진행중").length,color:"#EA580C" },
          { label:"보류",val:allIssues.filter(i=>i.issueStatus==="보류").length,color:"#D97706" },
          { label:"해결됨",val:allIssues.filter(i=>i.issueStatus==="해결됨").length,color:"#059669" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card,flex:1,padding:"13px 16px" }}>
            <div style={{ fontSize:10,color:"#94A3B8",marginBottom:5,letterSpacing:0.5,fontWeight:700,textTransform:"uppercase" }}>{s.label}</div>
            <div style={{ fontSize:24,fontWeight:800,color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex",gap:10,marginBottom:14,alignItems:"center",flexWrap:"wrap" }}>
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍  이슈 검색"
          style={{ ...S.input,width:200,padding:"8px 12px" }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ ...S.input,width:"auto",padding:"8px 14px",fontWeight:600,cursor:"pointer" }}>
          <option value="전체">전체 유형</option>
          <option value="이슈">🐞 이슈</option>
          <option value="수정">🔧 수정</option>
        </select>
        <select value={filterSev} onChange={e => setFilterSev(e.target.value)}
          style={{ ...S.input,width:"auto",padding:"8px 14px",fontWeight:600,cursor:"pointer" }}>
          <option value="전체">전체 심각도</option>
          <option value="긴급">긴급</option>
          <option value="높음">높음</option>
          <option value="보통">보통</option>
          <option value="낮음">낮음</option>
        </select>
        <div style={{ marginLeft:"auto",display:"flex",gap:8 }}>
          {checked.length>0 && (
            <button onClick={() => setConfirmBulkDelete(true)}
              style={{ ...S.btn,color:"#DC2626",borderColor:"#FECACA",fontWeight:700,fontSize:12,padding:"7px 14px" }}>
              🗑️ 선택 삭제 ({checked.length})
            </button>
          )}
          <button onClick={onAdd} disabled={!activeVersion}
            style={{ ...S.primaryBtn,fontSize:12,padding:"7px 18px",opacity:activeVersion?1:.45 }}>
            + 이슈 등록
          </button>
        </div>
      </div>
      {confirmBulkDelete && (
        <ConfirmModal
          message={`선택한 ${checked.length}개의 이슈를 삭제하시겠습니까?`}
          onConfirm={() => { onDeleteMultiple(checked); setChecked([]); setConfirmBulkDelete(false); }}
          onClose={() => setConfirmBulkDelete(false)} />
      )}
      {displayed.length===0 ? (
        <div style={{ textAlign:"center",color:"#94A3B8",padding:"60px 0",border:"2px dashed #E2E8F0",borderRadius:14,fontSize:13 }}>
          {activeVersion?"등록된 이슈가 없습니다.":"버전을 선택하세요."}
        </div>
      ) : (
        <div style={{ overflowX:"auto",borderRadius:14,border:"1px solid #E2E8F0",boxShadow:"0 1px 4px rgba(0,0,0,.05)" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
            <thead>
              <tr style={{ background:"#F8FAFC",borderBottom:"1px solid #E2E8F0" }}>
                <th style={{ ...S.th,width:36 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ cursor:"pointer",width:15,height:15 }} />
                </th>
                <th style={{ ...S.th,width:40 }}>#</th>
                <th style={{ ...S.th,width:70 }}>유형</th>
                <th style={S.th}>제목</th>
                <th style={{ ...S.th,width:80 }}>심각도</th>
                <th style={{ ...S.th,width:80 }}>상태</th>
                <th style={{ ...S.th,width:90 }}>담당자</th>
                <th style={{ ...S.th,width:80 }}>첨부</th>
                <th style={{ ...S.th,width:80 }}>등록일</th>
                <th style={{ ...S.th,width:70 }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((issue, idx) => (
                <tr key={issue.id}
                  style={{ borderBottom:"1px solid #F1F5F9",background:hover===issue.id?"#F8FAFC":"#FFFFFF",transition:"background .1s",
                    borderLeft:`3px solid ${SEVERITY_META[issue.severity]?.color||"#E2E8F0"}` }}
                  onMouseEnter={() => setHover(issue.id)} onMouseLeave={() => setHover(null)}>
                  <td style={{ ...S.td,textAlign:"center" }}>
                    <input type="checkbox" checked={checked.includes(issue.id)} onChange={() => toggleOne(issue.id)} style={{ cursor:"pointer",width:15,height:15 }} />
                  </td>
                  <td style={{ ...S.td,color:"#CBD5E1",fontWeight:700 }}>{idx+1}</td>
                  <td style={S.td}>
                    <span style={{ fontSize:11,padding:"3px 8px",borderRadius:99,fontWeight:800,
                      background:issue.type==="이슈"?"#FEF2F2":"#FFFBEB",
                      color:issue.type==="이슈"?"#DC2626":"#D97706",whiteSpace:"nowrap" }}>
                      {issue.type==="이슈"?"🐞 이슈":"🔧 수정"}
                    </span>
                  </td>
                  <td style={{ ...S.td,maxWidth:240 }}>
                    <div style={{ fontWeight:700,color:"#1E293B",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{issue.title||"—"}</div>
                    {issue.scenario && <div style={{ fontSize:11,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{issue.scenario}</div>}
                  </td>
                  <td style={S.td}>
                    {issue.severity && (
                      <span style={{ fontSize:11,padding:"3px 8px",borderRadius:99,fontWeight:700,whiteSpace:"nowrap",
                        background:SEVERITY_META[issue.severity]?.bg||"#F1F5F9",
                        color:SEVERITY_META[issue.severity]?.color||"#64748B" }}>{issue.severity}</span>
                    )}
                  </td>
                  <td style={S.td}>
                    <span style={{ fontSize:11,padding:"3px 8px",borderRadius:99,fontWeight:700,whiteSpace:"nowrap",
                      background:(issueStatusColor[issue.issueStatus||"미처리"]).bg,
                      color:(issueStatusColor[issue.issueStatus||"미처리"]).text }}>
                      {issue.issueStatus||"미처리"}
                    </span>
                  </td>
                  <td style={{ ...S.td,color:"#64748B" }}>{issue.assignee||"—"}</td>
                  <td style={S.td}>
                    {issue.attachments?.length>0
                      ? <span style={{ fontSize:11,color:"#94A3B8",background:"#F1F5F9",padding:"3px 8px",borderRadius:99 }}>📎 {issue.attachments.length}개</span>
                      : <span style={{ color:"#CBD5E1" }}>—</span>
                    }
                  </td>
                  <td style={{ ...S.td,color:"#94A3B8",fontSize:12,whiteSpace:"nowrap" }}>{issue.createdAt||"—"}</td>
                  <td style={S.td}>
                    <div style={{ display:"flex",gap:5 }}>
                      <button onClick={() => onEdit(issue)} title="수정" style={{ ...S.btn,padding:"4px 8px",fontSize:15,color:MINT,borderColor:MINT+"44" }}>✏️</button>
                      <button onClick={() => onDelete(issue.id)} title="삭제" style={{ ...S.btn,padding:"4px 8px",fontSize:15,color:"#DC2626",borderColor:"#FECACA" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function StoryLineQA() {
  const [tab, setTab] = useState("dashboard");
  const [projects, setProjects] = useState([{ id:uid(),name:"프로젝트 A",versions:[],specHistory:[],trash:[] }]);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);
  const [urlParamsApplied, setUrlParamsApplied] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(() => {
    return localStorage.getItem("slqa_activeProjectId") || null;
  });
  const [activeVersionId, setActiveVersionId] = useState(() => {
    return localStorage.getItem("slqa_activeVersionId") || null;
  });
  const [enabledCols, setEnabledCols] = useState(DEFAULT_ENABLED);
  const [showColConfig, setShowColConfig] = useState(false);
  const [specText, setSpecText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [versionModal, setVersionModal] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [editingQA, setEditingQA] = useState(null);
  const [editingIssue, setEditingIssue] = useState(null);
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [filterStatus, setFilterStatus] = useState("전체");
  const [issueFilterSev, setIssueFilterSev] = useState("전체");
  const [searchQ, setSearchQ] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadFromFirebase().then(data => {
      if (data) {
        setProjects(data);
        try { localStorage.setItem("slqa_projects", JSON.stringify(data)); } catch {}
      }
      setFirebaseLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!firebaseLoaded || urlParamsApplied) return;
    const params = new URLSearchParams(window.location.search);
    const projectParam = params.get("project");
    const versionParam = params.get("version");
    const tabParam = params.get("tab");
    if (projectParam) setActiveProjectId(projectParam);
    if (versionParam) setActiveVersionId(versionParam);
    if (tabParam) setTab(tabParam);
    setUrlParamsApplied(true);
  }, [firebaseLoaded]);

  useEffect(() => {
    if (!firebaseLoaded) return;
    saveToFirebase(projects);
    try { localStorage.setItem("slqa_projects", JSON.stringify(projects)); } catch {}
  }, [projects, firebaseLoaded]);

  useEffect(() => {
    if (activeProjectId) localStorage.setItem("slqa_activeProjectId", activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    if (activeVersionId) localStorage.setItem("slqa_activeVersionId", activeVersionId);
  }, [activeVersionId]);

  const activeProject = projects.find(p => p.id===activeProjectId) ?? (projects.length>0?projects[0]:null);
  const activeVersion = activeProject?.versions.find(v => v.id===activeVersionId) ?? (activeProject?.versions.length>0?activeProject.versions[0]:null);

  const updateProject = (pid, fn) => setProjects(ps => ps.map(p => p.id===pid?fn(p):p));
  const updateVersion = (pid, vid, fn) => updateProject(pid, p => ({ ...p, versions:p.versions.map(v => v.id===vid?fn(v):v) }));

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const p = { id:uid(),name:newProjectName.trim(),versions:[],specHistory:[] };
    setProjects(ps => [...ps,p]);
    setActiveProjectId(p.id);
    setActiveVersionId(null);
    setNewProjectName("");
    setShowAddProject(false);
  };

  const handleVersionSave = (v) => {
    if (versionModal?.mode==="edit") {
      updateVersion(activeProject.id, v.id, () => v);
    } else {
      const newV = { id:uid(),name:v.name,type:v.type,qaItems:[],issues:[] };
      updateProject(activeProject.id, p => ({ ...p,versions:[...p.versions,newV] }));
      setActiveVersionId(newV.id);
    }
    setVersionModal(null);
  };

  const handleGenerateStart = () => {
    if (!specText.trim()||!activeVersion) return;
    setShowAssigneeModal(true);
  };

  const handleGenerateWithAssignees = async (assignees) => {
    setShowAssigneeModal(false);
    setGenerating(true);
    try {
      const items = await generateQAFromSpec(specText, { project:activeProject.name,version:activeVersion.name,type:activeVersion.type }, enabledCols);
      // 담당자 round-robin 배분
      const mapped = items.map((item, i) => ({
        ...item,
        id: uid(),
        memo: "",
        assignee: assignees.length>0 ? assignees[i % assignees.length] : "",
      }));
      updateVersion(activeProject.id, activeVersion.id, v => ({ ...v,qaItems:[...v.qaItems,...mapped] }));
      const specRecord = { id:uid(),title:specText.split("\n").find(l=>l.trim())||"기획서 "+nowStr(),content:specText,savedAt:nowStr(),project:activeProject.name,versionName:activeVersion.name,versionType:activeVersion.type,qaCount:mapped.length };
      updateProject(activeProject.id, p => ({ ...p,specHistory:[...p.specHistory,specRecord] }));
      setCompletedCount(mapped.length);
      setShowCompleteModal(true);
    } catch(e) {
      console.error("QA 생성 오류:",e);
      alert(`QA 생성 중 문제가 발생했습니다.\n\n원인: ${e.message}`);
    }
    setGenerating(false);
  };

  const saveQA = (item) => {
    if (!activeVersion) return;
    if (item.id && activeVersion.qaItems.find(q => q.id===item.id)) {
      updateVersion(activeProject.id, activeVersion.id, v => ({ ...v,qaItems:v.qaItems.map(q => q.id===item.id?item:q) }));
    } else {
      updateVersion(activeProject.id, activeVersion.id, v => ({ ...v,qaItems:[...v.qaItems,{ ...item,id:uid() }] }));
    }
    setEditingQA(null);
  };

  const handleStatusChange = (id, status, extra) => {
    updateVersion(activeProject.id, activeVersion.id, v => ({
      ...v, qaItems:v.qaItems.map(q => {
        if (q.id !== id) return q;
        const updated = { ...q, ...(status ? { status } : {}), ...(extra||{}) };
        if (extra?.assigneeStatuses) {
          // 기존 + 새 assigneeStatuses 병합 후 status 결정
          const merged = { ...(q.assigneeStatuses||{}), ...extra.assigneeStatuses };
          updated.assigneeStatuses = merged;
          const statuses = Object.values(merged);
          if (statuses.includes("실패")) updated.status = "실패";
          else if (statuses.includes("보류")) updated.status = "보류";
          else if (statuses.includes("미테스트")) updated.status = "미테스트";
          else if (statuses.length > 0) updated.status = "성공";
        }
        return updated;
      })
    }));
  };

  const deleteQA = (id) => setConfirmDelete({ type:"qa",id });
  const deleteIssue = (id) => setConfirmDelete({ type:"issue",id });
  const deleteMultipleQA = (ids) => {
    const items = activeVersion.qaItems.filter(q => ids.includes(q.id)).map(q => ({ ...q, _type:"qa", _versionId:activeVersion.id, _deletedAt:nowStr() }));
    updateProject(activeProject.id, p => ({ ...p, trash:[...(p.trash||[]),...items] }));
    updateVersion(activeProject.id, activeVersion.id, v => ({ ...v,qaItems:v.qaItems.filter(q => !ids.includes(q.id)) }));
  };
  const reorderQA = (dragId, dropId) => updateVersion(activeProject.id, activeVersion.id, v => {
    const items = [...v.qaItems];
    const dragIdx = items.findIndex(q => q.id===dragId);
    const dropIdx = items.findIndex(q => q.id===dropId);
    if (dragIdx === -1 || dropIdx === -1) return v;
    const [dragged] = items.splice(dragIdx, 1);
    items.splice(dropIdx, 0, dragged);
    return { ...v, qaItems:items };
  });
  const deleteMultipleIssues = (ids) => {
    const items = activeVersion.issues.filter(i => ids.includes(i.id)).map(i => ({ ...i, _type:"issue", _versionId:activeVersion.id, _deletedAt:nowStr() }));
    updateProject(activeProject.id, p => ({ ...p, trash:[...(p.trash||[]),...items] }));
    updateVersion(activeProject.id, activeVersion.id, v => ({ ...v,issues:v.issues.filter(i => !ids.includes(i.id)) }));
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type==="qa") {
      const item = activeVersion.qaItems.find(q => q.id===confirmDelete.id);
      if (item) updateProject(activeProject.id, p => ({ ...p, trash:[...(p.trash||[]), { ...item, _type:"qa", _versionId:activeVersion.id, _deletedAt:nowStr() }] }));
      updateVersion(activeProject.id, activeVersion.id, v => ({ ...v,qaItems:v.qaItems.filter(q => q.id!==confirmDelete.id) }));
    } else if (confirmDelete.type==="issue") {
      const item = activeVersion.issues.find(i => i.id===confirmDelete.id);
      if (item) updateProject(activeProject.id, p => ({ ...p, trash:[...(p.trash||[]), { ...item, _type:"issue", _versionId:activeVersion.id, _deletedAt:nowStr() }] }));
      updateVersion(activeProject.id, activeVersion.id, v => ({ ...v,issues:v.issues.filter(i => i.id!==confirmDelete.id) }));
    }
    setConfirmDelete(null);
  };

  const saveIssue = (issue) => {
    if (issue.id) {
      updateVersion(activeProject.id, activeVersion.id, v => ({ ...v,issues:v.issues.map(i => i.id===issue.id?issue:i) }));
    } else {
      updateVersion(activeProject.id, activeVersion.id, v => ({ ...v,issues:[...v.issues,{ ...issue,id:uid(),createdAt:new Date().toLocaleDateString("ko-KR"),projectId:activeProject.id,versionId:activeVersion.id }] }));
    }
    setEditingIssue(null);
    setShowAddIssue(false);
  };

  const [updatingSpecId, setUpdatingSpecId] = useState(null);

  const handleUpdateQA = async (specId, newContent) => {
    const spec = activeProject.specHistory.find(s => s.id===specId);
    if (!spec) return;
    const targetVersion = activeProject.versions.find(v => v.name===spec.versionName && v.type===spec.versionType);
    if (!targetVersion) return;
    setUpdatingSpecId(specId);
    try {
      const newItems = await generateQAFromSpec(newContent, { project:activeProject.name, version:targetVersion.name, type:targetVersion.type }, enabledCols);
      const newTitles = newItems.map(i => i.title);
      updateVersion(activeProject.id, targetVersion.id, v => {
        // 새 QA 제목에 없는 기존 QA 제거
        const kept = v.qaItems.filter(q => newTitles.includes(q.title));
        // 기존에 없는 새 QA만 추가
        const keptTitles = kept.map(q => q.title);
        const added = newItems.filter(i => !keptTitles.includes(i.title)).map(i => ({ ...i, id:uid(), memo:"" }));
        return { ...v, qaItems:[...kept, ...added] };
      });
    } catch(e) {
      alert(`QA 업데이트 중 오류가 발생했습니다.\n${e.message}`);
    }
    setUpdatingSpecId(null);
  };

  const deleteSpec = (id) => {
    const item = activeProject.specHistory.find(s => s.id===id);
    if (item) updateProject(activeProject.id, p => ({ ...p, trash:[...(p.trash||[]), { ...item, _type:"spec", _deletedAt:nowStr() }], specHistory:p.specHistory.filter(s => s.id!==id) }));
  };
  const editSpec = (id, newContent) => updateProject(activeProject.id, p => ({ ...p,specHistory:p.specHistory.map(s => s.id===id?{ ...s,content:newContent,editedAt:nowStr() }:s) }));

  const qaItems = activeVersion?.qaItems||[];
  const issues = activeVersion?.issues||[];
  const specHistory = activeProject?.specHistory||[];

  const filteredQA = qaItems.filter(q => {
    if (filterStatus!=="전체") {
      const statuses = Object.values(q.assigneeStatuses||{});
      if (statuses.length===0) {
        if (filterStatus!=="미테스트") return false;
      } else {
        if (!statuses.includes(filterStatus)) return false;
      }
    }
    if (searchQ && !q.title?.includes(searchQ) && !q.assignee?.includes(searchQ)) return false;
    return true;
  });
const filteredIssues = issues.filter(i => {
    if (issueFilterSev!=="전체" && i.severity!==issueFilterSev) return false;
    if (searchQ && !i.title?.includes(searchQ)) return false;
    return true;
  });  
  const assignees = [...new Set([
    ...qaItems.map(q => q.assignee).filter(Boolean),
    ...qaItems.flatMap(q => Object.keys(q.assigneeStatuses||{}))
  ])];
  const qaStats = {    total:qaItems.length,
    pass:qaItems.filter(q => q.status==="성공").length,
    fail:qaItems.filter(q => q.status==="실패").length,
    hold:qaItems.filter(q => q.status==="보류").length,
    pct:qaItems.length?Math.round(qaItems.filter(q => q.status==="성공").length/qaItems.length*100):0,
  };

    const trash = activeProject?.trash||[];
  const TABS = [
    ["dashboard","🏠  대시보드"],
    ["specHistory","📂  히스토리",specHistory.length],
    ["spec","📋  기획서 입력"],
    ["qa","🧪  QA 시트",qaItems.length],
    ["ims","🐞  이슈 관리",issues.length],
    ["trash","🗑️  휴지통",trash.length],
  ];

  return (
    <div style={{ minHeight:"100vh",background:"#F5F7FA",color:"#1E293B",fontFamily:"'Nunito','Apple SD Gothic Neo',sans-serif" }}>
      <FontLoader />
      <div style={{ background:"#FFFFFF",borderBottom:"1px solid #E2E8F0",padding:"0 22px",display:"flex",alignItems:"center",gap:12,height:56,boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
          <img src="/logo.png" alt="logo" style={{ width:34,height:34,objectFit:"contain" }} onError={e => { e.target.style.display="none"; }} />
          <span style={{ fontWeight:900,fontSize:15,color:"#0F172A",letterSpacing:-0.3 }}>StoryLine QA</span>
        </div>
        <div style={S.divider} />
        <div style={{ display:"flex",alignItems:"center",gap:7 }}>
          <span style={{ fontSize:10,color:"#CBD5E1",letterSpacing:1,fontWeight:800,textTransform:"uppercase" }}>Project</span>
          <select value={activeProjectId} onChange={e => { setActiveProjectId(e.target.value); setActiveVersionId(null); }}
            style={{ ...S.input,width:"auto",padding:"5px 10px",fontSize:13,fontWeight:700 }}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => setShowAddProject(true)} style={{ ...S.btn,padding:"4px 10px",fontSize:12,color:MINT,borderColor:MINT+"44",fontWeight:700 }}>+</button>
        </div>
        <div style={S.divider} />
        <div style={{ display:"flex",alignItems:"center",gap:7 }}>
          <span style={{ fontSize:10,color:"#CBD5E1",letterSpacing:1,fontWeight:800,textTransform:"uppercase" }}>Version</span>
          {activeProject?.versions.length>0
            ? <select value={activeVersion?.id||""} onChange={e => setActiveVersionId(e.target.value)}
                style={{ ...S.input,width:"auto",padding:"5px 10px",fontSize:13,fontWeight:700 }}>
                {activeProject.versions.map(v => <option key={v.id} value={v.id}>[{v.type}] {v.name}</option>)}
              </select>
            : <span style={{ fontSize:13,color:"#CBD5E1",fontWeight:600 }}>없음</span>
          }
          <button onClick={() => setVersionModal({ mode:"add" })} style={{ ...S.btn,padding:"4px 10px",fontSize:12,color:MINT,borderColor:MINT+"44",fontWeight:700 }}>+</button>
          {activeVersion && <button onClick={() => setVersionModal({ mode:"edit",version:activeVersion })} style={{ ...S.btn,padding:"4px 10px",fontSize:12,fontWeight:700 }}>✏️</button>}
        </div>
        <button onClick={() => setShowColConfig(true)} style={{ ...S.btn,marginLeft:"auto",fontSize:12,padding:"5px 13px",fontWeight:700 }}>⚙ 설정</button>
      </div>

      <div style={{ background:"#FFFFFF",borderBottom:"1px solid #E2E8F0",padding:"0 22px",display:"flex",gap:0 }}>
        {TABS.map(([k,label,count]) => (
          <button key={k} onClick={() => {
            setTab(k);
            setSearchQ("");
            const params = new URLSearchParams(window.location.search);
            params.set("tab", k);
            if (activeProject) params.set("project", activeProject.id);
            if (activeVersion) params.set("version", activeVersion.id);
            window.history.replaceState({}, "", `?${params.toString()}`);
          }} style={{
            padding:"13px 20px",background:"none",border:"none",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:700,
            color:tab===k?MINT:"#94A3B8",borderBottom:tab===k?`2px solid ${MINT}`:"2px solid transparent",transition:"all .15s",
            display:"flex",alignItems:"center",gap:6 }}>
            {label}
            {count!=null && count>0 && (
              <span style={{ fontSize:10,background:tab===k?MINT_LIGHT:"#F1F5F9",color:tab===k?MINT:"#94A3B8",padding:"2px 7px",borderRadius:99,fontWeight:800 }}>{count}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding:28 }}>
        {tab==="dashboard" && <DashboardTab projects={projects} setActiveProjectId={setActiveProjectId} setActiveVersionId={setActiveVersionId} setTab={setTab} />}
        {tab==="spec" && <SpecTab specText={specText} setSpecText={setSpecText} onGenerate={handleGenerateStart} generating={generating} activeVersion={activeVersion} onAddVersion={() => setVersionModal({ mode:"add" })} />}
        {tab==="specHistory" && <SpecHistoryTab specs={specHistory} onDelete={deleteSpec} onEdit={editSpec} onUpdateQA={handleUpdateQA} updatingSpecId={updatingSpecId} />}
       {tab==="qa" && <QATab qaItems={filteredQA} stats={qaStats} enabledCols={enabledCols} filterStatus={filterStatus} setFilterStatus={setFilterStatus} searchQ={searchQ} setSearchQ={setSearchQ} onEdit={setEditingQA} onStatusChange={handleStatusChange} onDelete={deleteQA} onDeleteMultiple={deleteMultipleQA} onReorder={reorderQA} onAdd={() => setEditingQA({ id:null,title:"",status:"미테스트",testSteps:"",expected:"",memo:"" })} activeVersion={activeVersion} />}
        {tab==="trash" && <TrashTab
          trash={trash}
          onRestore={(item) => {
            if (item._type==="qa") updateVersion(activeProject.id, item._versionId, v => ({ ...v, qaItems:[...v.qaItems, { ...item }] }));
            else if (item._type==="issue") updateVersion(activeProject.id, item._versionId, v => ({ ...v, issues:[...v.issues, { ...item }] }));
            else if (item._type==="spec") updateProject(activeProject.id, p => ({ ...p, specHistory:[...p.specHistory, { ...item }] }));
            updateProject(activeProject.id, p => ({ ...p, trash:(p.trash||[]).filter(t => t.id!==item.id) }));
          }}
          onDeleteForever={(id) => updateProject(activeProject.id, p => ({ ...p, trash:(p.trash||[]).filter(t => t.id!==id) }))}
          onEmptyTrash={() => updateProject(activeProject.id, p => ({ ...p, trash:[] }))}
        />}
        {tab==="ims" && <IMSTab issues={filteredIssues} allIssues={issues} filterSev={issueFilterSev} setFilterSev={setIssueFilterSev} searchQ={searchQ} setSearchQ={setSearchQ} onEdit={setEditingIssue} onDelete={deleteIssue} onDeleteMultiple={deleteMultipleIssues} onAdd={() => setShowAddIssue(true)} qaItems={qaItems} activeVersion={activeVersion} />}
      </div>

      {showCompleteModal && <CompleteModal count={completedCount} onConfirm={() => { setShowCompleteModal(false); setTab("qa"); }} />}
      {showAssigneeModal && <AssigneeModal onConfirm={handleGenerateWithAssignees} onSkip={() => handleGenerateWithAssignees([])} />}

      {showAddProject && (
        <Modal title="새 프로젝트" onClose={() => setShowAddProject(false)}>
          <label style={S.label}>프로젝트 이름</label>
          <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} onKeyDown={e => e.key==="Enter"&&addProject()} style={S.input} placeholder="" autoFocus />
          <div style={{ display:"flex",gap:8,marginTop:18 }}>
            <button onClick={addProject} style={S.primaryBtn}>생성</button>
            <button onClick={() => setShowAddProject(false)} style={S.secBtn}>취소</button>
          </div>
        </Modal>
      )}

      {versionModal && <VersionModal version={versionModal.mode==="edit"?versionModal.version:null} onSave={handleVersionSave} onClose={() => setVersionModal(null)} />}
      {showColConfig && <ColConfigModal enabled={enabledCols} setEnabled={setEnabledCols} onClose={() => setShowColConfig(false)} />}
      {editingQA && <QAEditModal item={editingQA} enabledCols={enabledCols} onSave={saveQA} onClose={() => setEditingQA(null)} />}
      {(editingIssue||showAddIssue) && <IssueEditModal item={editingIssue} qaItems={qaItems} onSave={saveIssue} onClose={() => { setEditingIssue(null); setShowAddIssue(false); }} />}
      {confirmDelete && <ConfirmModal message="정말 삭제하시겠습니까?" onConfirm={handleConfirmDelete} onClose={() => setConfirmDelete(null)} />}
    </div>
  ) ;
}
