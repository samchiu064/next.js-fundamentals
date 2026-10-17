import { Suspense } from 'react'
import { connection } from 'next/server'
import DashboardSkeleton from '../components/DashboardSkeleton'
import DashboardContent from '../components/DashboardContent'

export default async function DashboardPage() {
  await connection()
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
