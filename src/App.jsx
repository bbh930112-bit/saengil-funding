import React, { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

const s = {
  wrap: { minHeight: '100vh', background: '#fff', fontFamily: "'Pretendard', sans-serif", maxWidth: 430, margin: '0 auto', position: 'relative' },
  header: { background: '#3D8BFF', padding: '52px 24px 28px', color: '#fff' },
  headerTitle: { fontSize: 13, fontWeight: 500, opacity: 0.85, marginBottom: 6 },
  headerMain: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  headerSub: { fontSize: 13, opacity: 0.8 },
  body: { padding: '0 20px 40px' },
  sampleLabel: { fontSize: 12, color: '#888', fontWeight: 500, marginTop: 28, marginBottom: 12 },
  sampleCard: { border: '1px solid #f0f0f0', borderRadius: 16, padding: 20, marginBottom: 12, cursor: 'pointer' },
  sampleCardTitle: { fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 },
  sampleCardSub: { fontSize: 13, color: '#888', marginBottom: 14 },
  progressBg: { height: 6, background: '#f0f0f0', borderRadius: 99 },
  progressFill: (pct) => ({ height: 6, background: 'linear-gradient(90deg, #3D8BFF, #69d98c)', borderRadius: 99, width: Math.min(pct,100)+'%' }),
  sampleCardBottom: { display: 'flex', justifyContent: 'space-between', marginTop: 10 },
  sampleCardAmt: { fontSize: 12, color: '#3D8BFF', fontWeight: 600 },
  sampleCardDday: { fontSize: 12, color: '#888' },
  ctaBtn: { display: 'block', width: '100%', background: '#3D8BFF', color: '#fff', border: 'none', borderRadius: 14, padding: '17px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 24, textAlign: 'center' },
  authWrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: '#fff' },
  authLogo: { fontSize: 40, marginBottom: 12 },
  authTitle: { fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 8 },
  authSub: { fontSize: 14, color: '#888', marginBottom: 40, textAlign: 'center' },
  kakaoBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', maxWidth: 320, background: '#FEE500', color: '#111', border: 'none', borderRadius: 14, padding: '16px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  createHeader: { background: '#3D8BFF', padding: '52px 24px 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14 },
  createTitle: { fontSize: 18, fontWeight: 700, color: '#fff' },
  createBody: { padding: '24px 20px 40px' },
  section: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8, display: 'block' },
  labelSub: { fontSize: 11, color: '#aaa', fontWeight: 400, marginLeft: 6 },
  input: { width: '100%', border: '1.5px solid #e8e8e8', borderRadius: 12, padding: '14px 16px', fontSize: 15, color: '#111', outline: 'none', fontFamily: 'inherit' },
  textarea: { width: '100%', border: '1.5px solid #e8e8e8', borderRadius: 12, padding: '14px 16px', fontSize: 15, color: '#111', outline: 'none', fontFamily: 'inherit', resize: 'none', minHeight: 80 },
  kakaoGuide: { background: '#FFFBEA', border: '1px solid #FEE500', borderRadius: 12, padding: 16, marginTop: 10 },
  kakaoGuideTitle: { fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 8 },
  kakaoGuideStep: { fontSize: 12, color: '#555', marginBottom: 4, lineHeight: 1.6 },
  submitBtn: { display: 'block', width: '100%', background: '#3D8BFF', color: '#fff', border: 'none', borderRadius: 14, padding: '17px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  submitBtnOff: { display: 'block', width: '100%', background: '#e0e0e0', color: '#bbb', border: 'none', borderRadius: 14, padding: '17px 0', fontSize: 16, fontWeight: 700, cursor: 'not-allowed', marginTop: 8 },
  fundHeader: { background: '#3D8BFF', padding: '52px 24px 28px', color: '#fff' },
  fundTitle: { fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 },
  fundGift: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  ddayChip: { display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, marginBottom: 12 },
  fundBody: { padding: '24px 20px 40px' },
  amtBox: { background: '#f8f9ff', borderRadius: 16, padding: 20, marginBottom: 20 },
  amtLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  amtValue: { fontSize: 28, fontWeight: 700, color: '#3D8BFF' },
  amtGoal: { fontSize: 13, color: '#aaa', marginTop: 2 },
  fundBtn: { display: 'block', width: '100%', background: '#3D8BFF', color: '#fff', border: 'none', borderRadius: 14, padding: '17px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  donateHeader: { background: '#3D8BFF', padding: '52px 24px 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 },
  donateBody: { padding: '28px 20px 40px' },
  benefitBox: { background: '#f8f9ff', borderRadius: 14, padding: 18, marginBottom: 24, textAlign: 'center' },
  benefitTitle: { fontSize: 15, fontWeight: 700, color: '#3D8BFF', marginBottom: 6 },
  benefitMsg: { fontSize: 14, color: '#444' },
  amtInput: { width: '100%', border: '2px solid #e8e8e8', borderRadius: 14, padding: '16px', fontSize: 22, fontWeight: 700, color: '#111', outline: 'none', fontFamily: 'inherit', textAlign: 'center' },
  amtInputOn: { width: '100%', border: '2px solid #3D8BFF', borderRadius: 14, padding: '16px', fontSize: 22, fontWeight: 700, color: '#111', outline: 'none', fontFamily: 'inherit', textAlign: 'center' },
  doneWrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: '#fff' },
  myHeader: { background: '#3D8BFF', padding: '52px 24px 24px', color: '#fff' },
  myTitle: { fontSize: 18, fontWeight: 700 },
  myBody: { padding: '24px 20px 40px' },
  myCard: { border: '1px solid #f0f0f0', borderRadius: 16, padding: 20, marginBottom: 16 },
  myCardTitle: { fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 },
  myCardLink: { fontSize: 12, color: '#3D8BFF', marginBottom: 14, wordBreak: 'break-all' },
  myCardBtns: { display: 'flex', gap: 8 },
  myCardBtn: { flex: 1, background: '#f5f5f5', border: 'none', borderRadius: 10, padding: '10px 0', fontSize: 13, fontWeight: 600, color: '#333', cursor: 'pointer' },
  myCardBtnBlue: { flex: 1, background: '#3D8BFF', border: 'none', borderRadius: 10, padding: '10px 0', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' },
  newFundBtn: { display: 'block', width: '100%', background: '#3D8BFF', color: '#fff', border: 'none', borderRadius: 14, padding: '17px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  toast: { position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 500, zIndex: 9999, whiteSpace: 'nowrap' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#888' },
}

const SAMPLES = [
  { title: '🎂 지수의 생일 펀딩', gift: '에어팟 프로', goal: 300000, raised: 210000, dday: 7 },
  { title: '🎸 현우의 생일 펀딩', gift: '기타 앰프', goal: 200000, raised: 80000, dday: 14 },
]

function won(n) {
  const num = Number(n)
  if (!num || isNaN(num)) return '0원'
  return num.toLocaleString('ko-KR') + '원'
}

function dday(dateStr) {
  if (!dateStr) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(dateStr); target.setHours(0,0,0,0)
  const diff = Math.ceil((target - today) / 86400000)
  if (diff === 0) return 'D-Day'
  if (diff > 0) return 'D-' + diff
  return 'D+' + Math.abs(diff)
}

export default function App() {
  const [page, setPage] = useState('loading')
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState('')
  const [slug, setSlug] = useState(null)
  const [funding, setFunding] = useState(null)
  const [donations, setDonations] = useState([])
  const [myFundings, setMyFundings] = useState([])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    const path = window.location.pathname.replace('/', '').trim()
    if (path) { setSlug(path); setPage('funding'); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadMy(session.user.id); setPage('my') }
      else setPage('home')
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); loadMy(session.user.id); setPage('my') }
    })
  }, [])

  useEffect(() => { if (page === 'funding' && slug) loadFunding(slug) }, [page, slug])

  async function loadFunding(s) {
    const { data } = await supabase.from('fundings').select('*').eq('slug', s).single()
    if (data) {
      setFunding(data)
      const { data: d } = await supabase.from('donations').select('*').eq('funding_id', data.id).order('created_at', { ascending: false })
      setDonations(d || [])
    }
  }

  async function loadMy(uid) {
    const { data } = await supabase.from('fundings').select('*').eq('user_id', uid).order('created_at', { ascending: false })
    setMyFundings(data || [])
  }

  async function kakaoLogin() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  }

  if (page === 'loading') return <div style={s.loading}>펀딩 접속 중...</div>
  if (page === 'home') return <HomePage onStart={() => setPage('auth')} />
  if (page === 'auth') return <AuthPage onLogin={kakaoLogin} onBack={() => setPage('home')} />
  if (page === 'my') return <MyPage user={user} fundings={myFundings} onNew={() => setPage('create')} onView={(f) => { setFunding(f); setSlug(f.slug); setPage('funding') }} showToast={showToast} onReload={() => loadMy(user.id)} toast={toast} />
  if (page === 'create') return <CreatePage user={user} onBack={() => setPage('my')} onDone={() => { loadMy(user.id); setPage('my') }} showToast={showToast} />
  if (page === 'funding') return <FundingPage funding={funding} donations={donations} onDonate={() => setPage('donate')} onBack={() => user ? setPage('my') : setPage('home')} onReload={() => slug && loadFunding(slug)} toast={toast} />
  if (page === 'donate') return <DonatePage funding={funding} onBack={() => setPage('funding')} onDone={() => { setPage('done'); slug && loadFunding(slug) }} showToast={showToast} />
  if (page === 'done') return <DonePage onBack={() => setPage('funding')} />
  return null
}

function HomePage({ onStart }) {
  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.headerTitle}>🎂 생일펀딩</div>
        <div style={s.headerMain}>생일 선물,<br/>직접 받고 싶은 걸 받아요</div>
        <div style={s.headerSub}>내가 원하는 선물을 펀딩받는 가장 쉬운 방법</div>
      </div>
      <div style={s.body}>
        <div style={s.sampleLabel}>이런 펀딩들이 있어요</div>
        {SAMPLES.map((f, i) => {
          const pct = Math.round((f.raised / f.goal) * 100)
          return (
            <div key={i} style={s.sampleCard}>
              <div style={s.sampleCardTitle}>{f.title}</div>
              <div style={s.sampleCardSub}>{f.gift}</div>
              <div style={s.progressBg}><div style={s.progressFill(pct)} /></div>
              <div style={s.sampleCardBottom}>
                <div style={s.sampleCardAmt}>{won(f.raised)} 모였어요 ({pct}%)</div>
                <div style={s.sampleCardDday}>D-{f.dday}</div>
              </div>
            </div>
          )
        })}
        <button style={s.ctaBtn} onClick={onStart}>나도 만들기</button>
      </div>
    </div>
  )
}

function AuthPage({ onLogin, onBack }) {
  return (
    <div style={s.authWrap}>
      <div style={s.authLogo}>🎂</div>
      <div style={s.authTitle}>생일펀딩</div>
      <div style={s.authSub}>카카오 계정으로 시작하면<br/>바로 내 펀딩 페이지가 생겨요</div>
      <button style={{...s.kakaoBtn, background:'#fff', border:'1.5px solid #e0e0e0', color:'#333'}} onClick={onLogin}><span style={{fontSize:20}}>🔵</span> 구글로 시작하기</button>
      <button onClick={onBack} style={{marginTop:20,background:'none',border:'none',color:'#aaa',fontSize:14,cursor:'pointer'}}>돌아가기</button>
    </div>
  )
}

function CreatePage({ user, onBack, onDone, showToast }) {
  const [form, setForm] = useState({ title:'', gift_name:'', sub_message:'', goal_amount:'', benefit_message:'', kakao_link:'', slug:'', birthday:'' })
  const [loading, setLoading] = useState(false)
  const [guide, setGuide] = useState(false)
  const set = (k,v) => setForm(f => ({...f, [k]:v}))
  const ready = form.title && form.gift_name && form.goal_amount && form.kakao_link && form.slug

  async function submit() {
    if (!ready) return
    setLoading(true)
    const { error } = await supabase.from('fundings').insert({ user_id:user.id, title:form.title, gift_name:form.gift_name, sub_message:form.sub_message, goal_amount:parseInt(form.goal_amount), benefit_message:form.benefit_message, kakao_link:form.kakao_link, slug:form.slug.toLowerCase().replace(/\s/g,''), birthday:form.birthday||null })
    setLoading(false)
    if (error) { showToast('이미 사용 중인 링크예요. 다시 시도해 주세요'); return }
    showToast('펀딩 페이지가 만들어졌어요!')
    onDone()
  }

  return (
    <div style={s.wrap}>
      <div style={s.createHeader}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <div style={s.createTitle}>펀딩 만들기</div>
      </div>
      <div style={s.createBody}>
        <div style={s.section}>
          <label style={s.label}>대제목 <span style={s.labelSub}>예: 🛼 민지의 생일 펀딩</span></label>
          <input style={s.input} placeholder="🎂 나의 생일 펀딩" value={form.title} onChange={e=>set('title',e.target.value)} />
        </div>
        <div style={s.section}>
          <label style={s.label}>선물 이름</label>
          <input style={s.input} placeholder="예: 인라인 스케이트" value={form.gift_name} onChange={e=>set('gift_name',e.target.value)} />
        </div>
        <div style={s.section}>
          <label style={s.label}>한 줄 멘트 <span style={s.labelSub}>선물 이름 아래 표시</span></label>
          <input style={s.input} placeholder="예: 진짜 제발 저요 정말 간절합니다" value={form.sub_message} onChange={e=>set('sub_message',e.target.value)} />
        </div>
        <div style={s.section}>
          <label style={s.label}>목표 금액</label>
          <input style={s.input} type="number" placeholder="예: 300000" value={form.goal_amount} onChange={e=>set('goal_amount',e.target.value)} />
        </div>
        <div style={s.section}>
          <label style={s.label}>생일 날짜</label>
          <input style={s.input} type="date" value={form.birthday} onChange={e=>set('birthday',e.target.value)} />
        </div>
        <div style={s.section}>
          <label style={s.label}>후원 혜택 멘트</label>
          <textarea style={s.textarea} placeholder="예: 후원해 주신다면 성실하고 바르게 자라겠습니다" value={form.benefit_message} onChange={e=>set('benefit_message',e.target.value)} />
        </div>
        <div style={s.section}>
          <label style={s.label}>카카오 송금 링크</label>
          <input style={s.input} placeholder="https://qr.kakaopay.com/..." value={form.kakao_link} onChange={e=>set('kakao_link',e.target.value)} />
          <button onClick={()=>setGuide(!guide)} style={{background:'none',border:'none',color:'#3D8BFF',fontSize:13,cursor:'pointer',fontWeight:600,marginTop:8}}>
            {guide ? '안내 닫기 ▲' : '카카오 링크 복사 방법 ▼'}
          </button>
          {guide && (
            <div style={s.kakaoGuide}>
              <div style={s.kakaoGuideTitle}>📱 카카오 송금 링크 복사하는 법</div>
              <div style={s.kakaoGuideStep}>1. 카카오톡 앱 열기</div>
              <div style={s.kakaoGuideStep}>2. 하단 더보기(•••) 탭 클릭</div>
              <div style={s.kakaoGuideStep}>3. 상단 송금 버튼 클릭</div>
              <div style={s.kakaoGuideStep}>4. 우측 상단 QR/링크 아이콘 클릭</div>
              <div style={s.kakaoGuideStep}>5. 링크 복사 후 위 칸에 붙여넣기</div>
            </div>
          )}
        </div>
        <div style={s.section}>
          <label style={s.label}>내 펀딩 링크 <span style={s.labelSub}>영문/숫자만</span></label>
          <div style={{display:'flex',alignItems:'center',border:'1.5px solid #e8e8e8',borderRadius:12,overflow:'hidden'}}>
            <span style={{padding:'14px 12px',fontSize:13,color:'#aaa',background:'#fafafa',borderRight:'1px solid #e8e8e8',whiteSpace:'nowrap'}}>saengilfunding.com/</span>
            <input style={{flex:1,border:'none',padding:'14px 12px',fontSize:15,color:'#111',outline:'none',fontFamily:'inherit'}} placeholder="minji" value={form.slug} onChange={e=>set('slug',e.target.value)} />
          </div>
        </div>
        <button style={ready&&!loading ? s.submitBtn : s.submitBtnOff} onClick={submit} disabled={!ready||loading}>
          {loading ? '만드는 중...' : '펀딩 페이지 만들기'}
        </button>
      </div>
    </div>
  )
}

function MyPage({ user, fundings, onNew, onView, showToast, onReload, toast }) {
  async function copyLink(slug) {
    await navigator.clipboard.writeText(window.location.origin + '/' + slug)
    showToast('링크가 복사됐어요!')
  }
  async function del(id) {
    if (!window.confirm('정말 삭제할까요?')) return
    await supabase.from('fundings').delete().eq('id', id)
    onReload()
    showToast('삭제됐어요')
  }
  const name = user?.user_metadata?.name || '내'
  return (
    <div style={s.wrap}>
      <div style={s.myHeader}><div style={s.myTitle}>{name}의 펀딩</div></div>
      <div style={s.myBody}>
        {fundings.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 0',color:'#aaa'}}>
            <div style={{fontSize:40,marginBottom:12}}>🎂</div>
            <div style={{fontSize:15}}>아직 펀딩이 없어요</div>
          </div>
        ) : fundings.map(f => (
          <div key={f.id} style={s.myCard}>
            <div style={s.myCardTitle}>{f.title}</div>
            <div style={s.myCardLink}>saengilfunding.com/{f.slug}</div>
            <div style={s.myCardBtns}>
              <button style={s.myCardBtn} onClick={()=>copyLink(f.slug)}>링크 복사</button>
              <button style={s.myCardBtnBlue} onClick={()=>onView(f)}>보기</button>
              <button style={s.myCardBtn} onClick={()=>del(f.id)}>삭제</button>
            </div>
          </div>
        ))}
        <button style={s.newFundBtn} onClick={onNew}>+ 새 펀딩 만들기</button>
      </div>
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  )
}

function FundingPage({ funding, donations, onDonate, onBack, onReload, toast }) {
  const [msgOpen, setMsgOpen] = useState(false)
  useEffect(() => { onReload && onReload() }, [])
  if (!funding) return <div style={s.loading}>펀딩 접속 중...</div>
  const raised = donations.reduce((a,d) => a + (Number(d.amount)||0), 0)
  const pct = funding.goal_amount ? Math.round((raised/funding.goal_amount)*100) : 0
  const dd = dday(funding.birthday)
  const msgs = donations.filter(d => d.message && d.message.trim())
  return (
    <div style={s.wrap}>
      <div style={s.fundHeader}>
        <button style={{background:'none',border:'none',color:'rgba(255,255,255,0.7)',fontSize:14,cursor:'pointer',padding:0,marginBottom:8}} onClick={onBack}>← 돌아가기</button>
        {dd && <div style={s.ddayChip}>{dd}</div>}
        <div style={s.fundTitle}>{funding.title}</div>
        <div style={s.fundGift}>{funding.gift_name}</div>
        {funding.sub_message && <div style={{fontSize:13,color:'rgba(255,255,255,0.75)',marginTop:6}}>{funding.sub_message}</div>}
      </div>
      <div style={s.fundBody}>
        <div style={s.amtBox}>
          <div style={s.amtLabel}>지금까지 모인 금액</div>
          <div style={s.amtValue}>{won(raised)}</div>
          <div style={s.amtGoal}>목표 {won(funding.goal_amount)} · {pct}% 달성</div>
          <div style={{...s.progressBg,marginTop:14}}><div style={s.progressFill(pct)} /></div>
        </div>
        <button style={s.fundBtn} onClick={onDonate}>💛 후원하기</button>
        {msgs.length > 0 && (
          <div style={{marginTop:24}}>
            <button onClick={()=>setMsgOpen(!msgOpen)} style={{background:'none',border:'none',color:'#3D8BFF',fontSize:14,fontWeight:600,cursor:'pointer',padding:0}}>
              🎂 생일 축하 메시지 {msgOpen ? '▲' : '▼'}
            </button>
            {msgOpen && msgs.map((d,i) => (
              <div key={i} style={{background:'#f0f6ff',borderRadius:12,padding:'12px 16px',marginBottom:8,marginTop:12,fontSize:14,color:'#333',lineHeight:1.6}}>{d.message}</div>
            ))}
          </div>
        )}
      </div>
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  )
}

function DonatePage({ funding, onBack, onDone, showToast }) {
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState('input')
  const [loading, setLoading] = useState(false)

  function goKakao() {
    if (!amount || Number(amount) < 1) { showToast('금액을 입력해 주세요'); return }
    window.location.href = funding.kakao_link
    setStep('confirm')
  }

  async function done() {
    if (!name.trim()) { showToast('이름을 입력해 주세요'); return }
    setLoading(true)
    await supabase.from('donations').insert({ funding_id:funding.id, amount:parseInt(amount), message:message.trim(), name:name.trim() })
    setLoading(false)
    onDone()
  }

  return (
    <div style={s.wrap}>
      <div style={s.donateHeader}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <div style={{fontSize:17,fontWeight:700,color:'#fff'}}>후원하기</div>
      </div>
      <div style={s.donateBody}>
        {step === 'input' ? (
          <>
            <div style={s.benefitBox}>
              <div style={s.benefitTitle}>지금 후원하시면 특별한 혜택을 드려요!</div>
              {funding?.benefit_message && <div style={s.benefitMsg}>{funding.benefit_message}</div>}
            </div>
            <div style={s.section}>
              <label style={s.label}>후원 금액</label>
              <input style={amount ? s.amtInputOn : s.amtInput} type="number" placeholder="금액을 입력해 주세요" value={amount} onChange={e=>setAmount(e.target.value)} inputMode="numeric" />
            </div>
            <button style={amount ? s.submitBtn : s.submitBtnOff} onClick={goKakao} disabled={!amount}>💛 카카오톡으로 송금하기</button>
          </>
        ) : (
          <>
            <div style={{...s.benefitBox,background:'#f0fff4',border:'1px solid #69d98c'}}>
              <div style={{fontSize:15,fontWeight:700,color:'#2a8a4a',marginBottom:4}}>후원이 완료되었습니다!</div>
              <div style={{fontSize:13,color:'#555'}}>이름과 한마디를 남겨 주세요 💚</div>
            </div>
            <div style={s.section}>
              <label style={s.label}>이름 또는 닉네임</label>
              <input style={s.input} placeholder="예: 민지 친구 수진" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div style={s.section}>
              <label style={s.label}>생일 축하 한마디 <span style={s.labelSub}>선택</span></label>
              <textarea style={s.textarea} placeholder="생일 축하해! 🎂" value={message} onChange={e=>setMessage(e.target.value)} />
            </div>
            <button style={name ? s.submitBtn : s.submitBtnOff} onClick={done} disabled={!name||loading}>
              {loading ? '저장 중...' : '후원 완료'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function DonePage({ onBack }) {
  return (
    <div style={s.doneWrap}>
      <div style={{fontSize:56,marginBottom:16}}>🎉</div>
      <div style={{fontSize:22,fontWeight:700,color:'#111',marginBottom:8,textAlign:'center'}}>이 은혜 잊지 않겠습니다</div>
      <div style={{fontSize:14,color:'#888',marginBottom:32,textAlign:'center'}}>후원해 주셔서 진심으로 감사해요</div>
      <button style={{background:'#3D8BFF',color:'#fff',border:'none',borderRadius:14,padding:'14px 32px',fontSize:15,fontWeight:700,cursor:'pointer'}} onClick={onBack}>펀딩 페이지로 돌아가기</button>
    </div>
  )
}
