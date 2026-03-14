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
  const [filter, setFilter] = useState<Ambience | 'all'>('all')

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(e => e.ambience === filter)

  useEffect(() => {
    fetchEntries()
    fetchInsights()
  }, [userId])

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/journal/${userId}`)
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    try {
      const res = await fetch(`/api/journal/entry/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchEntries()
        await fetchInsights()
      }
    } catch (err) {
      console.error('Failed to delete entry', err)
    }
  }

  const getMoodColor = (emotion?: string) => {
    if (!emotion) return 'rgba(255,255,255,0.1)'
    const e = emotion.toLowerCase()
    if (e.includes('joy') || e.includes('happy') || e.includes('cheerful')) return 'rgba(234, 179, 8, 0.2)'
    if (e.includes('calm') || e.includes('peace') || e.includes('relax')) return 'rgba(16, 185, 129, 0.2)'
    if (e.includes('anxious') || e.includes('stress')) return 'rgba(239, 68, 68, 0.2)'
    if (e.includes('sad') || e.includes('lonely')) return 'rgba(59, 130, 246, 0.2)'
    return 'rgba(6, 182, 212, 0.2)'
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="sessions-title" style={{ margin: 0 }}>Past Sessions</h2>
          <div className="ambience-selector" style={{ background: 'var(--surface)', padding: '0.4rem', borderRadius: '999px' }}>
            {(['all', 'forest', 'ocean', 'mountain'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'var(--primary)' : 'transparent',
                  color: filter === f ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.4rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredEntries.map((entry, idx) => (
            <motion.div
              layout
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="glass-card session-card"
            >
              <div className="session-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span className="session-meta-pill">
                    {getAmbienceIcon(entry.ambience)}
                    {entry.ambience}
                  </span>
                  <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.4, transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.4')}
                >
                  Delete
                </button>
              </div>
              <p className="session-text">{entry.text}</p>

              {entry.analysis ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="analysis-container"
                >
                  <span className="emotion-tag" style={{ background: getMoodColor(entry.analysis.emotion), color: '#fff' }}>
                    Emotion: {entry.analysis.emotion}
                  </span>
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
