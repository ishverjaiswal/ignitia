// ProtectedRoute.jsx - wrapper that ensures children are visible only to authenticated users
import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // If not authenticated, redirect to login
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner border-4 border-blue-300 rounded-full w-12 h-12 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If authenticated, render children
  return <>{children}</>
}

export default ProtectedRoute
