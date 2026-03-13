import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/journal?userId=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      include: {
        analysis: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/journal
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, ambience, text } = body

    if (!userId || !ambience || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        ambience,
        text
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
