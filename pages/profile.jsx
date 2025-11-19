// profile.jsx - Protected profile page showing Firestore-stored user info
import React, { useEffect, useState, useRef } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../context/AuthContext'
import Link from 'next/link'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { deleteUser } from 'firebase/auth'

export default function Profile() {
  const { user, logout, resetPassword } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [photoData, setPhotoData] = useState(null) // base64 preview/data

  const fileRef = useRef(null)

  // load profile from context or Firestore
  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!user) return
      setLoading(true)
      try {
        // prefer profile from context
        const fromContext = user?.profile
        if (fromContext) {
          if (!mounted) return
          setProfile(fromContext)
          setName(fromContext.name || '')
          setPhone(fromContext.phone || '')
          setCollege(fromContext.college || '')
          setDepartment(fromContext.department || '')
          setPhotoData(fromContext.photo || null)
        } else {
          const ref = doc(db, 'users', user.uid)
          const snap = await getDoc(ref)
          if (snap.exists() && mounted) {
            const data = snap.data()
            setProfile(data)
            setName(data.name || '')
            setPhone(data.phone || '')
            setCollege(data.college || '')
            setDepartment(data.department || '')
            setPhotoData(data.photo || null)
          }
        }
      } catch (err) {
        console.error('Failed loading profile', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user])

  const handlePhoto = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setPhotoData(reader.result)
    reader.readAsDataURL(f)
  }

  const saveChanges = async () => {
    if (!user) return
    setSaving(true)
    setMessage('')
    try {
      const ref = doc(db, 'users', user.uid)
      const payload = {
        name: name || '',
        phone: phone || '',
        college: college || '',
        department: department || '',
      }
      if (photoData) payload.photo = photoData
      await setDoc(ref, payload, { merge: true })
      setProfile(prev => ({ ...(prev||{}), ...payload }))
      setMessage('Profile saved successfully')
    } catch (err) {
      console.error('Save failed', err)
      setMessage('Failed to save changes')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleSendReset = async () => {
    if (!user?.email) return
    try {
      await resetPassword(user.email)
      setMessage('Password reset email sent')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setMessage('Failed to send reset email')
    }
  }

  const handleDelete = async () => {
    if (!confirm('This will permanently delete your account. Are you sure?')) return
    try {
      // attempt to delete Firebase Auth user (may require recent login)
      if (auth.currentUser) {
        await deleteUser(auth.currentUser)
      }
      // sign out locally
      await logout()
    } catch (err) {
      console.error('Delete failed', err)
      alert('Account deletion failed. Please re-login and try again.')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  // helper display values
  const createdAt = (profile?.createdAt && profile.createdAt.toDate) ? profile.createdAt.toDate().toLocaleString() : (profile?.createdAt || '-')

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Profile card */}
            <div className="flex-1 bg-black/60 backdrop-blur rounded-2xl p-8 shadow-lg border border-transparent" style={{ borderColor: 'rgba(212,175,55,0.06)' }}>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 p-1">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                      {photoData ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoData} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-3xl text-yellow-300">{(name || user?.displayName || 'U').charAt(0)}</div>
                      )}
                    </div>
                  </div>
                  <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handlePhoto} />
                  <button onClick={() => fileRef.current?.click()} className="mt-3 ml-2 px-3 py-1 bg-transparent border border-yellow-400 text-yellow-200 rounded">Upload Photo</button>
                </div>

                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#E4C76A' }}>{name || user?.displayName || 'Unnamed User'}</h2>
                  <p className="text-sm text-gray-300">{user?.email}</p>
                  <p className="mt-2 text-sm text-yellow-200">Welcome back to IGNITIA!</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <div className="text-sm text-yellow-300">Full name</div>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md bg-gray-900 border border-gray-800 px-3 py-2 text-white" />
                </label>

                <label className="space-y-1">
                  <div className="text-sm text-yellow-300">Phone number</div>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-md bg-gray-900 border border-gray-800 px-3 py-2 text-white" />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <div className="text-sm text-yellow-300">College / Organization</div>
                  <input value={college} onChange={e => setCollege(e.target.value)} className="w-full rounded-md bg-gray-900 border border-gray-800 px-3 py-2 text-white" />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <div className="text-sm text-yellow-300">Department / Branch</div>
                  <input value={department} onChange={e => setDepartment(e.target.value)} className="w-full rounded-md bg-gray-900 border border-gray-800 px-3 py-2 text-white" />
                </label>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={saveChanges} disabled={saving} className="px-4 py-2 rounded-md bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-semibold">{saving ? 'Saving...' : 'Save Changes'}</button>
                <button onClick={handleSendReset} className="px-4 py-2 rounded-md border border-gray-700 text-yellow-300">Change Password</button>
                <button onClick={handleLogout} className="ml-auto px-4 py-2 rounded-md bg-transparent border border-red-600 text-red-400">Logout</button>
              </div>

              {message && <div className="mt-4 text-sm text-green-300">{message}</div>}
            </div>

            {/* Right: Account & registration card */}
            <div className="w-full md:w-80 space-y-6">
              <div className="bg-black/60 rounded-2xl p-6 border" style={{ borderColor: 'rgba(212,175,55,0.06)' }}>
                <h3 className="text-lg font-semibold" style={{ color: '#D4AF37' }}>Account Settings</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Change Password</span>
                    <button onClick={handleSendReset} className="text-yellow-200 text-sm">Send Reset</button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Delete Account</span>
                    <button onClick={handleDelete} className="text-red-400 text-sm">Delete</button>
                  </div>

                  <div className="pt-2">
                    <button onClick={handleLogout} className="w-full px-3 py-2 rounded-md bg-gradient-to-r from-gray-800 to-gray-700 text-yellow-200">Logout</button>
                  </div>
                </div>
              </div>

              <div className="bg-black/60 rounded-2xl p-6 border" style={{ borderColor: 'rgba(212,175,55,0.04)' }}>
                <h3 className="text-lg font-semibold" style={{ color: '#D4AF37' }}>Registration</h3>
                <div className="mt-4 text-sm text-gray-300">
                  <div className="mb-2"><span className="text-yellow-300">Registration ID:</span> <span>{profile?.registrationId || 'N/A'}</span></div>
                  <div><span className="text-yellow-300">Joined:</span> <span>{createdAt}</span></div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-yellow-300">Participation Badges</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(profile?.badges || []).length === 0 && <div className="text-sm text-gray-400">No badges yet</div>}
                    {(profile?.badges || []).map((b, i) => (
                      <div key={i} className="px-3 py-1 rounded-full bg-gray-800 text-yellow-200 text-xs">{b}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-black/50 rounded-2xl p-4 text-sm text-gray-400">
                <div className="font-medium text-yellow-300">Role</div>
                <div className="mt-2">{profile?.role || 'user'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
