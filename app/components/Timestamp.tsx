'use client'

import { useSyncExternalStore } from 'react'

// 空訂閱函式（年份不會隨時間持續變動）
const emptySubscribe = () => () => {}

export function Timestamp() {
  const time = useSyncExternalStore(
    emptySubscribe,
    () => new Date().getFullYear(), // Client 端讀取的值
    () => null, // Server 端 (SSR) 讀取的值
  )

  return time
}
