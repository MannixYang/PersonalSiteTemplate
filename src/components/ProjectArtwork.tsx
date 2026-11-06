import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  Command,
  FileText,
  Folder,
  Layers3,
  Plus,
  Search,
  Terminal,
} from 'lucide-react'
import type { ProjectVisual } from '../data'

const Bar = ({
  width = '100%',
  className = '',
}: {
  width?: string
  className?: string
}) => <span className={`mock-line ${className}`} style={{ width }} />

export function ProjectArtwork({ variant }: { variant: ProjectVisual }) {
  return (
    <div className={`project-art art-${variant}`} aria-hidden="true">
      <div className="art-grid" />
      {variant === 'workspace' && (
        <div className="mock-window workspace-window">
          <div className="mock-topbar">
            <div className="window-dots">
              <i />
              <i />
              <i />
            </div>
            <span>workspace / ideas</span>
            <Command size={10} />
          </div>
          <div className="workspace-body">
            <aside>
              <div className="workspace-brand">
                <Layers3 size={12} />
                workspace
              </div>
              <span className="mock-nav active">
                <Folder size={9} />
                My projects
              </span>
              <span className="mock-nav">
                <FileText size={9} />
                Quick notes
              </span>
              <span className="mock-nav">
                <Search size={9} />
                Explore
              </span>
              <div className="mock-avatar">
                M<span>Personal space</span>
              </div>
            </aside>
            <div className="mock-board">
              <div className="board-heading">
                A little space for big ideas.
                <Plus size={11} />
              </div>
              <div className="board-columns">
                {['TO EXPLORE', 'IN PROGRESS', 'DONE'].map((title, column) => (
                  <div className="board-column" key={title}>
                    <span className="board-label">
                      <i />
                      {title}
                    </span>
                    {[0, 1].map((index) => (
                      <div className="board-note" key={index}>
                        <span
                          className={`note-category note-category-${column}`}
                        />
                        <Bar width={index ? '65%' : '90%'} />
                        <Bar width="45%" />
                        <div className="note-bottom">
                          <span />
                          <i />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {variant === 'terminal' && (
        <div className="mock-window terminal-window">
          <div className="mock-topbar">
            <div className="window-dots">
              <i />
              <i />
              <i />
            </div>
            <span>~/ developer-toolkit</span>
            <Terminal size={11} />
          </div>
          <div className="terminal-content">
            <div className="terminal-comment">
              # less repetition. more creation.
            </div>
            <p>
              <b>❯</b> devkit init my-next-idea
            </p>
            <div className="terminal-logo">
              <Code2 size={28} />
              <span>
                devkit<span>the tiny developer companion</span>
              </span>
            </div>
            <div className="terminal-output">
              <span>
                <Check size={10} /> Project structure created
              </span>
              <span>
                <Check size={10} /> Dependencies resolved
              </span>
              <span>
                <Check size={10} /> Ready to make something.
              </span>
            </div>
            <p>
              <b>❯</b> <span className="terminal-caret" />
            </p>
            <span className="terminal-time">
              Done in 0.42s <span>✦</span>
            </span>
          </div>
        </div>
      )}
      {variant === 'orbital' && (
        <>
          <div className="art-orbital">
            <div className="orbital-axis" />
            {Array.from({ length: 11 }, (_, i) => (
              <div
                className="orbital-ring"
                key={i}
                style={{ transform: `rotateY(${i * 16}deg) rotateX(24deg)` }}
              />
            ))}
            <div className="orbital-point" />
          </div>
          <span className="orbital-caption">PLAY / EXPLORE / REPEAT</span>
          <span className="orbital-number">EXPERIMENT — 003</span>
        </>
      )}
      {variant === 'notes' && (
        <div className="mock-window notes-window">
          <div className="mock-topbar">
            <div className="window-dots">
              <i />
              <i />
              <i />
            </div>
            <span>quiet / a second brain</span>
            <Search size={10} />
          </div>
          <div className="notes-body">
            <aside>
              <span className="notes-title">
                <FileText size={10} />
                quiet notes
              </span>
              <span className="notes-nav">Getting started</span>
              <span className="notes-nav selected">On building things</span>
              <span className="notes-nav">Ideas & fragments</span>
              <span className="notes-nav">A reading list</span>
              <span className="notes-nav">Small discoveries</span>
            </aside>
            <div className="notes-page">
              <span className="note-kicker">THOUGHTS / 001</span>
              <h4>
                On building things<span>把想法，慢慢变成现实。</span>
              </h4>
              <Bar />
              <Bar width="90%" />
              <Bar width="97%" />
              <div className="note-quote">Good things take curiosity.</div>
              <Bar />
              <Bar width="78%" />
              <span className="note-tag"># learn in public</span>
            </div>
          </div>
        </div>
      )}
      {variant === 'dashboard' && (
        <div className="mock-window dashboard-window">
          <div className="mock-topbar">
            <div className="window-dots">
              <i />
              <i />
              <i />
            </div>
            <span>tiny monitor</span>
            <span className="monitor-dot" />
          </div>
          <div className="monitor-body">
            <div className="monitor-header">
              <span>
                System overview<span>Everything is running smoothly.</span>
              </span>
              <span className="monitor-live">LIVE</span>
            </div>
            <div className="monitor-main">
              <div className="monitor-gauge">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="41" />
                  <circle className="gauge-value" cx="50" cy="50" r="41" />
                </svg>
                <span>
                  24<small>%</small>
                  <i>CPU USAGE</i>
                </span>
              </div>
              <div className="monitor-readings">
                <div>
                  MEMORY{' '}
                  <b>
                    6.4 <small>/ 16 GB</small>
                  </b>
                  <span className="reading-track">
                    <i />
                  </span>
                </div>
                <div>
                  NETWORK{' '}
                  <b>
                    128 <small>KB/s</small>
                  </b>
                  <svg viewBox="0 0 110 25">
                    <path d="M0 19 10 17 17 21 26 9 34 15 42 7 51 19 62 11 70 14 80 3 88 12 99 7 110 10" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="monitor-footer">
              <span>
                <i /> All systems operational
              </span>
              <span>DEMO DATA</span>
            </div>
          </div>
        </div>
      )}
      {variant === 'future' && (
        <>
          <div className="future-rings">
            <span />
            <span />
            <span />
          </div>
          <div className="future-symbol">
            <Plus size={38} strokeWidth={1} />
          </div>
          <div className="future-copy">
            <span>A LITTLE CURIOSITY.</span>
            <b>Something new.</b>
            <span>
              下一次探索，未完待续
              <ArrowRight size={11} />
            </span>
          </div>
          <ArrowDownRight className="future-arrow" size={23} strokeWidth={1} />
          <div className="future-caption">
            WORK IN IMAGINATION <ChevronRight size={9} />
          </div>
        </>
      )}
    </div>
  )
}
