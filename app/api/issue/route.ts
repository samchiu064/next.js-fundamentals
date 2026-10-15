import { db } from '@/db'
import { issues } from '@/db/schema'
import { getCurrentUser } from '@/lib/dal'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const issues = await db.query.issues.findMany({})
    return NextResponse.json({ data: { issues } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'nah' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const newUserData = await req.json()
    const [newIssue] = await db
      .insert(issues)
      .values({ userId: user?.id, ...newUserData })
      .returning()
    return NextResponse.json({ data: newIssue })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'nah' }, { status: 500 })
  }
}
