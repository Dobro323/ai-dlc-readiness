'use client'
import { useState } from 'react'
import styles from './page.module.css'

const TEAM_TYPES = [
  { val: 'enterprise', label: 'Enterprise (50+ devs)' },
  { val: 'midsize', label: 'Mid-size (10–50)' },
  { val: 'startup', label: 'Startup (<10)' },
]

const STAGE_COLORS = {
  skip: '#888780',
  required: '#378ADD',
  critical: '#E24B4A',
}

export default function Home() {
  const [teamType, setTeamType] = useState('enterprise')
  const [devProcess, setDevProcess] = useState('')
  const [predictability, setPredictability] = useState('mid')
  const [aiUsage, setAiUsage] = useState('basic')
  const [oversight, setOversight] = useState('mid')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [audit, setAudit] = useState(null)
  const [error, setError] = useState(null)

  async function runAssessment() {
    if (!devProcess.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ process: devProcess, teamType, predictability, aiUsage, oversight }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
      setAudit(data.audit)
    } catch (e) {
      setError('Analysis failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>AI-DLC Readiness Assessor</div>
        <h1>Enterprise AI development readiness</h1>
        <p>Built on <a href="https://github.com/awslabs/aidlc-workflows" target="_blank" rel="noopener noreferrer">AWS AI-DLC methodology</a>. Describe your dev process and get a personalized transformation roadmap with audit trail.</p>
      </div>

      <div className={styles.card}>
        <label>Describe your current development process</label>
        <textarea
          value={devProcess}
          onChange={e => setDevProcess(e.target.value)}
          placeholder="e.g. We use Jira for tickets, developers pick up tasks and code independently, code review via PR, 2-week sprints. We've started using GitHub Copilot but without structured methodology..."
          rows={4}
        />
      </div>

      <div className={styles.card}>
        <div className={styles.sectionLabel}>Team size</div>
        <div className={styles.pills}>
          {TEAM_TYPES.map(t => (
            <button
              key={t.val}
              className={`${styles.pill} ${teamType === t.val ? styles.pillActive : ''}`}
              onClick={() => setTeamType(t.val)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionLabel}>Current metrics</div>
        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <label>Sprint predictability</label>
            <select value={predictability} onChange={e => setPredictability(e.target.value)}>
              <option value="low">Below 40%</option>
              <option value="mid">40–70%</option>
              <option value="high">70%+</option>
            </select>
          </div>
          <div className={styles.metricItem}>
            <label>AI tools in use</label>
            <select value={aiUsage} onChange={e => setAiUsage(e.target.value)}>
              <option value="none">None</option>
              <option value="basic">Basic (Copilot)</option>
              <option value="advanced">Agent-based</option>
            </select>
          </div>
          <div className={styles.metricItem}>
            <label>Human oversight</label>
            <select value={oversight} onChange={e => setOversight(e.target.value)}>
              <option value="low">Minimal</option>
              <option value="mid">At PR review</option>
              <option value="high">Every stage</option>
            </select>
          </div>
        </div>
      </div>

      <button
        className={styles.runBtn}
        onClick={runAssessment}
        disabled={loading || !devProcess.trim()}
      >
        {loading ? 'Analyzing...' : 'Assess readiness →'}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.results}>
          <div className={styles.scoreRow}>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreNum}>{result.score}</span>
              <span className={styles.scoreLabel}>/100</span>
            </div>
            <div className={styles.scoreMeta}>
              <h2>{result.level}</h2>
              <p>{result.summary}</p>
            </div>
          </div>

          <div className={styles.stagesSection}>
            <div className={styles.sectionLabel}>AI-DLC stage recommendations</div>
            <div className={styles.stagesGrid}>
              {result.stages.map(s => (
                <div
                  key={s.name}
                  className={styles.stageCard}
                  style={{ borderLeftColor: STAGE_COLORS[s.status] }}
                >
                  <div className={styles.stageName}>{s.name}</div>
                  <div className={styles.stageStatus} style={{ color: STAGE_COLORS[s.status] }}>
                    {s.status} — {s.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.roadmapCard}>
            <h3>Transformation roadmap — expected: <span>{result.expected_gain}</span></h3>
            {result.roadmap.map((item, i) => (
              <div key={i} className={styles.roadmapItem}>
                <div className={styles.roadmapNum}>{i + 1}</div>
                <div className={styles.roadmapBody}>
                  <div className={styles.roadmapTitle}>
                    {item.title}
                    <span className={styles.roadmapTimeline}>{item.timeline}</span>
                  </div>
                  <div className={styles.roadmapDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {audit && (
            <div className={styles.auditSection}>
              <div className={styles.auditLabel}>aidlc-docs/audit.md — public audit trail</div>
              <pre className={styles.auditBox}>{`## AI-DLC Assessment
**Timestamp**: ${audit.timestamp}
**Team**: ${audit.teamType} | Predictability: ${audit.predictability} | AI: ${audit.aiUsage}
**Input**: "${audit.processSnippet}${audit.processSnippet.length >= 120 ? '...' : ''}"
**Score**: ${audit.score}/100 | **Level**: ${audit.level}
**Expected gain**: ${audit.expectedGain}`}</pre>
            </div>
          )}
        </div>
      )}

      <div className={styles.footer}>
        <p>Built using <a href="https://github.com/awslabs/aidlc-workflows" target="_blank" rel="noopener noreferrer">AWS AI-DLC methodology</a> · <a href="https://github.com/Dobro323/ai-dlc-readiness" target="_blank" rel="noopener noreferrer">View source on GitHub</a></p>
      </div>
    </div>
  )
}
