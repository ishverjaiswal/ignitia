import React from 'react'

export default function FirebaseBanner(){
  // These NEXT_PUBLIC vars are inlined at build-time by Next.js
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''

  const missing = !apiKey || !projectId

  if (!missing) return null

  return (
    <div style={{position:'fixed',right:14,top:14,zIndex:99999,background:'#ffefc7',color:'#000',padding:'10px 14px',borderRadius:8,boxShadow:'0 8px 30px rgba(0,0,0,0.25)',fontSize:13,fontFamily:'Inter,system-ui'}}>
      <strong>Firebase not configured</strong>
      <div style={{marginTop:6}}>NEXT_PUBLIC_FIREBASE_* env vars are missing. Sign-in will be disabled on this deployment.</div>
      <div style={{marginTop:6,fontSize:12,opacity:0.9}}>Add NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID in Vercel → Settings → Environment Variables, then redeploy.</div>
    </div>
  )
}
