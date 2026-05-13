import { Shield, Zap, Lock, RefreshCw } from 'lucide-react'

export function StatusCard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Infrastructure Governance</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground flex items-center gap-2">
                <Lock className="w-3 h-3" /> Sandbox Isolation
            </span>
            <span className="text-emerald-500 font-bold font-mono px-1.5 py-0.5 bg-emerald-500/10 rounded">ENFORCED</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground flex items-center gap-2">
                <Zap className="w-3 h-3" /> Policy Enforcement
            </span>
            <span className="text-blue-500 font-bold font-mono px-1.5 py-0.5 bg-blue-500/10 rounded">ACTIVE</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground flex items-center gap-2">
                <RefreshCw className="w-3 h-3" /> Recovery Routing
            </span>
            <span className="text-emerald-500 font-bold font-mono px-1.5 py-0.5 bg-emerald-500/10 rounded">READY</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-secondary/20 rounded-xl border border-dashed border-border">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Attestation Status</h4>
        <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                <div className="w-[100%] h-full bg-emerald-500 animate-pulse"></div>
            </div>
            <span className="text-[10px] font-mono text-emerald-500">SHA-256 VERIFIED</span>
        </div>
      </div>
    </div>
  )
}
