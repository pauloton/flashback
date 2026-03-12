'use client'
import { MiniKit } from '@worldcoin/minikit-js'
import { useEffect } from 'react'

export function MiniKitProvider({ children }) {
  useEffect(() => {
    MiniKit.install()
  }, [])
  return children
}
