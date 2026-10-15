import { NextRequest, NextResponse } from 'next/server'


export function GET(req: NextRequest) {
  return NextResponse.json({ data: { message: 'hello' } })
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  return NextResponse.json(data)
}
