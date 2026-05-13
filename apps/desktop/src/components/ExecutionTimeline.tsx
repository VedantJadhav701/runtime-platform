import { useMemo, useState, useEffect } from 'react'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Wrench, 
  PlayCircle, 
  ChevronDown, 
  ChevronRight,
  Zap,
  ShieldCheck,
  History,
  TrendingUp
} from 'lucide-react'
import { cn } from '../lib/utils'
import { TelemetryEvent } from '../hooks/useTelemetry'

interface ExecutionNode {
  id: string
  action: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  params: Record<string, any>
  output?: any
  error?: string
  phase?: string
  duration?: number
}

interface ExecutionTimelineProps {
  events: TelemetryEvent[]
}

export function ExecutionTimeline({ events }: ExecutionTimelineProps) {
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null)
  const [scrubIndex, setScrubIndex] = useState<number>(events.length)

  // Synchronize scrub index with incoming events if at the end
  useEffect(() => {
    if (scrubIndex >= events.length - 1) {
      setScrubIndex(events.length)
    }
  }, [events.length])

  const visibleEvents = useMemo(() => events.slice(0, scrubIndex), [events, scrubIndex])

  const { nodes, confidenceHistory, phases } = useMemo(() => {
    const graphNodes: Record<string, ExecutionNode> = {}
    const confHistory: number[] = []
    const phaseGroups: Record<string, string[]> = {}
    
    visibleEvents.forEach(event => {
      if (event.event_type === 'node_added') {
        const node = { ...event.data.node, phase: event.phase } as ExecutionNode
        graphNodes[node.id] = node
        if (!phaseGroups[event.phase]) phaseGroups[event.phase] = []
        phaseGroups[event.phase].push(node.id)
      } else if (event.event_type === 'node_updated') {
        const { node_id, status, output, error } = event.data
        if (graphNodes[node_id]) {
          graphNodes[node_id].status = status
          if (output) graphNodes[node_id].output = output
          if (error) graphNodes[node_id].error = error
        }
      } else if (event.event_type === 'confidence_update') {
        confHistory.push(event.data.score)
      }
    })
    
    // Fallback if no explicit confidence events
    if (confHistory.length === 0 && visibleEvents.length > 0) {
        // Basic heuristic for demo purposes if events don't have it yet
        confHistory.push(95) 
    }

    return { 
        nodes: Object.values(graphNodes).sort((a, b) => {
            const idA = parseInt(a.id.split('_')[1])
            const idB = parseInt(b.id.split('_')[1])
            return idA - idB
        }),
        confidenceHistory: confHistory,
        phases: phaseGroups
    }
  }, [visibleEvents])

  const getStatusIcon = (status: ExecutionNode['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case 'failed': return <AlertCircle className="w-5 h-5 text-rose-500" />
      case 'running': return <PlayCircle className="w-5 h-5 text-blue-500" />
      case 'pending': return <Clock className="w-5 h-5 text-slate-500" />
      default: return <Circle className="w-5 h-5 text-slate-500" />
    }
  }

  const currentPhase = useMemo(() => {
    const lastTransition = [...visibleEvents].reverse().find(e => e.event_type === 'state_transition')
    return lastTransition ? lastTransition.phase : 'IDLE'
  }, [visibleEvents])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <History className="w-4 h-4" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Replay Engine</h2>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 px-2 py-1 rounded border border-border">
            <ShieldCheck className={cn("w-3 h-3", confidenceHistory[confidenceHistory.length-1] > 80 ? "text-emerald-500" : "text-amber-500")} />
            <span className="text-[10px] font-bold font-mono">
                CONF: {confidenceHistory[confidenceHistory.length-1] || 100}%
            </span>
        </div>
      </div>

      {/* Scrubber */}
      {events.length > 0 && (
        <div className="px-1 mb-4">
          <input 
            type="range" 
            min="0" 
            max={events.length} 
            value={scrubIndex} 
            onChange={(e) => setScrubIndex(parseInt(e.target.value))}
            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground font-mono">T-MINUS</span>
            <span className="text-[10px] text-muted-foreground font-mono">{scrubIndex}/{events.length} EVENTS</span>
          </div>
        </div>
      )}
      
      <div className="space-y-4 relative before:absolute before:left-[18px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
        {nodes.length === 0 ? (
          <div className="pl-10 py-8 text-sm text-muted-foreground italic flex flex-col items-center gap-3">
            <Zap className="w-8 h-8 text-muted-foreground/20 animate-pulse" />
            <span>Awaiting orchestration dispatch...</span>
          </div>
        ) : (
          nodes.map((node) => {
            const isExpanded = expandedNodeId === node.id;
            const isRepair = node.action === 'REPAIR' || node.phase === 'REPAIRING';
            
            return (
            <div 
              key={node.id} 
              className={cn(
                "relative pl-10 transition-all duration-300",
                node.status === 'running' && "scale-[1.02] origin-left"
              )}
            >
              <div className="absolute left-0 top-1.5 z-10 bg-background p-0.5">
                {getStatusIcon(node.status)}
              </div>
              
              <div 
                onClick={() => setExpandedNodeId(isExpanded ? null : node.id)}
                className={cn(
                "p-4 bg-card rounded-xl border transition-all duration-300 cursor-pointer hover:border-primary/50",
                node.status === 'running' ? "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "border-border",
                isRepair && node.status === 'running' ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]" : "",
                node.status === 'failed' && "border-rose-500/30",
                node.status === 'running' && "animate-pulse"
              )}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                        {node.action}
                        {isRepair && <Wrench className="w-3 h-3 text-amber-500" />}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border leading-none",
                        node.status === 'completed' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                        node.status === 'failed' && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                        node.status === 'running' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        isRepair && node.status === 'running' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        node.status === 'pending' && "bg-slate-500/10 text-slate-500 border-slate-500/20"
                    )}>
                        {node.status}
                    </span>
                    <span className="text-[8px] text-muted-foreground font-mono uppercase opacity-50">
                        {node.phase}
                    </span>
                  </div>
                </div>
                
                {node.params && Object.keys(node.params).length > 0 && !isExpanded && (
                  <div className="text-[9px] text-muted-foreground font-mono mt-1 ml-6 truncate max-w-[200px]">
                    {JSON.stringify(node.params)}
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-4 ml-6 space-y-3 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-300">
                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Parameters:</span>
                        <pre className="text-[10px] bg-secondary/30 p-2 rounded border border-border overflow-x-auto font-mono">
                          {JSON.stringify(node.params, null, 2)}
                        </pre>
                    </div>

                    {node.output && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Output Artifacts:</span>
                        </div>
                        <pre className="text-[10px] bg-black/50 p-2 rounded border border-border overflow-x-auto text-emerald-100/80 font-mono">
                          {typeof node.output === 'object' ? JSON.stringify(node.output, null, 2) : node.output}
                        </pre>
                      </div>
                    )}
                    {node.error && (
                      <div>
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1 block">Execution Error:</span>
                        <pre className="text-[10px] bg-rose-500/5 p-2 rounded border border-rose-500/20 overflow-x-auto text-rose-400 font-mono">
                          {node.error}
                        </pre>
                      </div>
                    )}
                    {!node.output && !node.error && node.status !== 'running' && (
                      <span className="text-[10px] text-muted-foreground italic">No telemetry artifacts recorded.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )})
        )}
      </div>

      {/* Confidence Sparkline */}
      {confidenceHistory.length > 0 && (
          <div className="mt-4 p-3 bg-secondary/20 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confidence Evolution</span>
                  </div>
                  <span className="text-[10px] font-mono text-primary">{confidenceHistory[confidenceHistory.length-1]}%</span>
              </div>
              <div className="flex items-end gap-1 h-8">
                  {confidenceHistory.map((v, i) => (
                      <div 
                        key={i} 
                        style={{ height: `${v}%` }} 
                        className={cn(
                            "flex-1 rounded-t-sm transition-all duration-500",
                            v > 80 ? "bg-emerald-500/40" : v > 50 ? "bg-amber-500/40" : "bg-rose-500/40"
                        )}
                      />
                  ))}
              </div>
          </div>
      )}
    </div>
  )
}
