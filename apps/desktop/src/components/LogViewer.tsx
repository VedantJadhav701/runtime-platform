import { Terminal, Cpu } from 'lucide-react'
import { cn } from '../lib/utils'
import { TelemetryEvent } from '../hooks/useTelemetry'

interface LogViewerProps {
  events: TelemetryEvent[]
}

export function LogViewer({ events }: LogViewerProps) {
  const getEventColor = (event: TelemetryEvent) => {
    const phase = event.phase.toLowerCase()
    const type = event.event_type.toLowerCase()

    if (phase === 'repairing' || phase === 'rollback' || phase === 'failed' || type === 'error') {
      return 'text-rose-500' // Red
    }
    if (phase === 'bootstrapping' || phase === 'executing' || phase === 'provisioning') {
      return 'text-blue-400' // Blue
    }
    if (phase === 'validating' || phase === 'completed' || phase === 'delivered' || phase === 'delivering') {
      return 'text-emerald-400' // Emerald
    }
    return 'text-slate-500'
  }

  return (
    <section className="md:col-span-2 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Terminal className="w-4 h-4" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Execution Telemetry</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/50">
            <Cpu className="w-3 h-3" /> KERNEL_BUS_01
        </div>
      </div>
      <div className="flex-1 bg-black/40 rounded-xl border border-border p-4 font-mono text-[11px] overflow-y-auto min-h-[500px] shadow-inner">
        {events.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-muted-foreground italic opacity-50">Awaiting kernel telemetry...</span>
          </div>
        ) : (
          events.map((event, i) => (
            <div key={i} className="mb-2 group animate-in fade-in slide-in-from-left-1 duration-200">
              <div className="flex items-start gap-3">
                <span className="text-slate-700 shrink-0 select-none">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={cn("shrink-0 font-black uppercase text-[9px] w-20 pt-0.5", getEventColor(event))}>
                    [{event.phase}]
                </span>
                <div className="flex-1">
                    <span className="text-slate-200 leading-relaxed">{event.message}</span>
                    {Object.keys(event.data).length > 0 && (
                        <div className="mt-1 text-[10px] text-slate-500 italic bg-white/5 p-2 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-slate-600 block mb-1 uppercase font-bold text-[8px]">Payload:</span>
                            {JSON.stringify(event.data, null, 2)}
                        </div>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
