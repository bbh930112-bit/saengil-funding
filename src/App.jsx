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

const SAMPLES = [
  { title: '🎧 출근길 허전함을 채우는 후원', gift: '에어팟 프로', goal: 300000, raised: 210000, dday: 7, color: '#69B7FF' },
  { title: '👗 입을 옷이 없어 비키니 입고 다님', gift: '여름 옷', goal: 200000, raised: 80000, dday: 14, color: '#FFABC8' },
]

const DRAFT_KEY = 'saengil_draft'
const PAGE_KEY = 'saengil_page'

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

const wrap = { minHeight:'100vh', background:'#fff', fontFamily:"'Pretendard',sans-serif", maxWidth:430, margin:'0 auto', overflowX:'hidden' }

export default function App() {
  const [page, setPage] = useState('loading')
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState('')
  const [slug, setSlug] = useState(null)
  const [funding, setFunding] = useState(null)
  const [donations, setDonations] = useState([])
  const [myFundings, setMyFundings] = useState([])
  const [editFunding, setEditFunding] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const goPage = (p) => {
    setPage(p)
    try { localStorage.setItem(PAGE_KEY, p) } catch(e) {}
  }

  useEffect(() => {
    const path = window.location.pathname.replace('/', '').trim()
    if (path) { setSlug(path); setPage('funding'); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadMy(session.user.id)
        const savedPage = localStorage.getItem(PAGE_KEY)
        const validPages = ['my', 'create']
        setPage(savedPage && validPages.includes(savedPage) ? savedPage : 'my')
      } else {
        setPage('home')
      }
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); loadMy(session.user.id) }
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
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://saengilfunding.com' } })
  }

  if (page === 'loading') return <div style={{...wrap, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, color:'#888'}}>펀딩 접속 중...</div>
  if (page === 'home') return <HomePage onStart={() => goPage('auth')} />
  if (page === 'auth') return <AuthPage onLogin={googleLogin} onBack={() => goPage('home')} />
  if (page === 'my') return <MyPage user={user} fundings={myFundings} onNew={() => { setEditFunding(null); try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(DRAFT_KEY + '_tab') } catch(e) {} goPage('create') }} onView={(f) => { setFunding(f); setSlug(f.slug); goPage('funding') }} onEdit={(f) => { setEditFunding(f); goPage('create') }} showToast={showToast} onReload={() => loadMy(user.id)} toast={toast} />
  if (page === 'create') return <CreatePage user={user} editFunding={editFunding} onBack={() => goPage('my')} onDone={() => { loadMy(user.id); goPage('my') }} onSaveDone={() => { loadMy(user.id); goPage('my') }} showToast={showToast} />
  if (page === 'funding') return <FundingPage funding={funding} donations={donations} onDonate={() => goPage('donate')} onReload={() => slug && loadFunding(slug)} toast={toast} user={user} onHome={() => goPage('my')} />
  if (page === 'donate') return <DonatePage funding={funding} onBack={() => goPage('funding')} onDone={() => { goPage('done'); slug && loadFunding(slug) }} showToast={showToast} />
  if (page === 'done') return <DonePage onBack={() => goPage('funding')} />
  return null
}

function HomePage({ onStart }) {
  return (
    <div style={wrap}>
      <div style={{background:'#69B7FF', padding:'52px 24px 28px', color:'#fff'}}>
        <div style={{fontSize:13, fontWeight:500, opacity:0.85, marginBottom:6}}>🎂 생일펀딩</div>
        <div style={{fontSize:26, fontWeight:700, marginBottom:4}}>생일 선물,<br/>큰 거 하나 받고 싶다</div>
        <div style={{fontSize:13, opacity:0.8}}>자잘한 선물은 이제 그만 능동적으로 비싼 선물을 얻어내자</div>
      </div>
      <div style={{padding:'0 20px 40px'}}>
        <div style={{fontSize:12, color:'#888', fontWeight:500, marginTop:28, marginBottom:12}}>이런 펀딩들이 있어요</div>
        {SAMPLES.map((f, i) => {
          const pct = Math.round((f.raised / f.goal) * 100)
          return (
            <div key={i} style={{border:'1px solid #f0f0f0', borderRadius:16, padding:20, marginBottom:12}}>
              <div style={{fontSize:16, fontWeight:700, color:'#111', marginBottom:4}}>{f.title}</div>
              <div style={{fontSize:13, color:'#888', marginBottom:14}}>{f.gift}</div>
              <div style={{height:6, background:'#f0f0f0', borderRadius:99}}>
                <div style={{height:6, background:f.color, borderRadius:99, width:pct+'%'}} />
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:10}}>
                <div style={{fontSize:12, color:f.color, fontWeight:600}}>{won(f.raised)} 모였어요 ({pct}%)</div>
                <div style={{fontSize:12, color:'#888'}}>D-{f.dday}</div>
              </div>
            </div>
          )
        })}
        <button style={{display:'block', width:'100%', background:'#69B7FF', color:'#fff', border:'none', borderRadius:14, padding:'17px 0', fontSize:16, fontWeight:700, cursor:'pointer', marginTop:24}} onClick={onStart}>나도 만들기</button>
      </div>
    </div>
  )
}

function EditableText({ value, onChange, style, placeholder, multiline, isPlaceholder }) {
  // isPlaceholder=true이면 예시텍스트(처음엔 비워서 시작), false면 실제값
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState(isPlaceholder ? '' : value)
  const ref = useRef()

  useEffect(() => {
    if (!isPlaceholder) setInputVal(value)
  }, [value, isPlaceholder])

  useEffect(() => {
    if (editing && ref.current) ref.current.focus()
  }, [editing])

  const handleBlur = () => {
    setEditing(false)
    onChange(inputVal)
  }

  if (editing) {
    const isLight = !style.color || ['#111','#666','#333','#aaa'].includes(style.color)
    const s = { ...style, background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.2)', border: isLight ? '2px dashed #aaa' : '2px dashed rgba(255,255,255,0.8)', borderRadius:8, outline:'none', fontFamily:'inherit', width:'100%', boxSizing:'border-box', padding:'4px 8px' }
    return multiline
      ? <textarea ref={ref} style={{...s, resize:'none', minHeight:60}} value={inputVal} onChange={e => setInputVal(e.target.value)} onBlur={handleBlur} />
      : <input ref={ref} style={s} value={inputVal} onChange={e => setInputVal(e.target.value)} onBlur={handleBlur} />
  }

  const displayVal = isPlaceholder ? value : (inputVal || value)
  return (
    <div onClick={() => setEditing(true)} style={{...style, cursor:'pointer', borderBottom:'1.5px dashed rgba(150,150,150,0.35)', paddingBottom:2, display:'inline-block', minWidth:40}}>
      {displayVal || <span style={{opacity:0.4}}>{placeholder}</span>}
      <span style={{fontSize:10, opacity:0.5, marginLeft:4}}>✏️</span>
    </div>
  )
}

function AuthPage({ onLogin, onBack }) {
  return (
    <div style={{...wrap, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32}}>
      <div style={{fontSize:40, marginBottom:12}}>🎂</div>
      <div style={{fontSize:24, fontWeight:700, color:'#111', marginBottom:8}}>생일펀딩</div>
      <div style={{fontSize:14, color:'#888', marginBottom:40, textAlign:'center'}}>구글 계정으로 시작하면<br/>바로 내 펀딩 페이지가 생겨요</div>
      <button style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', maxWidth:320, background:'#fff', border:'1.5px solid #e0e0e0', color:'#333', borderRadius:14, padding:'16px 0', fontSize:16, fontWeight:700, cursor:'pointer'}} onClick={onLogin}>
        <span style={{fontSize:18}}>G</span> 구글로 시작하기
      </button>
      <button onClick={onBack} style={{marginTop:20, background:'none', border:'none', color:'#aaa', fontSize:14, cursor:'pointer'}}>돌아가기</button>
    </div>
  )
}

// ─── CreatePage ───────────────────────────────────────────────────────────────
// 탭: 미리보기1 | 미리보기2 | 링크설정
// 미리보기1 → 다음 → 미리보기2 → 다음 → 링크설정 → 펀딩 만들기
function CreatePage({ user, editFunding, onBack, onDone, onSaveDone, showToast }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {} } catch { return {} } })()
  const savedTab = (() => { try { return localStorage.getItem(DRAFT_KEY + '_tab') || 'page1' } catch { return 'page1' } })()

  const getInitialForm = () => {
    if (editFunding) {
      return {
        title: editFunding.title || '',
        gift_name: editFunding.gift_name || '',
        sub_message: editFunding.sub_message || '',
        goal_amount: editFunding.goal_amount ? String(editFunding.goal_amount) : '',
        benefit_items: editFunding.benefit_message ? editFunding.benefit_message.split('\n').filter(Boolean) : ['선물로 행복해하는 나를 볼 수 있다!', '가족들 건강하다!', '내가 행복하다!'],
        kakao_link: editFunding.kakao_link || '',
        slug: editFunding.is_draft ? '' : (editFunding.slug || ''),
        birthday: editFunding.birthday || '',
        color: editFunding.color || '#FF9F5A',
        image: editFunding.image || '',
        draftId: editFunding.id,
        isEdit: !editFunding.is_draft,
        editId: editFunding.id,
      }
    }
    const parsedSaved = { ...saved }
    if (parsedSaved.benefit_items && !Array.isArray(parsedSaved.benefit_items)) {
      parsedSaved.benefit_items = ['선물로 행복해하는 나를 볼 수 있다!', '가족들 건강하다!', '내가 행복하다!']
    }
    return {
      title:'', gift_name:'', sub_message:'', goal_amount:'',
      benefit_items: ['선물로 행복해하는 나를 볼 수 있다!', '가족들 건강하다!', '내가 행복하다!'],
      kakao_link:'', slug:'', birthday:'', color:'#FF9F5A', image:'', ...parsedSaved
    }
  }
  const [form, setForm] = useState(getInitialForm)
  const [tab, setTab] = useState(savedTab) // 'page1' | 'page2' | 'settings'
  const [loading, setLoading] = useState(false)
  const [guide, setGuide] = useState(false)
  const [slugStatus, setSlugStatus] = useState('')
  const [editingBenefits, setEditingBenefits] = useState(false)
  const [benefitDraft, setBenefitDraft] = useState('')

  const set = (k, v) => setForm(f => {
    const next = {...f, [k]:v}
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)) } catch(e) {}
    return next
  })

  const switchTab = (t) => {
    setTab(t)
    try { localStorage.setItem(DRAFT_KEY + '_tab', t) } catch(e) {}
  }

  const color = form.color || '#FF9F5A'

  const handleSave = async () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)) } catch(e) {}
    // DB에도 임시 저장
    if (form.draftId) {
      // 기존 임시저장 업데이트
      await supabase.from('fundings').update({
        title: form.title || '(제목 없음)',
        gift_name: form.gift_name || '',
        sub_message: form.sub_message || '',
        goal_amount: parseInt(form.goal_amount) || 0,
        benefit_message: Array.isArray(form.benefit_items) ? form.benefit_items.join('\n') : '',
        color: form.color || '#FF9F5A',
        image: form.image || null,
        is_draft: true,
      }).eq('id', form.draftId)
    } else {
      // 새 임시저장 생성 (slug 없이)
      const tempSlug = 'draft_' + user.id.slice(0,8) + '_' + Date.now()
      const { data, error } = await supabase.from('fundings').insert({
        user_id: user.id,
        title: form.title || '(제목 없음)',
        gift_name: form.gift_name || '',
        sub_message: form.sub_message || '',
        goal_amount: parseInt(form.goal_amount) || 0,
        benefit_message: Array.isArray(form.benefit_items) ? form.benefit_items.join('\n') : '',
        kakao_link: form.kakao_link || '',
        slug: tempSlug,
        birthday: form.birthday || null,
        color: form.color || '#FF9F5A',
        image: form.image || null,
        is_draft: true,
      }).select('id').single()
      if (data && !error) {
        const next = {...form, draftId: data.id}
        setForm(next)
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)) } catch(e) {}
      }
    }
    showToast('저장 완료!')
    if (onSaveDone) onSaveDone()
  }

  async function checkSlug() {
    if (!form.slug) return
    setSlugStatus('checking')
    const { data } = await supabase.from('fundings').select('id').eq('slug', form.slug.toLowerCase()).maybeSingle()
    setSlugStatus(data ? 'error' : 'ok')
  }

  // 수정 모드(기존 완성 펀딩)면 slug 중복확인 불필요, 새로 만들 때만 필요
  const isEditMode = !!(form.editId && !form.draftId)
  const slugOk = isEditMode || slugStatus === 'ok'
  const ready = form.title && form.gift_name && form.goal_amount && form.kakao_link && form.slug && slugOk

  async function submit() {
    // 어떤 항목이 빠졌는지 알려주기
    if (!form.title) { showToast('대제목을 입력해 주세요'); return }
    if (!form.gift_name) { showToast('선물 이름을 입력해 주세요'); return }
    if (!form.goal_amount) { showToast('목표 금액을 입력해 주세요'); return }
    if (!form.kakao_link) { showToast('카카오 링크를 입력해 주세요'); return }
    if (!form.slug) { showToast('펀딩 링크를 입력해 주세요'); return }
    if (!isEditMode && slugStatus !== 'ok') { showToast('링크 중복확인을 해 주세요'); return }
    if (!user || !user.id) { showToast('로그인이 필요해요. 다시 로그인해 주세요'); return }
    setLoading(true)
    const payload = {
      title: form.title,
      gift_name: form.gift_name,
      sub_message: form.sub_message,
      goal_amount: parseInt(form.goal_amount),
      benefit_message: Array.isArray(form.benefit_items) ? form.benefit_items.join('\n') : (typeof form.benefit_items === 'string' ? form.benefit_items : ''),
      kakao_link: form.kakao_link,
      slug: form.slug.toLowerCase(),
      birthday: form.birthday || null,
      color: form.color,
      image: form.image || null,
      is_draft: false,
    }
    let error
    if (form.draftId || form.editId) {
      // 기존 펀딩 업데이트
      const { error: e } = await supabase.from('fundings').update(payload).eq('id', form.draftId || form.editId)
      error = e
    } else {
      // 새 펀딩 생성
      const { error: e } = await supabase.from('fundings').insert({ user_id: user.id, ...payload })
      error = e
    }
    setLoading(false)
    if (error) { showToast('저장 실패: ' + (error.message || error.code || JSON.stringify(error))); setLoading(false); return }
    showToast(form.isEdit ? '수정됐어요!' : '펀딩 페이지가 만들어졌어요!')
    try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(DRAFT_KEY + '_tab') } catch(e) {}
    onDone()
  }

  const tabBtn = (t, label) => (
    <button onClick={() => switchTab(t)} style={{flex:1, background:tab===t?'#fff':'transparent', color:tab===t?color:'rgba(255,255,255,0.85)', border:'none', borderRadius:'12px 12px 0 0', padding:'11px 0', fontSize:13, fontWeight:700, cursor:'pointer'}}>
      {label}
    </button>
  )

  return (
    <div style={{...wrap, background:'#fff'}}>
      {/* 상단 탭 */}
      <div style={{background:color, padding:'20px 20px 0', paddingTop:'calc(20px + env(safe-area-inset-top))'}}>
        <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', gap:8, marginBottom:8}}>
          <button onClick={onBack} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:8, padding:'6px 12px', fontSize:13, fontWeight:600, cursor:'pointer'}}>🏠 홈</button>
          <button onClick={async () => { await supabase.auth.signOut(); try { localStorage.removeItem(PAGE_KEY) } catch(e) {} window.location.href = '/' }} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:8, padding:'6px 12px', fontSize:13, fontWeight:600, cursor:'pointer'}}>로그아웃</button>
        </div>
        <div style={{display:'flex'}}>
          {tabBtn('page1', '1페이지')}
          {tabBtn('page2', '2페이지')}
          {tabBtn('settings', '링크 설정')}
        </div>
      </div>

      {/* ── 1페이지 편집 ── */}
      {tab === 'page1' && (
        <div style={{paddingBottom:100}}>
          <div style={{background:color, padding:'12px 20px 7px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'calc(12px + env(safe-area-inset-top))'}}>
            <EditableText value={form.title} onChange={v => set('title', v)} placeholder="🎂 나의 생일 펀딩 (대제목)" style={{fontSize:17, fontWeight:700, color:'#fff'}} isPlaceholder={!form.title} />
          </div>

          {form.image ? (
            <div style={{position:'relative'}}>
              <img src={form.image} style={{width:'100%', aspectRatio:'1/1', objectFit:'cover', display:'block'}} />
              <button onClick={() => set('image', '')} style={{position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.5)', border:'none', color:'#fff', borderRadius:'50%', width:32, height:32, cursor:'pointer', fontSize:18}}>×</button>
            </div>
          ) : (
            <label style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:200, cursor:'pointer', background:'#f8f8f8', gap:8, borderBottom:'1px solid #eee'}}>
              <span style={{fontSize:36}}>📷</span>
              <span style={{fontSize:14, color:'#888', fontWeight:600}}>선물 사진 추가하기</span>
              <span style={{fontSize:12, color:'#bbb'}}>탭해서 사진을 선택해요</span>
              <input type="file" accept="image/*" style={{display:'none'}} onChange={e => {
                const file = e.target.files[0]; if (!file) return
                const reader = new FileReader()
                reader.onload = ev => set('image', ev.target.result)
                reader.readAsDataURL(file)
              }} />
            </label>
          )}

          <div style={{padding:'20px 20px 0'}}>
            <div style={{fontSize:18, fontWeight:700, color:'#111', marginBottom:16}}>
              <EditableText value={form.gift_name} onChange={v => set('gift_name', v)} placeholder="선물 이름 🎁" style={{fontSize:18, fontWeight:700, color:'#111'}} isPlaceholder={!form.gift_name} />
            </div>

            <div style={{marginBottom:4}}>
              <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:10}}>
                <div style={{fontSize:25, fontWeight:700, color:color}}>0<span style={{fontSize:16, fontWeight:600, color:'#111'}}>명 참여</span></div>
                {form.birthday && <div style={{background:'#f0f0f0', color:'#555', borderRadius:20, padding:'4px 12px', fontSize:13, fontWeight:600}}>{dday(form.birthday)||'D-?'}</div>}
              </div>
              <div style={{display:'flex', alignItems:'flex-end', gap:10, marginBottom:10}}>
                <div style={{fontSize:32, fontWeight:700, color:'#111'}}>0원<span style={{fontSize:18, fontWeight:600}}> 달성</span></div>
                <div style={{fontSize:14, color:'#888', fontWeight:500, marginBottom:4}}>
                  목표
                  <input type="number" inputMode="numeric" pattern="[0-9]*" value={form.goal_amount} onChange={e => set('goal_amount', e.target.value.replace(/[^0-9]/g,''))} placeholder="목표금액" style={{width:90, border:'none', borderBottom:'1.5px solid '+color, outline:'none', fontFamily:'inherit', fontSize:14, color:color, fontWeight:700, textAlign:'right', background:'transparent', marginLeft:4}} />원
                </div>
              </div>
              <div style={{height:6, background:'#f0f0f0', borderRadius:99, marginBottom:8}}>
                <div style={{height:6, background:color, borderRadius:99, width:'0%'}} />
              </div>
            </div>

            <div style={{borderTop:'1px solid #f0f0f0', marginTop:4, marginBottom:20, paddingTop:14}}>
              <div style={{fontSize:12, color:'#aaa', marginBottom:4}}>남은 금액</div>
              <div style={{fontSize:16, fontWeight:700, color:'#111'}}>{form.goal_amount ? won(form.goal_amount) : '—'}</div>
            </div>

            <div style={{border:'1px solid #f0f0f0', borderRadius:14, padding:'16px', marginBottom:20}}>
              <div style={{fontSize:13, fontWeight:700, color:'#333', marginBottom:12}}>메인 컬러 선택</div>
              <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
                {COLORS.map(c => (
                  <button key={c.main} onClick={() => set('color', c.main)} style={{width:40, height:40, borderRadius:'50%', background:c.main, border:form.color===c.main?'3px solid #333':'3px solid transparent', cursor:'pointer', transform:form.color===c.main?'scale(1.2)':'scale(1)', transition:'transform 0.15s'}} />
                ))}
              </div>
            </div>
          </div>

          <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:430, padding:'12px 20px 24px', background:'#fff', borderTop:'1px solid #f0f0f0', zIndex:100, display:'flex', gap:10}}>
            <button style={{flex:1, background:'#f0f0f0', color:'#555', border:'none', borderRadius:14, padding:'16px 0', fontSize:15, fontWeight:600, cursor:'pointer'}} onClick={handleSave}>중간 저장</button>
            <button style={{flex:2, background:color, color:'#fff', border:'none', borderRadius:14, padding:'16px 0', fontSize:15, fontWeight:700, cursor:'pointer'}} onClick={() => switchTab('page2')}>다음</button>
          </div>
        </div>
      )}

      {/* ── 2페이지 편집 ── */}
      {tab === 'page2' && (
        <div style={{paddingBottom:100}}>
          <div style={{background:color, padding:'20px 20px 24px', color:'#fff'}}>
            <div style={{fontSize:11, color:'rgba(255,255,255,0.75)', marginBottom:6}}>✏️ 후원하기 페이지 미리보기</div>
            <div style={{fontSize:18, fontWeight:700, color:'#fff'}}>후원하기</div>
          </div>

          <div style={{padding:'24px 20px 0'}}>
            {/* 후원의 효과 */}
            <div style={{marginBottom:28, textAlign:'center'}}>
              <div style={{fontSize:22, fontWeight:700, color:'#111', marginBottom:16}}>후원의 효과</div>
              {editingBenefits ? (
                <div>
                  <textarea
                    style={{width:'100%', border:'1.5px solid '+color, borderRadius:12, padding:'14px 16px', fontSize:15, color:'#111', outline:'none', fontFamily:'inherit', resize:'none', minHeight:120, boxSizing:'border-box', textAlign:'center'}}
                    value={benefitDraft}
                    onChange={e => setBenefitDraft(e.target.value)}
                    placeholder="한 줄씩 입력해요 (Enter로 구분)"
                    autoFocus
                  />
                  <button onClick={() => {
                    const items = benefitDraft.split('\n').filter(Boolean)
                    set('benefit_items', items)
                    setEditingBenefits(false)
                  }} style={{background:color, color:'#fff', border:'none', borderRadius:10, padding:'10px 24px', fontSize:14, fontWeight:700, cursor:'pointer', marginTop:8}}>완료</button>
                </div>
              ) : (
                <div onClick={() => {
                  const isDefault = JSON.stringify(form.benefit_items) === JSON.stringify(['선물로 행복해하는 나를 볼 수 있다!', '가족들 건강하다!', '내가 행복하다!'])
                  setBenefitDraft(isDefault ? '' : (Array.isArray(form.benefit_items) ? form.benefit_items.join('\n') : ''))
                  setEditingBenefits(true)
                }} style={{cursor:'pointer', padding:'16px', background:'#f8f8f8', borderRadius:14, border:'2px dashed #e0e0e0'}}>
                  {Array.isArray(form.benefit_items) && form.benefit_items.map((b, i) => (
                    <div key={i} style={{fontSize:15, color:'#333', marginBottom: i < form.benefit_items.length-1 ? 10 : 0, textAlign:'center'}}>
                      {b}
                    </div>
                  ))}
                  <div style={{fontSize:11, color:'#bbb', marginTop:12}}>✏️ 눌러서 수정</div>
                </div>
              )}
            </div>

            {/* 금액 입력 미리보기 */}
            <div style={{marginBottom:24, textAlign:'center'}}>
              <label style={{fontSize:13, fontWeight:600, color:'#333', marginBottom:8, display:'block'}}>후원 금액</label>
              <div style={{width:'100%', border:'2px solid #e8e8e8', borderRadius:14, padding:'16px', fontSize:22, fontWeight:700, color:'#bbb', textAlign:'center', boxSizing:'border-box'}}>금액을 입력해 주세요</div>
            </div>
            <div style={{background:'#e0e0e0', color:'#bbb', border:'none', borderRadius:14, padding:'17px 0', fontSize:16, fontWeight:700, textAlign:'center'}}>💛 카카오톡으로 송금하기</div>
          </div>

          <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:430, padding:'12px 20px 24px', background:'#fff', borderTop:'1px solid #f0f0f0', zIndex:100, display:'flex', gap:10}}>
            <button style={{flex:1, background:'#f0f0f0', color:'#555', border:'none', borderRadius:14, padding:'16px 0', fontSize:15, fontWeight:600, cursor:'pointer'}} onClick={handleSave}>중간 저장</button>
            <button style={{flex:2, background:color, color:'#fff', border:'none', borderRadius:14, padding:'16px 0', fontSize:15, fontWeight:700, cursor:'pointer'}} onClick={() => switchTab('settings')}>다음</button>
          </div>
        </div>
      )}

      {/* ── 링크 설정 ── */}
      {tab === 'settings' && (
        <div style={{padding:'24px 20px 120px', background:'#fff'}}>
          <div style={{marginBottom:24}}>
            <label style={{fontSize:13, fontWeight:600, color:'#333', marginBottom:8, display:'block'}}>생일 날짜</label>
            <input style={{width:'100%', border:'1.5px solid #e8e8e8', borderRadius:12, padding:'14px 16px', fontSize:15, color:'#111', outline:'none', fontFamily:'inherit', boxSizing:'border-box', maxWidth:'100%'}} type="date" value={form.birthday} onChange={e => set('birthday', e.target.value)} max="2099-12-31" />
          </div>

          <div style={{marginBottom:24}}>
            <label style={{fontSize:13, fontWeight:600, color:'#333', marginBottom:8, display:'block'}}>카카오 송금 링크</label>
            <input style={{width:'100%', border:'1.5px solid #e8e8e8', borderRadius:12, padding:'14px 16px', fontSize:15, color:'#111', outline:'none', fontFamily:'inherit', boxSizing:'border-box'}} placeholder="https://qr.kakaopay.com/..." value={form.kakao_link} onChange={e => set('kakao_link', e.target.value)} />
            <button onClick={() => setGuide(!guide)} style={{background:'none', border:'none', color:color, fontSize:13, cursor:'pointer', fontWeight:600, marginTop:8, padding:0}}>
              {guide ? '안내 닫기 ▲' : '카카오 링크 복사 방법 ▼'}
            </button>
            {guide && (
              <div style={{background:'#FFFBEA', border:'1px solid #FEE500', borderRadius:12, padding:16, marginTop:10}}>
                <div style={{fontSize:13, fontWeight:700, color:'#333', marginBottom:8}}>📱 카카오 송금 링크 복사하는 법</div>
                {['1. 카카오톡 앱 열기','2. 하단 더보기(•••) 탭 클릭','3. 상단 송금 버튼 클릭','4. 우측 상단 QR/링크 아이콘 클릭','5. 링크 복사 후 위 칸에 붙여넣기'].map((t,i) => (
                  <div key={i} style={{fontSize:12, color:'#555', marginBottom:4, lineHeight:1.6}}>{t}</div>
                ))}
              </div>
            )}
          </div>

          <div style={{marginBottom:24}}>
            <label style={{fontSize:13, fontWeight:600, color:'#333', marginBottom:8, display:'block'}}>내 펀딩 링크 <span style={{fontSize:11, color:'#aaa', fontWeight:400}}>영문/숫자만</span></label>
            <div style={{display:'flex', gap:8}}>
              <div style={{flex:1, display:'flex', alignItems:'center', border:'1.5px solid '+(slugStatus==='error'?'#e74c3c':slugStatus==='ok'?'#2ecc71':'#e8e8e8'), borderRadius:12, overflow:'hidden'}}>
                <span style={{padding:'14px 8px', fontSize:11, color:'#aaa', background:'#fafafa', borderRight:'1px solid #e8e8e8', whiteSpace:'nowrap'}}>saengilfunding.com/</span>
                <input style={{flex:1, border:'none', padding:'14px 8px', fontSize:14, color:slugStatus==='error'?'#e74c3c':'#111', outline:'none', fontFamily:'inherit'}} placeholder="impoor" value={form.slug} onChange={e => { set('slug', e.target.value.replace(/[^a-zA-Z0-9]/g,'')); setSlugStatus('') }} />
              </div>
              <button onClick={checkSlug} style={{background:color, color:'#fff', border:'none', borderRadius:12, padding:'0 14px', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap'}}>
                {slugStatus==='checking'?'확인중':'중복확인'}
              </button>
            </div>
            {slugStatus==='ok' && <div style={{fontSize:12, color:'#2ecc71', marginTop:6}}>✓ 사용 가능한 링크예요!</div>}
            {slugStatus==='error' && <div style={{fontSize:12, color:'#e74c3c', marginTop:6}}>✗ 이미 사용 중인 링크예요</div>}
          </div>

          <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:430, padding:'12px 20px 24px', background:'#fff', borderTop:'1px solid #f0f0f0', zIndex:100, display:'flex', gap:10}}>
            <button style={{flex:1, background:'#f0f0f0', color:'#555', border:'none', borderRadius:14, padding:'16px 0', fontSize:15, fontWeight:600, cursor:'pointer'}} onClick={handleSave}>중간 저장</button>
            <button style={{flex:2, background:ready&&!loading?color:'#e0e0e0', color:ready&&!loading?'#fff':'#bbb', border:'none', borderRadius:14, padding:'16px 0', fontSize:15, fontWeight:700, cursor:ready&&!loading?'pointer':'not-allowed'}} onClick={submit} disabled={!ready||loading}>
              {loading ? '만드는 중...' : ready ? '펀딩 페이지 만들기' : '모든 항목을 입력해 주세요'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MyPage({ user, fundings, onNew, onView, onEdit, showToast, onReload, toast }) {
  async function del(id) {
    if (!window.confirm('정말 삭제할까요?')) return
    await supabase.from('fundings').delete().eq('id', id)
    onReload(); showToast('삭제됐어요')
  }
  async function reset(id) {
    if (!window.confirm('금액과 메시지만 초기화돼요.\n펀딩 페이지는 유지돼요. 초기화할까요?')) return
    await supabase.from('donations').delete().eq('funding_id', id)
    onReload(); showToast('초기화됐어요')
  }
  async function copyLink(slug) {
    await navigator.clipboard.writeText('https://saengilfunding.com' + '/' + slug)
    showToast('링크가 복사됐어요!')
  }
  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || '내'

  async function logout() {
    await supabase.auth.signOut()
    try { localStorage.removeItem(PAGE_KEY) } catch(e) {}
    window.location.href = '/'
  }

  const drafts = fundings.filter(f => f.is_draft)
  const done = fundings.filter(f => !f.is_draft)

  const btn = (label, onClick, color='#f5f5f5', textColor='#333') => (
    <button style={{flex:1, background:color, border:'none', borderRadius:10, padding:'10px 0', fontSize:13, fontWeight:600, color:textColor, cursor:'pointer'}} onClick={onClick}>{label}</button>
  )

  return (
    <div style={wrap}>
      <div style={{background:'#69B7FF', padding:'52px 24px 24px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{fontSize:18, fontWeight:700}}>{name}의 펀딩</div>
        <button onClick={logout} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:8, padding:'6px 12px', fontSize:13, fontWeight:600, cursor:'pointer'}}>로그아웃</button>
      </div>
      <div style={{padding:'24px 20px 40px'}}>

        {/* 작성 중 */}
        {drafts.length > 0 && (
          <div style={{marginBottom:28}}>
            <div style={{fontSize:13, fontWeight:700, color:'#888', marginBottom:12}}>✏️ 작성 중</div>
            {drafts.map(f => {
              const fc = f.color || '#69B7FF'
              return (
                <div key={f.id} style={{background:'#fff', border:'2px dashed #e0e0e0', borderRadius:16, padding:20, marginBottom:12}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                    <div style={{width:10, height:10, borderRadius:'50%', background:fc, flexShrink:0}} />
                    <div style={{fontSize:16, fontWeight:700, color:'#111'}}>{f.title || '(제목 없음)'}</div>
                  </div>
                  <div style={{fontSize:12, color:'#bbb', marginBottom:14}}>링크 미설정 · 공유 불가</div>
                  <div style={{display:'flex', gap:8}}>
                    {btn('이어서 편집', () => onEdit(f), fc, '#fff')}
                    {btn('삭제', () => del(f.id), '#fff3f3', '#e74c3c')}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 완성 */}
        {done.length > 0 && (
          <div style={{marginBottom:28}}>
            <div style={{fontSize:13, fontWeight:700, color:'#888', marginBottom:12}}>✅ 완성</div>
            {done.map(f => {
              const fc = f.color || '#69B7FF'
              const link = 'https://saengilfunding.com' + '/' + f.slug
              return (
                <div key={f.id} style={{background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:20, marginBottom:12}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{width:10, height:10, borderRadius:'50%', background:fc, flexShrink:0}} />
                      <div style={{fontSize:16, fontWeight:700, color:'#111'}}>{f.title}</div>
                    </div>
                    <button onClick={() => del(f.id)} style={{background:'#f5f5f5', border:'none', borderRadius:6, padding:'4px 10px', fontSize:11, color:'#aaa', cursor:'pointer', fontWeight:500}}>삭제</button>
                  </div>
                  {/* 링크 눌러서 복사 */}
                  <div onClick={() => copyLink(f.slug)} style={{display:'flex', alignItems:'center', gap:6, cursor:'pointer', marginBottom:16, background:'#f8f8f8', borderRadius:10, padding:'10px 14px'}}>
                    <div style={{fontSize:14, color:fc, fontWeight:600, flex:1, wordBreak:'break-all'}}>{link}</div>
                    <div style={{fontSize:16, flexShrink:0}}>📋</div>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    {btn('펀딩 현황', () => onView(f), fc, '#fff')}
                    {btn('수정', () => onEdit(f))}
                    {btn('초기화', () => reset(f.id), '#fff3f3', '#e74c3c')}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {fundings.length === 0 && (
          <div style={{textAlign:'center', padding:'40px 0', color:'#aaa'}}>
            <div style={{fontSize:40, marginBottom:12}}>🎂</div>
            <div style={{fontSize:15}}>아직 펀딩이 없어요</div>
          </div>
        )}

        <button style={{display:'block', width:'100%', background:'#69B7FF', color:'#fff', border:'none', borderRadius:14, padding:'17px 0', fontSize:16, fontWeight:700, cursor:'pointer', marginTop:8}} onClick={onNew}>+ 새 펀딩 만들기</button>
      </div>
      {toast && <div style={{position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)', background:'#222', color:'#fff', borderRadius:10, padding:'12px 20px', fontSize:14, fontWeight:500, zIndex:9999, whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )
}

function FundingPage({ funding, donations, onDonate, onReload, toast, user, onHome }) {
  const [msgOpen, setMsgOpen] = useState(false)
  useEffect(() => { onReload && onReload() }, [])
  if (!funding) return <div style={{...wrap, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, color:'#888'}}>펀딩 접속 중...</div>

  const color = funding.color || '#69B7FF'
  const raised = donations.reduce((a, d) => a + (Number(d.amount)||0), 0)
  const pct = funding.goal_amount ? Math.round((raised/funding.goal_amount)*100) : 0
  const dd = dday(funding.birthday)
  const msgs = donations.filter(d => d.message && d.message.trim())
  const avg = donations.length > 0 ? Math.round(raised/donations.length) : 0

  return (
    <div style={{...wrap, paddingBottom:100}}>
      <div style={{background:color, padding:'20px 20px 20px', paddingTop:'calc(20px + env(safe-area-inset-top))', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 12px rgba(0,0,0,0.12)'}}>
        <div style={{fontSize:17, fontWeight:700, color:'#fff'}}>{funding.title}</div>
        {user && (
          <div style={{display:'flex', gap:8, flexShrink:0, marginLeft:12}}>
            <button onClick={onHome} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:8, padding:'6px 10px', fontSize:12, fontWeight:600, cursor:'pointer'}}>🏠 홈</button>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:8, padding:'6px 10px', fontSize:12, fontWeight:600, cursor:'pointer'}}>로그아웃</button>
          </div>
        )}
      </div>

      {funding.image ? (
        <img src={funding.image} style={{width:'100%', aspectRatio:'1/1', objectFit:'cover', display:'block'}} />
      ) : (
        <div style={{width:'100%', aspectRatio:'1/1', background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <span style={{fontSize:48}}>🎁</span>
        </div>
      )}

      <div style={{padding:'20px 20px 0'}}>
        <div style={{fontSize:18, fontWeight:700, color:'#111', marginBottom:16}}>{funding.gift_name} 🎁</div>

        <div style={{background:'#f8f8f8', borderRadius:16, padding:20, marginBottom:20}}>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:10}}>
            <div style={{fontSize:25, fontWeight:700, color:color}}>{donations.length}<span style={{fontSize:16, fontWeight:600, color:'#111'}}>명 참여</span></div>
            {dd && <div style={{background:'#fff', color:'#555', borderRadius:20, padding:'4px 12px', fontSize:13, fontWeight:600}}>{dd === 'D-Day' ? '오늘 마감' : dd}</div>}
          </div>
          <div style={{display:'flex', alignItems:'flex-end', gap:10, marginBottom:10}}>
            <div style={{fontSize:32, fontWeight:700, color:'#111'}}>{won(raised)}<span style={{fontSize:18, fontWeight:600}}> 달성</span></div>
            <div style={{fontSize:14, color:'#888', fontWeight:500, marginBottom:4}}>목표 {won(funding.goal_amount)}</div>
          </div>
          <div style={{height:6, background:'#e0e0e0', borderRadius:99, marginBottom:8}}>
            <div style={{height:6, background:color, borderRadius:99, width:Math.min(pct,100)+'%', transition:'width 0.5s'}} />
          </div>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <div style={{fontSize:13, color:'#888'}}>{pct}% 달성</div>
            <div style={{fontSize:13, color:'#888'}}>남은 금액 <span style={{fontWeight:700, color:'#111'}}>{won(Math.max(0,(funding.goal_amount||0)-raised))}</span></div>
          </div>
        </div>

        {msgs.length > 0 && (
          <div style={{marginBottom:16}}>
            <button onClick={() => setMsgOpen(!msgOpen)} style={{background:'none', border:'none', color:color, fontSize:14, fontWeight:600, cursor:'pointer', padding:0}}>
              🎂 생일 축하 메시지 {msgOpen ? '▲' : '▼'}
            </button>
            {msgOpen && msgs.map((d, i) => (
              <div key={i} style={{background:'#f8f8f8', borderRadius:12, padding:'12px 16px', marginTop:8, fontSize:14, color:'#333', lineHeight:1.6}}>{d.message}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:430, padding:'12px 20px 24px', background:'#fff', borderTop:'1px solid #f0f0f0', zIndex:100}}>
        <button style={{display:'block', width:'100%', background:color, color:'#fff', border:'none', borderRadius:14, padding:'17px 0', fontSize:16, fontWeight:700, cursor:'pointer'}} onClick={onDonate}>후원하기 🎉</button>
      </div>

      {toast && <div style={{position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)', background:'#222', color:'#fff', borderRadius:10, padding:'12px 20px', fontSize:14, fontWeight:500, zIndex:9999, whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )
}

function DonatePage({ funding, onBack, onDone, showToast }) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState('input')
  const [loading, setLoading] = useState(false)
  const color = funding?.color || '#69B7FF'
  const benefits = funding?.benefit_message ? funding.benefit_message.split('\n').filter(Boolean) : []

  function goKakao() {
    if (!amount || Number(amount) < 1) { showToast('금액을 입력해 주세요'); return }
    window.location.href = funding.kakao_link
    setStep('confirm')
  }

  async function done() {
    setLoading(true)
    await supabase.from('donations').insert({ funding_id:funding.id, amount:parseInt(amount), message:message.trim(), name:'익명' })
    setLoading(false)
    onDone()
  }

  return (
    <div style={wrap}>
      <div style={{background:color, padding:'52px 20px 20px', display:'flex', alignItems:'center', gap:12}}>
        <button style={{background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:14}} onClick={onBack}>←</button>
        <div style={{fontSize:17, fontWeight:700, color:'#fff'}}>후원하기</div>
      </div>
      <div style={{padding:'28px 20px 40px'}}>
        {step === 'input' ? (
          <>
            {benefits.length > 0 && (
              <div style={{marginBottom:28, textAlign:'center'}}>
                <div style={{fontSize:22, fontWeight:700, color:'#111', marginBottom:16}}>후원의 효과</div>
                <div style={{padding:'16px', background:'#f8f8f8', borderRadius:14}}>
                  {benefits.map((b, i) => (
                    <div key={i} style={{fontSize:15, color:'#333', marginBottom: i < benefits.length-1 ? 10 : 0, textAlign:'center'}}>
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{marginBottom:24, textAlign:'center'}}>
              <label style={{fontSize:13, fontWeight:600, color:'#333', marginBottom:8, display:'block'}}>후원 금액</label>
              <input style={{width:'100%', border:'2px solid '+(amount?color:'#e8e8e8'), borderRadius:14, padding:'16px', fontSize:22, fontWeight:700, color:'#111', outline:'none', fontFamily:'inherit', textAlign:'center', boxSizing:'border-box'}} type="number" placeholder="금액을 입력해 주세요" value={amount} onChange={e => setAmount(e.target.value)} inputMode="numeric" pattern="[0-9]*" />
            </div>
            <button style={{display:'block', width:'100%', background:amount?color:'#e0e0e0', color:amount?'#fff':'#bbb', border:'none', borderRadius:14, padding:'17px 0', fontSize:16, fontWeight:700, cursor:amount?'pointer':'not-allowed'}} onClick={goKakao} disabled={!amount}>💛 카카오톡으로 송금하기</button>
          </>
        ) : (
          <>
            <div style={{background:'#f0fff4', border:'1px solid #69d98c', borderRadius:14, padding:18, marginBottom:24, textAlign:'center'}}>
              <div style={{fontSize:15, fontWeight:700, color:'#2a8a4a', marginBottom:4}}>후원이 완료되었습니다!</div>
              <div style={{fontSize:13, color:'#555'}}>이름과 한마디를 남겨 주세요 💚</div>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:13, fontWeight:600, color:'#333', marginBottom:8, display:'block'}}>생일 축하 한마디 <span style={{fontSize:11, color:'#aaa'}}>선택</span></label>
              <textarea style={{width:'100%', border:'1.5px solid #e8e8e8', borderRadius:12, padding:'14px 16px', fontSize:15, color:'#111', outline:'none', fontFamily:'inherit', resize:'none', minHeight:80, boxSizing:'border-box'}} placeholder="생일 축하해! 🎂" value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <button style={{display:'block', width:'100%', background:color, color:'#fff', border:'none', borderRadius:14, padding:'17px 0', fontSize:16, fontWeight:700, cursor:'pointer'}} onClick={done} disabled={loading}>
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
    <div style={{...wrap, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32}}>
      <div style={{fontSize:56, marginBottom:16}}>🎉</div>
      <div style={{fontSize:22, fontWeight:700, color:'#111', marginBottom:32, textAlign:'center'}}>후원 완료!</div>
      <button style={{background:'#69B7FF', color:'#fff', border:'none', borderRadius:14, padding:'14px 32px', fontSize:15, fontWeight:700, cursor:'pointer'}} onClick={onBack}>후원 현황 확인</button>
    </div>
  )
}
