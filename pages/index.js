// index.js - simple landing that routes to login
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Always open the public home page first
    router.replace('/home')
  }, [router])

  return null
}
