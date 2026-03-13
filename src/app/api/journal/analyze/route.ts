import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(request: Request) {
  try {
    const { entryId, text } = await request.json()

    if (!entryId || !text) {
      return NextResponse.json({ error: 'Missing entryId or text' }, { status: 400 })
    }

    // 1. Check if analysis already exists (Bonus: caching)
    const existingAnalysis = await prisma.journalAnalysis.findUnique({
      where: { entryId }
    })

    if (existingAnalysis) {
      return NextResponse.json(existingAnalysis)
    }

    // 2. Perform AI Analysis
    const prompt = `
      Analyze the emotional state of a user based on their nature-themed journal entry.
      User text: "${text}"
      
      Return a JSON object exactly in this format:
      {
        "emotion": "single word emotion",
        "keywords": ["word1", "word2", "word3"],
        "summary": "1-2 sentence empathetic summary"
      }
    `

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    })

    const analysisData = JSON.parse(completion.choices[0].message.content || '{}')

    // 3. Store the analysis
    const analysis = await prisma.journalAnalysis.create({
      data: {
        entryId,
        emotion: analysisData.emotion || 'neutral',
        keywords: (analysisData.keywords || []).join(','),
        summary: analysisData.summary || 'Analysis complete.'
      }
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing entry:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
