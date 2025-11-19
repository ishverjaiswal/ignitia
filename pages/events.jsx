import React from 'react'
import Head from 'next/head'
import EventCard from '../components/events/EventCard'

const SAMPLE_EVENTS = [
  { id: 'e1', title: 'Main Stage Concert', date: '2025-12-05', venue: 'PSIT Arena', time: '7:00 PM', coordinator: 'A. Sharma', price: 499, image: '/gallery/img1.svg' },
  { id: 'e2', title: 'E-Sports Tournament', date: '2025-12-06', venue: 'Gaming Hall', time: '3:00 PM', coordinator: 'G. Singh', price: 299, image: '/gallery/img2.svg' },
  { id: 'e3', title: 'Cultural Night', date: '2025-12-07', venue: 'Open Grounds', time: '8:00 PM', coordinator: 'R. Kaur', price: 599, image: '/gallery/img3.svg' },
  { id: 'e4', title: 'Workshops & Talks', date: '2025-12-08', venue: 'Conference Hall', time: '10:00 AM', coordinator: 'S. Patel', price: 199, image: '/gallery/img5.svg' },
  { id: 'e5', title: 'Afterparty Aftermovie', date: '2025-12-09', venue: 'Rooftop', time: '11:00 PM', coordinator: 'D. Verma', price: 299, image: '/gallery/img6.svg' }
]

export default function EventsPage(){
  const events = SAMPLE_EVENTS

  return (
    <main className="min-h-screen py-12" style={{background: 'radial-gradient(ellipse at center,#140019 0%, #050009 60%)'}}>
      <Head>
        <title>IGNITIA Events</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=Inter:wght@300;400;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between py-6">
          <h1 className="text-gold font-display text-4xl">Events</h1>
          <p className="text-white/70">Premium curated events — IGNITIA</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(ev => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </div>
    </main>
  )
}
