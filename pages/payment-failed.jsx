import React from 'react'
import Link from 'next/link'

export default function PaymentFailed(){
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#120018] to-[#040009] p-8">
      <div className="max-w-xl text-center bg-[#07020a] p-10 rounded-2xl border border-gold shadow-xl">
        <h1 className="text-gold text-3xl font-display mb-4">Payment Failed</h1>
        <p className="text-white/80 mb-6">Unfortunately the payment did not complete. You can try again or contact support.</p>
        <Link href="/events" className="inline-block px-6 py-3 bg-transparent border border-gold text-gold rounded-full">Back to Events</Link>
      </div>
    </main>
  )
}
