'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Keep tracker safe from SSR or empty navigator
    if (typeof window === 'undefined') return;
    
    const sessionId = sessionStorage.getItem('aisca_session') || 
      Math.random().toString(36).substring(2, 11)
    sessionStorage.setItem('aisca_session', sessionId)
    
    // Smooth parsing of browser
    const userAgent = navigator.userAgent || ''
    let browser = 'Unknown'
    if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('SamsungBrowser')) browser = 'Samsung Browser'
    else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera'
    else if (userAgent.includes('Trident')) browser = 'IE'
    else if (userAgent.includes('Edge')) browser = 'Edge'
    else if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: pathname,
        referrer: document.referrer || '',
        device: /Mobile|Android|iP(hone|od|ad)/.test(userAgent) ? 'mobile' : 'desktop',
        browser: browser,
        session_id: sessionId
      })
    }).catch(err => console.warn("Analytics tracking error (ignored):", err))
  }, [pathname])
  
  return null
}
