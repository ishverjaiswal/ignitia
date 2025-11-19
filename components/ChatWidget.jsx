import React, { useState, useEffect } from 'react'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hello! Ask me about events, tickets, or website pages.' }])
  const [mounted, setMounted] = useState(false)

  // only render/manage localStorage on the client to avoid SSR hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      const raw = localStorage.getItem('ignitia_chat_messages')
      if (raw) setMessages(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open, mounted])

  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem('ignitia_chat_messages', JSON.stringify(messages)) } catch (e) {}
  }, [messages, mounted])

  const faq = [
    { keys: ['event', 'events'], text: 'You can view upcoming events on the Events page: /events' },
    { keys: ['ticket', 'tickets', 'pricing'], text: 'Ticket information and booking is available on each event page under /events. Contact organizers for onsite sales.' },
    { keys: ['gallery', 'photos', 'images'], text: 'Browse photos and past galleries at /gallery' },
    { keys: ['sponsor', 'sponsors'], text: 'Sponsor details are listed at /sponsors' },
    { keys: ['archive', 'archives', 'web archives'], text: 'Visit the Web Archives at /home to explore past designs and event pages.' },
    { keys: ['login', 'signup', 'sign up', 'register'], text: 'Use the Login / Signup links in the header to create an account or sign in.' },
    { keys: ['profile', 'account'], text: 'Your profile is available at /profile once you are signed in.' },
    { keys: ['contact', 'contact us', 'support'], text: 'Contact us via the Contact page: /contact or email info@ignitia.example (replace with your real address).' },
    { keys: ['privacy', 'refund', 'terms', 'faq'], text: 'Support pages (Privacy, Refunds, Terms, FAQs) are under the Support section in the footer.' },
  ]

  const findAnswer = (text) => {
    const t = text.toLowerCase()
    for (const item of faq) {
      for (const k of item.keys) if (t.includes(k)) return item.text
    }
    // fallback: small canned replies
    if (t.includes('hello') || t.includes('hi')) return 'Hi there! Ask me about Events, Tickets, Gallery, Sponsors, Web Archives, Login, or Contact.'
    if (t.includes('where') || t.includes('how') || t.includes('what')) return 'I can help with site pages and basic info — try: "Where can I find events?"'
    return null
  }

  const pushMessage = (msg) => setMessages(m => [...m, msg])

  const onSend = () => {
    const text = input.trim()
    if (!text) return
    pushMessage({ from: 'user', text })
    setInput('')
    // quick simulated bot response
    const answer = findAnswer(text)
    if (answer) {
      setTimeout(() => pushMessage({ from: 'bot', text: answer }), 400)
    } else {
      setTimeout(() => pushMessage({ from: 'bot', text: "Sorry — I don't have that on file. Try asking about Events, Tickets, Gallery, Sponsors, Web Archives, Login or Contact." }), 500)
    }
  }

  const onKeyDown = (e) => { if (e.key === 'Enter') onSend() }

  if (!mounted) return null

  return (
    <div className="chat-root">
      {/* Floating preview: bubble + small hex icon */}
      <div className={`preview ${open ? 'hidden' : ''}`}>
        <div className="bubble" onClick={() => setOpen(true)} role="button" tabIndex={0}>
          <span className="bubble-text">Hi, how can I assist you?</span>
          <button className="bubble-close" aria-hidden>×</button>
        </div>

        <button className="mini-hex" aria-label="YouTube">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 8l6 4-6 4V8z" fill="#0b0b0b" />
          </svg>
        </button>
      </div>

      {/* Avatar circle */}
      <button className="avatar-btn" onClick={() => setOpen(v => !v)} aria-label="Open chat">
        <img src="/robot-avatar.svg" alt="assistant" />
      </button>

      {/* Full panel */}
      <div className={`chat-panel ${open ? 'open' : ''}`} role="dialog" aria-hidden={!open}>
        <div className="panel-header">
          <div className="panel-title">Hi, how can I assist you?</div>
          <button className="panel-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </div>
        <div className="panel-body">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.from === 'bot' ? 'bot' : 'user'}`}>{m.text}</div>
          ))}
        </div>
        <div className="panel-input">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Type a message..." aria-label="Type message" />
          <button className="send" onClick={onSend}>Send</button>
        </div>
      </div>

      <style jsx>{`
        .chat-root { position: fixed; right: 18px; bottom: 18px; z-index: 9999; display:flex; flex-direction:column; align-items:flex-end; gap:10px; }

        /* preview row: bubble + hexagon */
        .preview { display:flex; align-items:center; gap:8px; transform-origin: right center; }
        .preview.hidden { display:none; }

        .bubble { background: #0b0b0b; border: 2px solid rgba(212,175,55,0.9); color: #fff; padding: 12px 18px; border-radius: 12px; display:flex; align-items:center; gap:12px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); cursor:pointer; }
        .bubble-text { font-size: 14px; max-width: 260px; display:inline-block; }
        .bubble-close { background:transparent; border:0; color:#fff; opacity:0.9; font-size:18px; cursor:pointer; }

        .mini-hex { width:40px; height:40px; background: linear-gradient(90deg,#D4AF37,#F7D87C); border: none; padding:0; display:flex; align-items:center; justify-content:center; clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%); box-shadow: 0 8px 22px rgba(212,175,55,0.14); cursor:pointer; }
        .mini-hex svg { display:block; }

        .avatar-btn { width:56px; height:56px; border-radius:50%; background: #FFD93B; border: 3px solid rgba(212,175,55,0.12); display:flex; align-items:center; justify-content:center; padding:6px; box-shadow: 0 12px 36px rgba(0,0,0,0.5); cursor:pointer; }
        .avatar-btn img { width:100%; height:100%; object-fit:cover; border-radius:50%; }

        /* floating bob */
        .avatar-btn, .mini-hex, .bubble { animation: floaty 4s ease-in-out infinite; }
        @keyframes floaty { 0%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } 100%{ transform: translateY(0) } }

        /* panel */
        .chat-panel { width:360px; max-width: calc(100vw - 60px); background: linear-gradient(180deg,#0b0b0b,#050505); border-radius: 12px; box-shadow: 0 30px 80px rgba(0,0,0,0.7); overflow:hidden; transform: translateY(12px) scale(.98); opacity:0; pointer-events:none; transition: all 220ms cubic-bezier(.2,.9,.2,1); }
        .chat-panel.open { opacity:1; transform: translateY(0) scale(1); pointer-events:auto; }
        .panel-header { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background: linear-gradient(90deg,#3b2b07,#6a511b); }
        .panel-title { color:#fff; font-weight:600; }
        .panel-close { background:transparent; border:0; color:#fff; font-size:18px; cursor:pointer; }
        .panel-body { padding:12px; max-height:280px; overflow:auto; }
        .message { margin-bottom:12px; padding:10px 12px; border-radius:10px; color:#fff; background: rgba(255,255,255,0.03); }
        .message.bot { background: linear-gradient(180deg, rgba(212,175,55,0.06), rgba(255,255,255,0.02)); }
        .panel-input { display:flex; gap:8px; padding:12px; border-top:1px solid rgba(255,255,255,0.03); }
        .panel-input input { flex:1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.04); color:#fff; padding:10px 12px; border-radius:8px; }
        .panel-input .send { background: linear-gradient(90deg,#D4AF37,#F7D87C); border:0; padding:8px 12px; border-radius:8px; cursor:pointer; }

        @media (max-width: 640px) {
          .chat-root { right: 12px; bottom: 12px; }
          .bubble-text { max-width: 160px; }
        }
      `}</style>
    </div>
  )
}
