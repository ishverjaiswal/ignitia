import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="grid">
          <div className="col brand">
            <div className="logo"> 
              <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M8 28C12 22 18 14 18 9C18 5 15 3 12 3C10 3 6 6 6 11C6 16 2 21 2 28H8Z" fill="#D4AF37"/>
                <text x="34" y="27" fill="#D4AF37" fontFamily="Playfair Display, serif" fontWeight="700" fontSize="18">Ignitia</text>
              </svg>
            </div>
            <p className="tagline">Join us for an unforgettable celebration of art, music, and culture.</p>
          </div>

          <div className="col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/teams">Our Teams</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="col">
            <h4>Explore More</h4>
            <ul>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/sponsors">Sponsors</Link></li>
              <li><Link href="/home">Web Archives</Link></li>
            </ul>
          </div>

          <div className="col">
            <h4>Support</h4>
            <ul>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/refund">Refund Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/delivery">Delivery & Shipping</Link></li>
              <li><Link href="/faqs">FAQs</Link></li>
            </ul>
          </div>
        </div>

        <div className="copyright">© 2025 Ignitia 2K25 by PSIT. All rights reserved.</div>
      </div>

      <style jsx>{`
        .site-footer { background: #000; color: #fff; padding: 48px 0 28px; border-top: 1px solid rgba(212,175,55,0.06); }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .grid { display: grid; grid-template-columns: 1fr; gap: 28px; }
        .col h4 { color: #D4AF37; margin-bottom: 12px; font-family: 'Playfair Display', serif; font-size: 1.15rem; }
        .col ul { list-style: none; padding: 0; margin: 0; }
        .col ul li { margin: 10px 0; }
        .col ul li a { color: #fff; opacity: 0.9; text-decoration: none; transition: color 160ms ease, opacity 160ms ease; }
        .col ul li a:hover { color: #F0D59B; opacity: 1; }

        .brand .logo { display:flex; align-items:center; gap:12px; }
        .brand .tagline { color: #fff; opacity: 0.9; margin-top: 12px; max-width: 320px; line-height:1.6; }

        .copyright { border-top: 1px solid rgba(212,175,55,0.04); margin-top: 28px; padding-top: 18px; color: #f3f0ea; opacity: 0.85; font-size: 0.95rem; }

        @media(min-width: 768px) {
          .grid { grid-template-columns: 2fr 1fr 1fr 1fr; align-items: start; }
          .brand .tagline { max-width: 320px; }
        }
      `}</style>
    </footer>
  )
}
