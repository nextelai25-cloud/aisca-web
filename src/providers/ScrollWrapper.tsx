'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const SmoothScroll = dynamic(() => import('./SmoothScrollProvider'), { ssr: false })

export default function ScrollWrapper({ children }: { children: React.ReactNode }) {
  return <SmoothScroll>{children}</SmoothScroll>
}
