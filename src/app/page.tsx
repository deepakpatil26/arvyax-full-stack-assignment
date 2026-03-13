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
      {/* Header & Insights */}
      <header className="header">
        <div className="title-group">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            ArvyaX Journal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Reflect on your nature immersive sessions.
          </motion.p>
        </div>

        {insights && (
          <div className="stats-group">
            <div className="stat-item">
              <p className="stat-label">Total</p>
              <p className="stat-value">{insights.totalEntries}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Dominant</p>
              <p className="stat-value primary">{insights.topEmotion || 'None'}</p>
            </div>
          </div>
        )}
      </header>

      {insights && (
        <section className="insights-grid">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
          >
            <p className="stat-label" style={{ marginBottom: '1rem' }}>Favorite Ambience</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
              <span style={{ color: 'var(--primary)' }}>{getAmbienceIcon(insights.mostUsedAmbience as Ambience)}</span>
              <span style={{ textTransform: 'capitalize' }}>{insights.mostUsedAmbience}</span>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            <p className="stat-label" style={{ marginBottom: '1rem' }}>Recent Keywords</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {insights.recentKeywords.map((kw, i) => (
                <span key={i} className="keyword-pill">{kw}</span>
              ))}
              {insights.recentKeywords.length === 0 && <span className="analysis-summary">No themes captured yet</span>}
            </div>
          </motion.div>
        </section>
      )}

      {/* Input Section */}
      <section className="input-section">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="glass-card input-card"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How did you feel after the session?"
            className="journal-textarea"
          />
          <div className="input-footer">
            <div className="ambience-selector">
              {(['forest', 'ocean', 'mountain'] as Ambience[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmbience(a)}
                  className={`ambience-pill ${ambience === a ? 'active' : ''}`}
                >
                  {getAmbienceIcon(a)}
                  <span style={{ textTransform: 'capitalize' }}>{a}</span>
                </button>
              ))}
            </div>
            <button
              disabled={loading || !text.trim()}
              className="submit-btn"
            >
              {loading ? 'Saving...' : 'Save Entry'}
              <Send size={18} />
            </button>
          </div>
        </motion.form>
      </section>

      {/* Feed Section */}
      <section style={{ paddingBottom: '10rem' }}>
        <h2 className="sessions-title">Past Sessions</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {entries.map((entry, idx) => (
            <motion.div 
              layout
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="glass-card session-card"
            >
              <div className="session-header">
                <span className="session-meta-pill">
                  {getAmbienceIcon(entry.ambience)}
                  {entry.ambience}
                </span>
                <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="session-text">{entry.text}</p>
              
              {entry.analysis ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="analysis-container"
                >
                  <span className="emotion-tag">Emotion: {entry.analysis.emotion}</span>
                  <p className="analysis-summary">"{entry.analysis.summary}"</p>
                </motion.div>
              ) : (
                <button
                  onClick={() => handleAnalyze(entry.id, entry.text)}
                  disabled={analyzingId === entry.id}
                  className="analyze-btn"
                >
                  {analyzingId === entry.id ? 'Reflecting...' : 'Understand Session'}
                </button>
              )}
            </motion.div>
          ))}
          {entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Your journey begins with the first entry above.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
