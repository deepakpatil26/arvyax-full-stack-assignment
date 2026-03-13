'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Send, Thermometer, Wind, Mountain, Waves, Trees } from 'lucide-react'

type Ambience = 'forest' | 'ocean' | 'mountain'

interface JournalEntry {
  id: string
  userId: string
  ambience: Ambience
  text: string
  createdAt: string
  analysis?: {
    emotion: string
    keywords: string
    summary: string
  }
}

interface Insights {
  totalEntries: number
  topEmotion: string
  mostUsedAmbience: string
  recentKeywords: string[]
}

export default function JournalDashboard() {
  const [userId] = useState('123') // Static for prototype
  const [text, setText] = useState('')
  const [ambience, setAmbience] = useState<Ambience>('forest')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)

  useEffect(() => {
    fetchEntries()
    fetchInsights()
  }, [userId])

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/journal?userId=${userId}`)
      const data = await res.json()
      setEntries(data)
    } catch (err) {
      console.error('Failed to fetch entries', err)
    }
  }

  const fetchInsights = async () => {
    try {
      const res = await fetch(`/api/journal/insights/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setInsights(data)
      }
    } catch (err) {
      console.error('Failed to fetch insights', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ambience, text })
      })
      if (res.ok) {
        setText('')
        await fetchEntries()
        await fetchInsights()
      }
    } catch (err) {
      console.error('Failed to create entry', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async (entryId: string, entryText: string) => {
    setAnalyzingId(entryId)
    try {
      const res = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, text: entryText })
      })
      if (res.ok) {
        await fetchEntries()
        await fetchInsights()
      }
    } catch (err) {
      console.error('Failed to analyze entry', err)
    } finally {
      setAnalyzingId(null)
    }
  }

  const getAmbienceIcon = (a: Ambience) => {
    switch (a) {
      case 'forest': return <Trees className="w-5 h-5" />
      case 'ocean': return <Waves className="w-5 h-5" />
      case 'mountain': return <Mountain className="w-5 h-5" />
    }
  }

  return (
    <main className="dashboard-container">
      <div className="space-y-12">
        {/* Header & Insights */}
        <section style={{ marginBottom: '3rem' }}>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}
          >
            <div>
              <h1 className="gradient-text" style={{ fontSize: '2.5rem', margin: 0 }}>
                ArvyaX Journal
              </h1>
              <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Reflect on your nature immersive sessions.</p>
            </div>
            {insights && (
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Total</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{insights.totalEntries}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Top State</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981', textTransform: 'capitalize', margin: 0 }}>{insights.topEmotion || 'None'}</p>
                </div>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {insights && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}
              >
                <div className="entry-card" style={{ padding: '1rem' }}>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Favorite Ambience</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981' }}>{getAmbienceIcon(insights.mostUsedAmbience as Ambience)}</span>
                    <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{insights.mostUsedAmbience}</span>
                  </div>
                </div>
                <div className="entry-card" style={{ padding: '1rem', gridColumn: 'span 2' }}>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Recent Keywords</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {insights.recentKeywords.map((kw, i) => (
                      <span key={i} style={{ padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', borderRadius: '0.375rem', fontSize: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        {kw}
                      </span>
                    ))}
                    {insights.recentKeywords.length === 0 && <span style={{ color: '#475569', fontSize: '0.75rem', fontStyle: 'italic' }}>No keywords yet</span>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Input Form */}
        <section style={{ marginBottom: '4rem' }}>
          <motion.form 
            onSubmit={handleSubmit}
            className="glass-card"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How did you feel after the session?"
              className="input-area"
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="ambience-picker">
                {(['forest', 'ocean', 'mountain'] as Ambience[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmbience(a)}
                    className={`ambience-btn ${ambience === a ? 'active' : ''}`}
                  >
                    {getAmbienceIcon(a)}
                    <span style={{ textTransform: 'capitalize' }}>{a}</span>
                  </button>
                ))}
              </div>
              <button
                disabled={loading || !text.trim()}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Save Entry'}
                <Send size={16} />
              </button>
            </div>
          </motion.form>
        </section>

        {/* Entries Feed */}
        <section style={{ paddingBottom: '5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ width: '6px', height: '24px', background: '#10b981', borderRadius: '999px' }}></span>
            Past Sessions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {entries.map((entry) => (
              <motion.div 
                layout
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="entry-card"
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        {getAmbienceIcon(entry.ambience)}
                        {entry.ambience}
                      </span>
                      <span>•</span>
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>{entry.text}</p>
                    
                    {entry.analysis ? (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span className="badge badge-emotion">
                            Emotion: {entry.analysis.emotion}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>"{entry.analysis.summary}"</p>
                      </motion.div>
                    ) : (
                      <div style={{ marginTop: '1rem' }}>
                        <button
                          onClick={() => handleAnalyze(entry.id, entry.text)}
                          disabled={analyzingId === entry.id}
                          style={{ fontSize: '0.75rem', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0, fontWeight: 500 }}
                        >
                          {analyzingId === entry.id ? 'Analyzing...' : 'Analyze with AI'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {entries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#475569', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1.5rem' }}>
                No journal entries yet. Start with your first session.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
