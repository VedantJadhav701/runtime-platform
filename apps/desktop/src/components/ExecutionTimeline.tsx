import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, Clock, AlertCircle, Wrench, PlayCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { TelemetryEvent } from '../hooks/useTelemetry'

interface ExecutionNode {
  id: string
  action: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  params: Record<string, any>
  output?: any
  error?: string
}

interface ExecutionTimelineProps {
  events: TelemetryEvent[]
}

export function ExecutionTimeline({ events }: ExecutionTimelineProps) {
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null)

  const nodes = useMemo(() => {
    const graphNodes: Record<string, ExecutionNode> = {}
    
    events.forEach(event => {
      if (event.event_type === 'node_added') {
        const node = event.data.node as ExecutionNode
        graphNodes[node.id] = node
      } else if (event.event_type === 'node_updated') {
        const { node_id, status, output, error } = event.data
        if (graphNodes[node_id]) {
          graphNodes[node_id].status = status
          if (output) graphNodes[node_id].output = output
          if (error) graphNodes[node_id].error = error
        }
      }
    })
    
    return Object.values(graphNodes)
  }, [events])

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
    const lastTransition = [...events].reverse().find(e => e.event_type === 'state_transition')
    return lastTransition ? lastTransition.phase : 'IDLE'
  }, [events])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Wrench className="w-4 h-4" />
        <h2 className="text-sm font-semibold uppercase tracking-widest">Execution Timeline</h2>
      </div>
      
      <div className="space-y-4 relative before:absolute before:left-[18px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {nodes.length === 0 ? (
          <div className="pl-10 py-4 text-sm text-muted-foreground italic">
            Waiting for nodes to be dispatched...
          </div>
        ) : (
          nodes.map((node) => {
            const isExpanded = expandedNodeId === node.id;
            return (
            <div 
              key={node.id} 
              className={cn(
                "relative pl-10 transition-all duration-500",
                node.status === 'running' && "animate-in fade-in zoom-in-95"
              )}
            >
              <div className="absolute left-0 top-1 z-10 bg-background p-1">
                {getStatusIcon(node.status)}
              </div>
              
              <div 
                onClick={() => setExpandedNodeId(isExpanded ? null : node.id)}
                className={cn(
                "p-4 bg-card rounded-xl border transition-all duration-500 cursor-pointer hover:border-primary/50",
                node.status === 'running' ? "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "border-border",
                node.status === 'running' && currentPhase === 'REPAIRING' ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "",
                node.status === 'running' && "animate-pulse"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <h3 className="font-bold text-sm tracking-tight">{node.action}</h3>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    node.status === 'completed' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                    node.status === 'failed' && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                    node.status === 'running' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                    node.status === 'running' && currentPhase === 'REPAIRING' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                    node.status === 'pending' && "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  )}>
                    {node.status}
                  </span>
                </div>
                
                {node.params && Object.keys(node.params).length > 0 && (
                  <div className="text-[10px] text-muted-foreground font-mono mt-1 ml-6">
                    {JSON.stringify(node.params)}
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-4 ml-6 space-y-2 border-t border-border pt-4 animate-in slide-in-from-top-2">
                    {node.output && (
                      <div>
                        <span className="text-xs font-semibold text-emerald-500 mb-1 block">Output / Artifacts:</span>
                        <pre className="text-[10px] bg-black/50 p-2 rounded border border-border overflow-x-auto text-slate-300">
                          {typeof node.output === 'object' ? JSON.stringify(node.output, null, 2) : node.output}
                        </pre>
                      </div>
                    )}
                    {node.error && (
                      <div>
                        <span className="text-xs font-semibold text-rose-500 mb-1 block">Error Trace:</span>
                        <pre className="text-[10px] bg-rose-500/10 p-2 rounded border border-rose-500/20 overflow-x-auto text-rose-400">
                          {node.error}
                        </pre>
                      </div>
                    )}
                    {!node.output && !node.error && (
                      <span className="text-xs text-muted-foreground italic">No telemetry recorded for this node.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  )
}
