import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase.js'

const COLORS = [
  { name: '오렌지', main: '#FF9F5A' },
  { name: '옐로우', main: '#FFD95A' },
  { name: '블루', main: '#69B7FF' },
  { name: '스카이', main: '#8EDBFF' },
  { name: '그린', main: '#72D572' },
  { name: '브라운', main: '#C58A5C' },
  { name: '핑크', main: '#FFABC8' },
  { name: '퍼플', main: '#B58CFF' },
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

const DRAFT_KEY = 'saengil_draft'

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

  async function googleLogin() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  }

  if (page === 'loading') return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:'#888',fontFamily:'Pretendard,sans-serif'}}>펀딩 접속 중...</div>
  if (page === 'home') return <HomePage onStart={() => setPage('auth')} />
  if (page === 'auth') return <AuthPage onLogin={googleLogin} onBack={() => setPage('home')} />
  if (page === 'my') return <MyPage user={user} fundings={myFundings} onNew={() => setPage('create')} onView={(f) => { setFunding(f); setSlug(f.slug); setPage('funding') }} showToast={showToast} onReload={() => loadMy(user.id)} toast={toast} />
  if (page === 'create') return <CreatePage user={user} onBack={() => setPage('my')} onDone={() => { loadMy(user.id); setPage('my') }} showToast={showToast} />
  if (page === 'funding') return <FundingPage funding={funding} donations={donations} onDonate={() => setPage('donate')} onBack={() => user ? setPage('my') : setPage('home')} onReload={() => slug && loadFunding(slug)} toast={toast} />
  if (page === 'donate') return <DonatePage funding={funding} onBack={() => setPage('funding')} onDone={() => { setPage('done'); slug && loadFunding(slug) }} showToast={showToast} />
  if (page === 'done') return <DonePage onBack={() => setPage('funding')} />
  return null
}

const SAMPLES = [
  { title: '🎂 지수의 생일 펀딩', gift: '에어팟 프로', goal: 300000, raised: 210000, dday: 7, color: '#3D8BFF' },
  { title: '🎸 현우의 생일 펀딩', gift: '기타 앰프', goal: 200000, raised: 80000, dday: 14, color: '#FF6B9D' },
]

function HomePage({ onStart }) {
  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'Pretendard,sans-serif',maxWidth:430,margin:'0 auto',overflowX:'hidden'}}>
      <div style={{background:'#3D8BFF',padding:'52px 24px 28px',color:'#fff'}}>
        <div style={{fontSize:13,fontWeight:500,opacity:0.85,marginBottom:6}}>🎂 생일펀딩</div>
        <div style={{fontSize:26,fontWeight:700,marginBottom:4}}>생일 선물,<br/>직접 받고 싶은 걸 받아요</div>
        <div style={{fontSize:13,opacity:0.8}}>내가 원하는 선물을 펀딩받는 가장 쉬운 방법</div>
      </div>
      <div style={{padding:'0 20px 40px'}}>
        <div style={{fontSize:12,color:'#888',fontWeight:500,marginTop:28,marginBottom:12}}>이런 펀딩들이 있어요</div>
        {SAMPLES.map((f, i) => {
          const pct = Math.round((f.raised / f.goal) * 100)
          return (
            <div key={i} style={{border:'1px solid #f0f0f0',borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:4}}>{f.title}</div>
              <div style={{fontSize:13,color:'#888',marginBottom:14}}>{f.gift}</div>
              <div style={{height:6,background:'#f0f0f0',borderRadius:99}}>
                <div style={{height:6,background:f.color,borderRadius:99,width:pct+'%'}} />
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:10}}>
                <div style={{fontSize:12,color:f.color,fontWeight:600}}>{won(f.raised)} 모였어요 ({pct}%)</div>
                <div style={{fontSize:12,color:'#888'}}>D-{f.dday}</div>
              </div>
            </div>
          )
        })}
        <button style={{display:'block',width:'100%',background:'#3D8BFF',color:'#fff',border:'none',borderRadius:14,padding:'17px 0',fontSize:16,fontWeight:700,cursor:'pointer',marginTop:24}} onClick={onStart}>나도 만들기</button>
      </div>
    </div>
  )
}

function AuthPage({ onLogin, onBack }) {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,background:'#fff',fontFamily:'Pretendard,sans-serif'}}>
      <div style={{fontSize:40,marginBottom:12}}>🎂</div>
      <div style={{fontSize:24,fontWeight:700,color:'#111',marginBottom:8}}>생일펀딩</div>
      <div style={{fontSize:14,color:'#888',marginBottom:40,textAlign:'center'}}>구글 계정으로 시작하면<br/>바로 내 펀딩 페이지가 생겨요</div>
      <button style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,width:'100%',maxWidth:320,background:'#fff',border:'1.5px solid #e0e0e0',color:'#333',borderRadius:14,padding:'16px 0',fontSize:16,fontWeight:700,cursor:'pointer'}} onClick={onLogin}>
        <span style={{fontSize:18}}>G</span> 구글로 시작하기
      </button>
      <button onClick={onBack} style={{marginTop:20,background:'none',border:'none',color:'#aaa',fontSize:14,cursor:'pointer'}}>돌아가기</button>
    </div>
  )
}

// 인라인 편집 가능한 텍스트 컴포넌트
function EditableText({ value, onChange, style, placeholder, multiline }) {
  const [editing, setEditing] = useState(false)
  const ref = useRef()

  useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

  if (editing) {
    const commonStyle = { ...style, background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.6)', borderRadius: 8, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', padding: '4px 8px' }
    return multiline
      ? <textarea ref={ref} style={{...commonStyle, resize:'none', minHeight:60}} value={value} onChange={e => onChange(e.target.value)} onBlur={() => setEditing(false)} />
      : <input ref={ref} style={commonStyle} value={value} onChange={e => onChange(e.target.value)} onBlur={() => setEditing(false)} />
  }

  return (
    <div onClick={() => setEditing(true)} style={{...style, cursor:'pointer', borderBottom:'2px dashed rgba(255,255,255,0.5)', paddingBottom:2, minWidth:60}}>
      {value || <span style={{opacity:0.5}}>{placeholder}</span>}
      <span style={{fontSize:10, opacity:0.7, marginLeft:6}}>✏️</span>
    </div>
  )
}

function CreatePage({ user, onBack, onDone, showToast }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {} } catch { return {} } })()
  const [form, setForm] = useState({
    title: '', gift_name: '', sub_message: '', goal_amount: '', benefit_message: '',
    kakao_link: '', slug: '', birthday: '', color: '#FF9F5A', image: '', ...saved
  })
  const [step, setStep] = useState('preview') // preview | settings
  const [loading, setLoading] = useState(false)
  const [guide, setGuide] = useState(false)
  const [slugStatus, setSlugStatus] = useState('') // '' | 'checking' | 'ok' | 'error'

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
    return next
  })

  const color = form.color || '#3D8BFF'
  const colorObj = COLORS.find(c => c.main === color) || COLORS[0]

  async function checkSlug() {
    if (!form.slug) return
    const slug = form.slug.toLowerCase()
    setSlugStatus('checking')
    const { data } = await supabase.from('fundings').select('id').eq('slug', slug).single()
    setSlugStatus(data ? 'error' : 'ok')
  }

  const ready = form.title && form.gift_name && form.goal_amount && form.kakao_link && form.slug && slugStatus === 'ok'

  async function submit() {
    if (!ready) return
    setLoading(true)
    const { error } = await supabase.from('fundings').insert({
      user_id: user.id, title: form.title, gift_name: form.gift_name,
      sub_message: form.sub_message, goal_amount: parseInt(form.goal_amount),
      benefit_message: form.benefit_message, kakao_link: form.kakao_link,
      slug: form.slug.toLowerCase(), birthday: form.birthday || null,
      color: form.color, image: form.image || null
    })
    setLoading(false)
    if (error) { showToast('오류가 발생했어요. 다시 시도해 주세요'); return }
    showToast('펀딩 페이지가 만들어졌어요!')
    localStorage.removeItem(DRAFT_KEY)
    onDone()
  }

  return (
    <div style={{minHeight:'100vh',background:'#f5f5f5',fontFamily:'Pretendard,sans-serif',maxWidth:430,margin:'0 auto',overflowX:'hidden'}}>
      {/* 상단 탭 */}
      <div style={{background:color,padding:'52px 20px 0',display:'flex',gap:0}}>
        <button onClick={() => setStep('preview')} style={{flex:1,background:step==='preview'?'#fff':'transparent',color:step==='preview'?color:'rgba(255,255,255,0.8)',border:'none',borderRadius:'12px 12px 0 0',padding:'10px 0',fontSize:14,fontWeight:700,cursor:'pointer'}}>미리보기 편집</button>
        <button onClick={() => setStep('settings')} style={{flex:1,background:step==='settings'?'#fff':'transparent',color:step==='settings'?color:'rgba(255,255,255,0.8)',border:'none',borderRadius:'12px 12px 0 0',padding:'10px 0',fontSize:14,fontWeight:700,cursor:'pointer'}}>링크 설정</button>
      </div>

      {step === 'preview' ? (
        <div style={{paddingBottom:100}}>
          {/* 헤더 */}
          <div style={{background:color,padding:'16px 20px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <button onClick={onBack} style={{background:'none',border:'none',color:'#fff',fontSize:14,cursor:'pointer',padding:0,fontWeight:600}}>← 돌아가기</button>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.8)'}}>✏️ 텍스트를 눌러 수정해요</div>
          </div>

          {/* 이미지 */}
          {form.image ? (
            <div style={{position:'relative'}}>
              <img src={form.image} style={{width:'100%',maxHeight:280,objectFit:'cover',display:'block'}} />
              <button onClick={() => set('image', '')} style={{position:'absolute',top:10,right:10,background:'rgba(0,0,0,0.5)',border:'none',color:'#fff',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:16}}>×</button>
            </div>
          ) : (
            <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:200,cursor:'pointer',background:'#f0f0f0',gap:8}}>
              <span style={{fontSize:36}}>📷</span>
              <span style={{fontSize:13,color:'#888',fontWeight:600}}>선물 사진 추가하기</span>
              <input type="file" accept="image/*" style={{display:'none'}} onChange={e => {
                const file = e.target.files[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = ev => set('image', ev.target.result)
                reader.readAsDataURL(file)
              }} />
            </label>
          )}

          {/* 선물 정보 */}
          <div style={{padding:'20px 20px 0'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
              <EditableText value={form.gift_name} onChange={v => set('gift_name', v)} placeholder="선물 이름 🎁" style={{fontSize:20,fontWeight:700,color:'#111'}} />
              {form.birthday && <div style={{background:color,color:'#fff',borderRadius:20,padding:'4px 14px',fontSize:13,fontWeight:700,whiteSpace:'nowrap',marginLeft:8}}>{dday(form.birthday)||'D-?'}</div>}
            </div>
            <EditableText value={form.sub_message} onChange={v => set('sub_message', v)} placeholder="한 줄 멘트를 입력해요" style={{fontSize:14,color:'#666',marginBottom:16,display:'block'}} multiline />

            {/* 제목 */}
            <div style={{marginBottom:12}}>
              <EditableText value={form.title} onChange={v => set('title', v)} placeholder="🎂 나의 생일 펀딩 (대제목)" style={{fontSize:13,color:'#aaa',display:'block'}} />
            </div>

            {/* 금액 */}
            <div style={{marginBottom:4}}>
              <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
                <div style={{fontSize:36,fontWeight:700,color:'#111'}}>0원</div>
                <div style={{fontSize:14,color:'#888',marginBottom:6}}>목표 <EditableText value={form.goal_amount} onChange={v => set('goal_amount', v.replace(/[^0-9]/g,''))} placeholder="목표금액 입력" style={{fontSize:14,color:color,fontWeight:700,display:'inline'}} /></div>
              </div>
              <div style={{height:6,background:'#f0f0f0',borderRadius:99,marginTop:8,marginBottom:8}}>
                <div style={{height:6,background:color,borderRadius:99,width:'0%'}} />
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div style={{fontSize:13,color:color,fontWeight:600}}>0% 달성</div>
                <div style={{fontSize:13,color:'#888'}}>참여자 <span style={{fontWeight:700,color:'#111'}}>0명</span></div>
              </div>
            </div>

            <div style={{display:'flex',gap:12,marginTop:16,marginBottom:20}}>
              <div style={{flex:1,border:'1px solid #f0f0f0',borderRadius:14,padding:'14px 16px'}}>
                <div style={{fontSize:12,color:'#aaa',marginBottom:6}}>남은 금액</div>
                <div style={{fontSize:16,fontWeight:700,color:'#111'}}>{form.goal_amount ? won(form.goal_amount) : '—'}</div>
              </div>
              <div style={{flex:1,border:'1px solid #f0f0f0',borderRadius:14,padding:'14px 16px'}}>
                <div style={{fontSize:12,color:'#aaa',marginBottom:6}}>평균 참여금액</div>
                <div style={{fontSize:16,fontWeight:700,color:'#111'}}>—</div>
              </div>
            </div>

            {/* 혜택 멘트 */}
            <div style={{background:'#f8f8f8',borderRadius:14,padding:'14px 16px',marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:color,marginBottom:4}}>지금 후원하시면 특별한 혜택을 드려요!</div>
              <EditableText value={form.benefit_message} onChange={v => set('benefit_message', v)} placeholder="후원 혜택 멘트를 입력해요" style={{fontSize:13,color:'#555',display:'block'}} multiline />
            </div>

            {/* 컬러 선택 */}
            <div style={{background:'#f8f8f8',borderRadius:14,padding:'14px 16px',marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12}}>메인 컬러 선택</div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {COLORS.map(c => (
                  <button key={c.main} onClick={() => set('color', c.main)} style={{width:40,height:40,borderRadius:'50%',background:c.main,border:form.color===c.main?'3px solid #333':'3px solid transparent',cursor:'pointer',transform:form.color===c.main?'scale(1.2)':'scale(1)',transition:'transform 0.15s'}} title={c.name} />
                ))}
              </div>
            </div>
          </div>

          {/* 하단 고정 버튼 */}
          <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,padding:'12px 20px 24px',background:'#fff',borderTop:'1px solid #f0f0f0'}}>
            <button style={{display:'block',width:'100%',background:color,color:'#fff',border:'none',borderRadius:14,padding:'17px 0',fontSize:16,fontWeight:700,cursor:'pointer'}} onClick={() => setStep('settings')}>
              다음 → 링크 설정
            </button>
          </div>
        </div>
      ) : (
        <div style={{padding:'24px 20px 40px'}}>
          <div style={{marginBottom:24}}>
            <label style={{fontSize:13,fontWeight:600,color:'#333',marginBottom:8,display:'block'}}>생일 날짜</label>
            <input style={{width:'100%',border:'1.5px solid #e8e8e8',borderRadius:12,padding:'14px 16px',fontSize:15,color:'#111',outline:'none',fontFamily:'inherit',boxSizing:'border-box'}} type="date" value={form.birthday} onChange={e => set('birthday', e.target.value)} />
          </div>

          <div style={{marginBottom:24}}>
            <label style={{fontSize:13,fontWeight:600,color:'#333',marginBottom:8,display:'block'}}>카카오 송금 링크</label>
            <input style={{width:'100%',border:'1.5px solid #e8e8e8',borderRadius:12,padding:'14px 16px',fontSize:15,color:'#111',outline:'none',fontFamily:'inherit',boxSizing:'border-box'}} placeholder="https://qr.kakaopay.com/..." value={form.kakao_link} onChange={e => set('kakao_link', e.target.value)} />
            <button onClick={() => setGuide(!guide)} style={{background:'none',border:'none',color:color,fontSize:13,cursor:'pointer',fontWeight:600,marginTop:8,padding:0}}>
              {guide ? '안내 닫기 ▲' : '카카오 링크 복사 방법 ▼'}
            </button>
            {guide && (
              <div style={{background:'#FFFBEA',border:'1px solid #FEE500',borderRadius:12,padding:16,marginTop:10}}>
                <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:8}}>📱 카카오 송금 링크 복사하는 법</div>
                {['1. 카카오톡 앱 열기','2. 하단 더보기(•••) 탭 클릭','3. 상단 송금 버튼 클릭','4. 우측 상단 QR/링크 아이콘 클릭','5. 링크 복사 후 위 칸에 붙여넣기'].map((t,i) => (
                  <div key={i} style={{fontSize:12,color:'#555',marginBottom:4,lineHeight:1.6}}>{t}</div>
                ))}
              </div>
            )}
          </div>

          <div style={{marginBottom:24}}>
            <label style={{fontSize:13,fontWeight:600,color:'#333',marginBottom:8,display:'block'}}>내 펀딩 링크 <span style={{fontSize:11,color:'#aaa',fontWeight:400}}>영문/숫자만</span></label>
            <div style={{display:'flex',gap:8}}>
              <div style={{flex:1,display:'flex',alignItems:'center',border:'1.5px solid ' + (slugStatus==='error'?'#e74c3c':slugStatus==='ok'?'#2ecc71':'#e8e8e8'),borderRadius:12,overflow:'hidden'}}>
                <span style={{padding:'14px 10px',fontSize:12,color:'#aaa',background:'#fafafa',borderRight:'1px solid #e8e8e8',whiteSpace:'nowrap'}}>saengilfunding.com/</span>
                <input
                  style={{flex:1,border:'none',padding:'14px 10px',fontSize:15,color:slugStatus==='error'?'#e74c3c':'#111',outline:'none',fontFamily:'inherit'}}
                  placeholder="minji"
                  value={form.slug}
                  onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                    set('slug', val)
                    setSlugStatus('')
                  }}
                />
              </div>
              <button onClick={checkSlug} style={{background:color,color:'#fff',border:'none',borderRadius:12,padding:'0 16px',fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
                {slugStatus==='checking'?'확인중...':'중복확인'}
              </button>
            </div>
            {slugStatus==='ok' && <div style={{fontSize:12,color:'#2ecc71',marginTop:6}}>✓ 사용 가능한 링크예요!</div>}
            {slugStatus==='error' && <div style={{fontSize:12,color:'#e74c3c',marginTop:6}}>✗ 이미 사용 중인 링크예요</div>}
            {form.slug && !/^[a-zA-Z0-9]+$/.test(form.slug) && <div style={{fontSize:12,color:'#e74c3c',marginTop:6}}>영문과 숫자만 입력 가능해요</div>}
          </div>

          <button style={{display:'block',width:'100%',background:ready&&!loading?color:'#e0e0e0',color:ready&&!loading?'#fff':'#bbb',border:'none',borderRadius:14,padding:'17px 0',fontSize:16,fontWeight:700,cursor:ready&&!loading?'pointer':'not-allowed'}} onClick={submit} disabled={!ready||loading}>
            {loading ? '만드는 중...' : '펀딩 페이지 만들기'}
          </button>
        </div>
      )}
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
  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || '내'
  const color = '#3D8BFF'
  return (
    <div style={{minHeight:'100vh',background:'#f5f5f5',fontFamily:'Pretendard,sans-serif',maxWidth:430,margin:'0 auto',overflowX:'hidden'}}>
      <div style={{background:color,padding:'52px 24px 24px',color:'#fff'}}>
        <div style={{fontSize:18,fontWeight:700}}>{name}의 펀딩</div>
      </div>
      <div style={{padding:'24px 20px 40px'}}>
        {fundings.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 0',color:'#aaa'}}>
            <div style={{fontSize:40,marginBottom:12}}>🎂</div>
            <div style={{fontSize:15}}>아직 펀딩이 없어요</div>
          </div>
        ) : fundings.map(f => {
          const fc = f.color || color
          return (
            <div key={f.id} style={{background:'#fff',borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:fc}} />
                <div style={{fontSize:16,fontWeight:700,color:'#111'}}>{f.title}</div>
              </div>
              <div style={{fontSize:12,color:fc,marginBottom:14,wordBreak:'break-all'}}>saengilfunding.com/{f.slug}</div>
              <div style={{display:'flex',gap:8}}>
                <button style={{flex:1,background:'#f5f5f5',border:'none',borderRadius:10,padding:'10px 0',fontSize:13,fontWeight:600,color:'#333',cursor:'pointer'}} onClick={() => copyLink(f.slug)}>링크 복사</button>
                <button style={{flex:1,background:fc,border:'none',borderRadius:10,padding:'10px 0',fontSize:13,fontWeight:600,color:'#fff',cursor:'pointer'}} onClick={() => onView(f)}>보기</button>
                <button style={{flex:1,background:'#f5f5f5',border:'none',borderRadius:10,padding:'10px 0',fontSize:13,fontWeight:600,color:'#333',cursor:'pointer'}} onClick={() => del(f.id)}>삭제</button>
              </div>
            </div>
          )
        })}
        <button style={{display:'block',width:'100%',background:color,color:'#fff',border:'none',borderRadius:14,padding:'17px 0',fontSize:16,fontWeight:700,cursor:'pointer',marginTop:8}} onClick={onNew}>+ 새 펀딩 만들기</button>
      </div>
      {toast && <div style={{position:'fixed',bottom:32,left:'50%',transform:'translateX(-50%)',background:'#222',color:'#fff',borderRadius:10,padding:'12px 20px',fontSize:14,fontWeight:500,zIndex:9999,whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )
}

function FundingPage({ funding, donations, onDonate, onBack, onReload, toast }) {
  const [msgOpen, setMsgOpen] = useState(false)
  useEffect(() => { onReload && onReload() }, [])
  if (!funding) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:'#888',fontFamily:'Pretendard,sans-serif'}}>펀딩 접속 중...</div>

  const color = funding.color || '#69B7FF'
  const raised = donations.reduce((a, d) => a + (Number(d.amount) || 0), 0)
  const pct = funding.goal_amount ? Math.round((raised / funding.goal_amount) * 100) : 0
  const dd = dday(funding.birthday)
  const msgs = donations.filter(d => d.message && d.message.trim())
  const avg = donations.length > 0 ? Math.round(raised / donations.length) : 0

  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'Pretendard,sans-serif',maxWidth:430,margin:'0 auto',overflowX:'hidden',paddingBottom:100}}>
      {/* 상단 헤더 */}
      <div style={{background:color,padding:'52px 20px 16px'}} />

      {/* 이미지 */}
      {funding.image && (
        <div style={{width:'100%',background:'#f8f8f8'}}>
          <img src={funding.image} style={{width:'100%',maxHeight:280,objectFit:'cover',display:'block'}} />
        </div>
      )}
      {!funding.image && (
        <div style={{width:'100%',height:200,background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:48}}>🎁</span>
        </div>
      )}

      {/* 선물 정보 */}
      <div style={{padding:'20px 20px 0'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
          <div style={{fontSize:20,fontWeight:700,color:'#111'}}>{funding.gift_name} 🎁</div>
          {dd && <div style={{background:color,color:'#fff',borderRadius:20,padding:'4px 14px',fontSize:13,fontWeight:700}}>{dd}</div>}
        </div>
        {funding.sub_message && <div style={{fontSize:14,color:'#666',marginBottom:16}}>{funding.sub_message}</div>}

        {/* 금액 */}
        <div style={{marginBottom:4}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
            <div style={{fontSize:36,fontWeight:700,color:'#111'}}>{won(raised)}</div>
            <div style={{fontSize:14,color:'#888',marginBottom:6}}>목표 {won(funding.goal_amount)}</div>
          </div>
          <div style={{height:6,background:'#f0f0f0',borderRadius:99,marginTop:8,marginBottom:8}}>
            <div style={{height:6,background:color,borderRadius:99,width:Math.min(pct,100)+'%',transition:'width 0.5s'}} />
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div style={{fontSize:13,color:color,fontWeight:600}}>{pct}% 달성</div>
            <div style={{fontSize:13,color:'#888'}}>참여자 <span style={{fontWeight:700,color:'#111'}}>{donations.length}명</span></div>
          </div>
        </div>

        {/* 남은금액 / 평균 박스 */}
        <div style={{display:'flex',gap:12,marginTop:16,marginBottom:20}}>
          <div style={{flex:1,border:'1px solid #f0f0f0',borderRadius:14,padding:'14px 16px'}}>
            <div style={{fontSize:12,color:'#aaa',marginBottom:6}}>남은 금액</div>
            <div style={{fontSize:16,fontWeight:700,color:'#111'}}>{won(Math.max(0,(funding.goal_amount||0)-raised))}</div>
          </div>
          <div style={{flex:1,border:'1px solid #f0f0f0',borderRadius:14,padding:'14px 16px'}}>
            <div style={{fontSize:12,color:'#aaa',marginBottom:6}}>평균 참여금액</div>
            <div style={{fontSize:16,fontWeight:700,color:'#111'}}>{avg > 0 ? won(avg) : '—'}</div>
          </div>
        </div>

        {/* 혜택 */}
        {funding.benefit_message && (
          <div style={{background:'#f8f8f8',borderRadius:14,padding:'14px 16px',marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:color,marginBottom:4}}>지금 후원하시면 특별한 혜택을 드려요!</div>
            <div style={{fontSize:13,color:'#555'}}>{funding.benefit_message}</div>
          </div>
        )}

        {/* 메시지 */}
        {msgs.length > 0 && (
          <div style={{marginBottom:16}}>
            <button onClick={() => setMsgOpen(!msgOpen)} style={{background:'none',border:'none',color:color,fontSize:14,fontWeight:600,cursor:'pointer',padding:0}}>
              🎂 생일 축하 메시지 {msgOpen ? '▲' : '▼'}
            </button>
            {msgOpen && msgs.map((d, i) => (
              <div key={i} style={{background:'#f8f8f8',borderRadius:12,padding:'12px 16px',marginTop:8,fontSize:14,color:'#333',lineHeight:1.6}}>{d.message}</div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,padding:'12px 20px 24px',background:'#fff',borderTop:'1px solid #f0f0f0'}}>
        <button style={{display:'block',width:'100%',background:color,color:'#fff',border:'none',borderRadius:14,padding:'17px 0',fontSize:16,fontWeight:700,cursor:'pointer'}} onClick={onDonate}>후원하기 🎉</button>
      </div>

      {toast && <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',background:'#222',color:'#fff',borderRadius:10,padding:'12px 20px',fontSize:14,fontWeight:500,zIndex:9999,whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )
}

function DonatePage({ funding, onBack, onDone, showToast }) {
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState('input')
  const [loading, setLoading] = useState(false)
  const color = funding?.color || '#3D8BFF'

  function goKakao() {
    if (!amount || Number(amount) < 1) { showToast('금액을 입력해 주세요'); return }
    window.location.href = funding.kakao_link
    setStep('confirm')
  }

  async function done() {
    if (!name.trim()) { showToast('이름을 입력해 주세요'); return }
    setLoading(true)
    await supabase.from('donations').insert({ funding_id: funding.id, amount: parseInt(amount), message: message.trim(), name: name.trim() })
    setLoading(false)
    onDone()
  }

  return (
    <div style={{minHeight:'100vh',background:'#f5f5f5',fontFamily:'Pretendard,sans-serif',maxWidth:430,margin:'0 auto',overflowX:'hidden'}}>
      <div style={{background:color,padding:'52px 24px 24px',color:'#fff',display:'flex',alignItems:'center',gap:12}}>
        <button style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:14}} onClick={onBack}>←</button>
        <div style={{fontSize:17,fontWeight:700,color:'#fff'}}>후원하기</div>
      </div>
      <div style={{padding:'28px 20px 40px'}}>
        {step === 'input' ? (
          <>
            <div style={{background:'#fff',borderRadius:14,padding:18,marginBottom:24,textAlign:'center'}}>
              <div style={{fontSize:15,fontWeight:700,color:color,marginBottom:6}}>지금 후원하시면 특별한 혜택을 드려요!</div>
              {funding?.benefit_message && <div style={{fontSize:14,color:'#444'}}>{funding.benefit_message}</div>}
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:13,fontWeight:600,color:'#333',marginBottom:8,display:'block'}}>후원 금액</label>
              <input style={{width:'100%',border:'2px solid '+(amount?color:'#e8e8e8'),borderRadius:14,padding:'16px',fontSize:22,fontWeight:700,color:'#111',outline:'none',fontFamily:'inherit',textAlign:'center',boxSizing:'border-box'}} type="number" placeholder="금액을 입력해 주세요" value={amount} onChange={e => setAmount(e.target.value)} inputMode="numeric" />
            </div>
            <button style={{display:'block',width:'100%',background:amount?color:'#e0e0e0',color:amount?'#fff':'#bbb',border:'none',borderRadius:14,padding:'17px 0',fontSize:16,fontWeight:700,cursor:amount?'pointer':'not-allowed'}} onClick={goKakao} disabled={!amount}>💛 카카오톡으로 송금하기</button>
          </>
        ) : (
          <>
            <div style={{background:'#f0fff4',border:'1px solid #69d98c',borderRadius:14,padding:18,marginBottom:24,textAlign:'center'}}>
              <div style={{fontSize:15,fontWeight:700,color:'#2a8a4a',marginBottom:4}}>후원이 완료되었습니다!</div>
              <div style={{fontSize:13,color:'#555'}}>이름과 한마디를 남겨 주세요 💚</div>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:13,fontWeight:600,color:'#333',marginBottom:8,display:'block'}}>이름 또는 닉네임</label>
              <input style={{width:'100%',border:'1.5px solid #e8e8e8',borderRadius:12,padding:'14px 16px',fontSize:15,color:'#111',outline:'none',fontFamily:'inherit',boxSizing:'border-box'}} placeholder="예: 민지 친구 수진" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:13,fontWeight:600,color:'#333',marginBottom:8,display:'block'}}>생일 축하 한마디 <span style={{fontSize:11,color:'#aaa'}}>선택</span></label>
              <textarea style={{width:'100%',border:'1.5px solid #e8e8e8',borderRadius:12,padding:'14px 16px',fontSize:15,color:'#111',outline:'none',fontFamily:'inherit',resize:'none',minHeight:80,boxSizing:'border-box'}} placeholder="생일 축하해! 🎂" value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <button style={{display:'block',width:'100%',background:name?color:'#e0e0e0',color:name?'#fff':'#bbb',border:'none',borderRadius:14,padding:'17px 0',fontSize:16,fontWeight:700,cursor:name?'pointer':'not-allowed'}} onClick={done} disabled={!name||loading}>
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
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,background:'#fff',fontFamily:'Pretendard,sans-serif'}}>
      <div style={{fontSize:56,marginBottom:16}}>🎉</div>
      <div style={{fontSize:22,fontWeight:700,color:'#111',marginBottom:8,textAlign:'center'}}>이 은혜 잊지 않겠습니다</div>
      <div style={{fontSize:14,color:'#888',marginBottom:32,textAlign:'center'}}>후원해 주셔서 진심으로 감사해요</div>
      <button style={{background:'#3D8BFF',color:'#fff',border:'none',borderRadius:14,padding:'14px 32px',fontSize:15,fontWeight:700,cursor:'pointer'}} onClick={onBack}>펀딩 페이지로 돌아가기</button>
    </div>
  )
}
