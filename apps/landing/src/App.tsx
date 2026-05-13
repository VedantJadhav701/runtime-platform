import React from 'react';
import { 
  Zap, 
  Shield, 
  History, 
  Activity, 
  Lock, 
  RefreshCcw, 
  GitBranch, 
  BarChart3,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-content">
          <div className="logo">
            <Cpu className="icon-primary" />
            <span>Antigravity <span className="text-dim">Runtime</span></span>
          </div>
          <div className="nav-links">
            <a href="#features">Infrastructure</a>
            <a href="#replay">Replay</a>
            <a href="#benchmarks">Benchmarks</a>
            <button className="btn-primary">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge">PRODUCTION READY v2.0</div>
          <h1>Autonomous Local <br/> <span className="text-gradient">Execution Infrastructure</span></h1>
          <p>
            Deterministic orchestration for the next generation of autonomous systems. 
            Build, validate, and repair infrastructure with absolute operational trust.
          </p>
          <div className="hero-actions">
            <button className="btn-large">Explore the Architecture</button>
            <button className="btn-outline">View Golden Workflow</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="grid-background"></div>
          <div className="terminal-mock">
            <div className="terminal-header">
              <div className="dots"><span></span><span></span><span></span></div>
              <div className="title">agrt --golden-workflow</div>
            </div>
            <div className="terminal-body font-mono">
              <div className="line"><span className="text-emerald-500">INIT</span> Infrastructure Bootstrap... OK</div>
              <div className="line"><span className="text-blue-500">STEP</span> Intent Compilation... DONE</div>
              <div className="line"><span className="text-amber-500">WARN</span> Missing Dependency: fastapi</div>
              <div className="line"><span className="text-purple-500">HEAL</span> Routing Repair Strategy... SUCCESS</div>
              <div className="line"><span className="text-emerald-500">DONE</span> Confidence Score: 98/100</div>
              <div className="cursor"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Engineered for Operational Trust</h2>
          <p>Beyond AI. We focus on the deterministic primitives required for reliable autonomous execution.</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <Shield className="feature-icon" />
            <h3>Governed Recovery</h3>
            <p>Tiered watchdog policies and SIGKILL escalation ensure no orphan processes or resource leaks.</p>
          </div>
          <div className="feature-card">
            <Lock className="feature-icon" />
            <h3>Environment Attestation</h3>
            <p>Cryptographic SHA-256 hashing detects and repairs environment tampering in real-time.</p>
          </div>
          <div className="feature-card">
            <History className="feature-icon" />
            <h3>Time-Travel Replay</h3>
            <p>Audit every micro-step of the execution lifecycle with sub-millisecond telemetry fidelity.</p>
          </div>
          <div className="feature-card">
            <RefreshCcw className="feature-icon" />
            <h3>Autonomous Repair</h3>
            <p>Failure taxonomy-driven routing automatically heals dependency and configuration drifts.</p>
          </div>
          <div className="feature-card">
            <GitBranch className="feature-icon" />
            <h3>Confidence Delivery</h3>
            <p>Only high-confidence builds reach the delivery phase, backed by empirical validation grounding.</p>
          </div>
          <div className="feature-card">
            <BarChart3 className="feature-icon" />
            <h3>Real-time Telemetry</h3>
            <p>Structured event bus providing absolute visibility into the kernel's decision matrix.</p>
          </div>
        </div>
      </section>

      {/* Execution Lifecycle */}
      <section className="lifecycle">
        <div className="lifecycle-container">
          <div className="lifecycle-text">
            <h2>Execution Lifecycle</h2>
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-content">
                <h4>Intent Scaffolding</h4>
                <p>AI-driven intent is compiled into a deterministic execution graph.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div className="step-content">
                <h4>Sandbox Provisioning</h4>
                <p>Isolated virtual environments are bootstrapped and attested.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div className="step-content">
                <h4>Judge & Repair Loop</h4>
                <p>Execution is continuously validated and autonomously repaired until stable.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">04</div>
              <div className="step-content">
                <h4>Verified Delivery</h4>
                <p>Validated artifacts are atomically pushed to remote infrastructure.</p>
              </div>
            </div>
          </div>
          <div className="lifecycle-visual">
            <div className="pulse-circle"></div>
            <Zap className="zap-icon" />
          </div>
        </div>
      </section>

      {/* Replay Engine */}
      <section id="replay" className="replay-promo">
        <div className="replay-content">
          <h2>The Replay Engine</h2>
          <p>
            Experience absolute observability. The Antigravity Replay Engine reconstructs 
            execution timelines from telemetry snapshots, allowing for granular audit 
            of every autonomous decision.
          </p>
          <ul className="check-list">
            <li><CheckCircle2 /> Interactive Timeline Scrubbing</li>
            <li><CheckCircle2 /> Confidence Evolution Tracking</li>
            <li><CheckCircle2 /> Repair Event Highlighting</li>
            <li><CheckCircle2 /> Artifact Delta Inspection</li>
          </ul>
        </div>
        <div className="replay-ui-preview">
          {/* UI Mockup */}
          <div className="ui-mockup">
             <div className="ui-sidebar"></div>
             <div className="ui-main">
                <div className="ui-timeline">
                   <div className="ui-node active">SCAFFOLD</div>
                   <div className="ui-node active">BOOTSTRAP</div>
                   <div className="ui-node error">JUDGE</div>
                   <div className="ui-node repair">REPAIR</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <Cpu className="icon-dim" />
            <span>Antigravity Runtime</span>
          </div>
          <p>© 2026 Antigravity Infrastructure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
