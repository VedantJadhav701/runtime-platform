import { useMemo, useState, useEffect } from 'react'
import { Activity, Cpu, Play } from 'lucide-react'
import { LogViewer } from './components/LogViewer'
import { StatusCard } from './components/StatusCard'
import { ExecutionTimeline } from './components/ExecutionTimeline'
import { cn } from './lib/utils'
import { useTelemetry } from './hooks/useTelemetry'

function App() {
  const [replaySessions, setReplaySessions] = useState<string[]>([])
  const [selectedSession, setSelectedSession] = useState<string>('live')

  useEffect(() => {
    fetch('http://localhost:8000/replay/sessions')
      .then(res => res.json())
      .then(data => setReplaySessions(data.sessions || []))
      .catch(err => console.error("Failed to load replay sessions", err))
  }, [])

  const wsUrl = selectedSession === 'live' 
    ? 'ws://localhost:8000/ws/telemetry'
    : `ws://localhost:8000/ws/replay/${selectedSession}`

  const { events, status } = useTelemetry(wsUrl)

  const currentPhase = useMemo(() => {
    const lastTransition = [...events].reverse().find(e => e.event_type === 'state_transition')
    return lastTransition ? lastTransition.phase : 'IDLE'
  }, [events])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-6 selection:bg-primary selection:text-primary-foreground">
      <header className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Cpu className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Runtime Platform</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-xl border border-border">
            <Play className="w-4 h-4 text-muted-foreground" />
            <select 
              className="bg-transparent text-sm outline-none text-muted-foreground font-medium"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <option value="live">Live Telemetry</option>
              {replaySessions.map(session => (
                <option key={session} value={session}>Replay: {session.substring(0, 14)}...</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full border border-border">
            <Activity className={cn(
              "w-4 h-4 transition-colors",
              status === 'connected' ? 'text-emerald-500 animate-pulse' : 'text-rose-500',
              currentPhase === 'REPAIRING' && 'text-amber-500'
            )} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {status === 'connected' ? currentPhase : status}
            </span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Execution Logs */}
        <LogViewer events={events} />

        {/* System Status */}
        <aside className="flex flex-col gap-6">
          <ExecutionTimeline events={events} />
          
          <StatusCard />

          <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">Current Context</h3>
            <p className="text-sm text-muted-foreground italic">
              {currentPhase !== 'IDLE' ? `Active orchestration: ${currentPhase}` : 'No active orchestration plan detected.'}
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
