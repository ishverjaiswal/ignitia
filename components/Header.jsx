import Link from 'next/link'
import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const Header = () => {
  const { user } = useAuth()
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const THRESHOLD = 8 // minimum px change before toggling

    const handle = () => {
      const y = window.scrollY || window.pageYOffset
      const delta = y - lastY.current

      // if near top, keep header visible
      if (y <= 24) {
        setVisible(true)
        lastY.current = y
        ticking.current = false
        return
      }

      if (Math.abs(delta) < THRESHOLD) {
        // ignore tiny scrolls
        lastY.current = y
        ticking.current = false
        return
      }

      if (delta > 0) {
        // user scrolled down -> show header
        setVisible(true)
      } else if (delta < 0) {
        // user scrolled up -> hide header
        setVisible(false)
      }

      lastY.current = y
      ticking.current = false
    }

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(handle)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 z-40 transition-transform duration-300 ease-in-out`}
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-110%)',
        // subtle dark purple -> transparent gradient to match the page
        background: 'linear-gradient(180deg, rgba(26,6,34,0.85), rgba(5,0,5,0.6))',
        backdropFilter: 'saturate(140%) blur(8px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold">Ignitia</div>
        </div>

        <nav className="flex-1">
          <ul className="flex justify-center space-x-8 text-sm items-center" style={{ color: '#e6c76b' }}>
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/events" className="hover:text-white">Events</Link></li>
            <li><Link href="/sponsors" className="hover:text-white">Sponsors</Link></li>
            <li><Link href="/home" className="hover:text-white">Archives</Link></li>
            <li><Link href="/teams" className="hover:text-white">Teams</Link></li>
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <CartIcon />

          {user ? (
            <div className="inline-flex items-center gap-3">
              {/* Avatar + upload */}
              <div className="relative">
                <label className="cursor-pointer inline-flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        const reader = new FileReader()
                         reader.onload = async () => {
                          const data = reader.result
                          // save base64 to Firestore users/{uid}.photo (merge)
                          const uid = user.uid
                          await setDoc(doc(db, 'users', uid), { photo: data }, { merge: true })
                          // small optimistic UI: update DOM image src
                          const img = document.getElementById('header-avatar')
                          if (img) img.src = data
                        }
                        reader.readAsDataURL(file)
                      } catch (err) {
                        console.error('Avatar upload failed', err)
                      }
                    }}
                    className="hidden"
                  />

                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border border-yellow-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      id="header-avatar"
                      src={user?.profile?.photo || user?.photoURL || '/robot-avatar.svg'}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </label>
              </div>

              <Link href="/profile" className="inline-flex items-center gap-2 bg-transparent text-white px-3 py-2 rounded">
                <span className="font-medium">{user?.profile?.name || user?.displayName || 'Profile'}</span>
              </Link>
            </div>
          ) : (
            <Link href="/login" className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-full shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" /></svg>
              <span className="font-medium">Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

function CartIcon(){
  const { cart, setOpen, bump } = useCart()
  const count = cart.reduce((s,i)=> s + (i.qty||1), 0)
  return (
    <button onClick={()=> setOpen(true)} className="relative bg-transparent p-2 rounded-full border-2 border-gold text-gold w-11 h-11 flex items-center justify-center" aria-label="Open cart">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
       
        <span key={bump ? 'b':'a'} className="absolute -top-2 -right-2 bg-gold text-[22px] text-white-300 font-bold w-6 h-6 rounded-full flex items-center justify-center">{count}</span>
      
    </button>
  )
}
