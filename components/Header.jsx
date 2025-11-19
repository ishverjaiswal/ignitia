import Link from 'next/link'
import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const Header = () => {
  const { user } = useAuth()
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const ticking = useRef(false)

  // 🔥 HEADER ANIMATION ON SCROLL
  useEffect(() => {
    const THRESHOLD = 8

    const handle = () => {
      const y = window.scrollY
      const delta = y - lastY.current

      if (y <= 24) {
        setVisible(true)
      } else if (Math.abs(delta) >= THRESHOLD) {
        setVisible(delta > 0)
      }

      lastY.current = y
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(handle)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500`}
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-120%)',
        background: 'linear-gradient(180deg, rgba(10,0,15,0.85), rgba(5,0,5,0.55))',
        backdropFilter: 'blur(12px) saturate(160%)',
        borderBottom: '1px solid rgba(255,215,130,0.15)',
        boxShadow: '0 0 25px rgba(255,215,130,0.18)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* 🔥 BRAND LOGO */}
        <div className="text-3xl tracking-wide font-extrabold select-none"
          style={{
            color: '#FFD678',
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 0 20px rgba(255,215,130,0.45)',
          }}>
          IGNITIA
        </div>

        {/* 🔥 NAVIGATION */}
        <nav className="flex-1">
          <ul
            className="flex justify-center space-x-10 text-sm font-semibold tracking-wide"
            style={{ color: '#e6c76b' }}
          >
            {['Home', 'About', 'Events', 'Sponsors', 'Archives', 'Teams'].map((item, i) => (
              <li key={i}>
                <Link href={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                  className="relative transition-all hover:text-white">
                  {item}
                  <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-gold transition-all duration-300 hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-6">

          <CartIcon />

          {user ? (
            <div className="flex items-center gap-4">

              {/* ONLY AVATAR — opens profile */}
              <Link href="/profile">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-600
                                hover:scale-110 transition-transform shadow-md cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user?.profile?.photo || user?.photoURL || '/robot-avatar.svg'}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-black font-bold rounded-full bg-yellow-400 
                        shadow-[0_0_15px_rgba(255,215,130,0.5)]
                        hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(255,215,130,0.7)]
                        transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

// 🔥 PREMIUM CART ICON
function CartIcon() {
  const { cart, setOpen, bump } = useCart()
  const count = cart.reduce((s, i) => s + (i.qty || 1), 0)

  return (
    <button
      onClick={() => setOpen(true)}
      className="relative w-12 h-12 flex items-center justify-center 
                 border-2 border-yellow-500 rounded-full text-yellow-400
                 hover:scale-110 transition-transform shadow-md"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <span
        key={bump ? 'b' : 'a'}
        className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 
                   text-black font-bold rounded-full text-sm 
                   flex items-center justify-center shadow"
      >
        {count}
      </span>
    </button>
  )
}
