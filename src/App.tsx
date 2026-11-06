import { Fragment, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronDown,
  Code2,
  Copy,
  ExternalLink,
  Github,
  Globe2,
  GraduationCap,
  Heart,
  Layers3,
  Mail,
  MapPin,
  Menu,
  Sparkles,
  Terminal,
  Trophy,
  X,
} from 'lucide-react'
import { awards, journey, profile, projects, templateRepository } from './data'
import type { Project, ProjectCategory } from './data'
import { CodeSphere } from './components/CodeSphere'
import { TiltCard, usePageMotion } from './components/Motion'
import { ProjectArtwork } from './components/ProjectArtwork'

const projectFilters: { id: ProjectCategory; label: string }[] = [
  { id: 'all', label: '全部作品' },
  { id: 'web', label: 'Web 应用' },
  { id: 'tools', label: '开发工具' },
  { id: 'experiments', label: '创意实验' },
]

function SectionLabel({
  number,
  children,
}: {
  number: string
  children: ReactNode
}) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <i />
      {children}
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
  className = '',
}: {
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialog) return
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), summary, input, select, textarea, [tabindex="0"]',
        ),
      ).filter((element) => element.getClientRects().length > 0)
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (!first) {
        event.preventDefault()
        dialog.focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    dialog?.addEventListener('keydown', trapFocus)
    return () => {
      dialog?.removeEventListener('keydown', trapFocus)
      dialog?.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-inner">
        <div className="modal-controls">
          <button
            className="icon-button modal-close"
            type="button"
            onClick={onClose}
            aria-label="关闭弹窗"
            autoFocus
          >
            <X size={19} />
          </button>
        </div>
        <h2 className="sr-only" id="modal-title">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  )
}

const githubLink = profile.github || templateRepository
const githubLabel = profile.github ? '我的 GitHub' : '模板源码'
const awardYears = [...new Set(awards.map(({ year }) => year))].sort()
const awardRange =
  awardYears.length > 1
    ? `${awardYears[0]} — ${awardYears.at(-1)}`
    : (awardYears[0] ?? '')

function ProjectPreview({ project }: { project: Project }) {
  if (!project.cover) return <ProjectArtwork variant={project.visual} />
  const src = /^https?:\/\//i.test(project.cover)
    ? project.cover
    : `${import.meta.env.BASE_URL}${project.cover.replace(/^\/+/, '')}`
  return (
    <img
      src={src}
      alt=""
      className="project-cover"
      loading="lazy"
      decoding="async"
    />
  )
}

function App() {
  const [filter, setFilter] = useState<ProjectCategory>('all')
  const [journeyFilter, setJourneyFilter] = useState<
    'all' | 'work' | 'education'
  >('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showAwards, setShowAwards] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mobileMenuButton = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLElement>(null)
  usePageMotion()

  useEffect(() => {
    const sections =
      document.querySelectorAll<HTMLElement>('main > section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        }
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 },
    )
    sections.forEach((section) => observer.observe(section))
    return () => {
      observer.disconnect()
      clearTimeout(copyTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!mobileMenu) return
    const firstLink = mobileMenuRef.current?.querySelector('a')
    firstLink?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenu(false)
        mobileMenuButton.current?.focus()
      }
    }
    const onClick = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !mobileMenuRef.current?.contains(target) &&
        !mobileMenuButton.current?.contains(target)
      )
        setMobileMenu(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onClick)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onClick)
    }
  }, [mobileMenu])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setCopyFailed(false)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2600)
    } catch {
      setCopyFailed(true)
    }
  }
  const filteredProjects = projects.filter(
    (project) => filter === 'all' || project.category === filter,
  )
  const filteredJourney = journey.filter(
    (entry) => journeyFilter === 'all' || entry.type === journeyFilter,
  )
  const goTo = () => setMobileMenu(false)

  return (
    <>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <div className="ambient-background" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="page-progress" aria-hidden="true" />
      <header className="site-header">
        <div className="header-inner container">
          <a
            className="brand"
            href="#home"
            aria-label={`${profile.brand} ${profile.name}.，返回首页`}
            onClick={goTo}
          >
            <span className="brand-mark">
              <Terminal size={21} strokeWidth={2.4} />
            </span>
            <span className="brand-name">
              {profile.brand}
              <span>{profile.name}</span>
              <i>.</i>
            </span>
          </a>
          <nav className="desktop-nav" aria-label="主要导航">
            <a
              href="#projects"
              className={activeSection === 'projects' ? 'active' : ''}
              aria-current={
                activeSection === 'projects' ? 'location' : undefined
              }
            >
              <span>01</span>作品
            </a>
            <a
              href="#journey"
              className={activeSection === 'journey' ? 'active' : ''}
              aria-current={
                activeSection === 'journey' ? 'location' : undefined
              }
            >
              <span>02</span>旅程
            </a>
            <a
              href="#about"
              className={activeSection === 'about' ? 'active' : ''}
              aria-current={activeSection === 'about' ? 'location' : undefined}
            >
              <span>03</span>关于
            </a>
          </nav>
          <div className="header-actions">
            <a href="#contact" className="header-contact">
              聊一聊
              <ArrowUpRight size={15} />
            </a>
            <button
              ref={mobileMenuButton}
              className="icon-button menu-toggle"
              aria-label={mobileMenu ? '关闭导航' : '打开导航'}
              aria-expanded={mobileMenu}
              aria-controls="mobile-nav"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <nav
            ref={mobileMenuRef}
            id="mobile-nav"
            className="mobile-nav"
            aria-label="移动端导航"
          >
            <a href="#projects" onClick={goTo}>
              <span>01</span>开源作品
              <ArrowUpRight size={18} />
            </a>
            <a href="#journey" onClick={goTo}>
              <span>02</span>个人旅程
              <ArrowUpRight size={18} />
            </a>
            <a href="#about" onClick={goTo}>
              <span>03</span>关于我
              <ArrowUpRight size={18} />
            </a>
            <a href="#contact" onClick={goTo}>
              <span>04</span>保持联系
              <ArrowUpRight size={18} />
            </a>
          </nav>
        )}
      </header>

      <main id="main-content">
        <section id="home" className="hero-section container">
          <div className="hero-main">
            <div className="hero-copy">
              <div className="hero-eyebrow intro-enter">
                <span className="status-dot" />
                HELLO WORLD, I’M {profile.brand.toUpperCase()}.
                {profile.demo && (
                  <span className="template-demo">TEMPLATE DEMO</span>
                )}
              </div>
              <p className="hero-intro intro-enter">
                你好，我是<span>{profile.name}</span>
                <span className="intro-spark">✳</span>
              </p>
              <h1 className="intro-enter">
                热爱探索，
                <br />
                <span className="hero-title-line">
                  不止于代码<span className="hero-period">.</span>
                </span>
              </h1>
              <p className="hero-description intro-enter">
                一名 <strong>{profile.role}</strong>。<br />
                {profile.intro}
                <br className="desktop-break" />
                {profile.bio}
              </p>
              <div className="hero-buttons intro-enter">
                <a className="button button-primary" href="#projects">
                  探索我的作品
                  <ArrowUpRight size={17} />
                </a>
                <a className="button button-text" href="#journey">
                  我的成长轨迹
                  <ArrowRight size={16} />
                </a>
              </div>
              <div className="hero-location intro-enter">
                <MapPin size={13} />
                <span>{profile.location}</span>
                <i />
                <span>
                  {profile.demo ? '虚构资料 · 仅供演示' : '持续学习，持续构建'}
                </span>
              </div>
            </div>
            <div className="hero-art intro-enter">
              <CodeSphere
                label={profile.sphereLabel}
                caption={profile.sphereCaption}
              />
              <div className="art-footnote">
                <span className="art-footnote-line" />
                SOMEWHERE BETWEEN LOGIC & CREATIVITY
              </div>
            </div>
          </div>
          <div className="hero-bottom intro-enter">
            {profile.facts.map((fact) => (
              <div className="hero-fact" key={fact.title}>
                <span className="fact-number">
                  {fact.value}
                  {fact.suffix && <span>{fact.suffix}</span>}
                </span>
                <div>
                  <b>{fact.title}</b>
                  <span>{fact.caption}</span>
                </div>
              </div>
            ))}
            <a href="#projects" className="scroll-cue">
              <span>
                向下探索<small>SCROLL TO DISCOVER</small>
              </span>
              <span className="scroll-icon">
                <ArrowDown size={17} />
              </span>
            </a>
          </div>
        </section>

        <div className="tech-strip" aria-label="技术栈">
          <div className="tech-strip-inner container">
            <span className="tech-strip-label">
              <Code2 size={15} />
              MY TOOLBOX
            </span>
            <div
              className="tech-strip-items"
              role="group"
              aria-label="开发技术栈，可横向滚动"
              tabIndex={0}
            >
              {profile.toolkit.map((tool, index) => (
                <Fragment key={tool}>
                  {index > 0 && <i aria-hidden="true">✳</i>}
                  <span>{tool}</span>
                </Fragment>
              ))}
            </div>
            <span className="tech-strip-end">
              & ALWAYS LEARNING
              <ArrowUpRight size={12} />
            </span>
          </div>
        </div>

        <section
          id="projects"
          className="projects-section section-space container"
        >
          <div className="section-heading" data-reveal>
            <div>
              <SectionLabel number="01">SELECTED WORKS</SectionLabel>
              <h2>
                想法不止于想法<span className="heading-dot">.</span>
              </h2>
              <p>一些折腾，一些创造。把好奇心，变成看得见的东西。</p>
            </div>
            <a
              className="subtle-link"
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={16} />
              {githubLabel}
              <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="projects-toolbar" data-reveal>
            <div className="filter-tabs" role="group" aria-label="项目分类">
              {projectFilters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={filter === item.id}
                  className={filter === item.id ? 'selected' : ''}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                  <span>
                    {String(
                      projects.filter(
                        (project) =>
                          item.id === 'all' || project.category === item.id,
                      ).length,
                    ).padStart(2, '0')}
                  </span>
                </button>
              ))}
            </div>
            <span className="demo-notice">
              <span />
              {projects.every((project) => project.demo)
                ? '当前为概念 Demo · 真实项目即将补充'
                : projects.some((project) => project.demo)
                  ? '含概念 Demo · 其余为真实作品'
                  : '保持创造 · 持续更新'}
            </span>
          </div>
          <div
            className="projects-grid"
            data-reveal
            aria-live="polite"
            aria-atomic="false"
          >
            {filteredProjects.map((project, index) => (
              <TiltCard
                key={project.id}
                className="project-card"
                intensity={5}
                style={
                  {
                    '--project-accent': project.accent,
                    '--card-delay': `${index * 45}ms`,
                  } as CSSProperties
                }
              >
                <div className="project-image-wrap">
                  <ProjectPreview project={project} />
                  <button
                    className="project-art-button"
                    type="button"
                    aria-label={`预览${project.name}${project.demo ? '概念 Demo' : '项目详情'}`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <span className="art-open" aria-hidden="true">
                      <ArrowUpRight size={20} />
                    </span>
                  </button>
                  <span className="project-demo-badge">
                    {project.demo ? 'CONCEPT DEMO' : 'OPEN SOURCE'}
                  </span>
                  <span className="project-index">
                    {String(projects.indexOf(project) + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="project-content">
                  <span className="project-english">{project.english}</span>
                  <h3>
                    <button
                      className="project-title"
                      type="button"
                      onClick={() => setSelectedProject(project)}
                    >
                      <span>{project.name}</span>
                      <ArrowUpRight size={19} strokeWidth={1.6} />
                    </button>
                  </h3>
                  <p>{project.description}</p>
                  <div className="project-tags">
                    {project.stack.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="project-footer">
                  {project.website ? (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe2 size={13} />
                      上线网站
                      <ArrowUpRight size={12} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      title="概念 Demo，网站地址待补充"
                      aria-label={`${project.name}：上线网站待补充，查看 Demo 说明`}
                    >
                      <Globe2 size={13} />
                      上线网站
                      <span className="pending-dot" />
                    </button>
                  )}
                  {project.github ? (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github size={13} />
                      源码
                      <ArrowUpRight size={12} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      title="概念 Demo，GitHub 仓库待补充"
                      aria-label={`${project.name}：GitHub 仓库待补充，查看 Demo 说明`}
                    >
                      <Github size={13} />
                      GitHub
                      <ArrowUpRight size={12} />
                    </button>
                  )}
                </div>
              </TiltCard>
            ))}
          </div>
          <div className="projects-note" data-reveal>
            <span>
              <Sparkles size={14} />
              好的作品，永远是下一件。
            </span>
            <span>BUILD WITH CURIOSITY. SHARE WITH THE WORLD.</span>
          </div>
        </section>

        <section id="journey" className="journey-section section-space">
          <div className="journey-layout container">
            <div className="journey-intro" data-reveal>
              <SectionLabel number="02">THE JOURNEY</SectionLabel>
              <h2>
                每一段经历，
                <br />
                都算数<span className="heading-dot">.</span>
              </h2>
              <p>
                从第一次写下 Hello World，
                <br />
                到把复杂问题拆解成清晰的答案。
                <br />
                一路学习，一路生长。
              </p>
              <div className="journey-range">
                <span>{profile.journeyStart}</span>
                <i />
                <span>
                  {profile.journeyEnd}
                  <span className="status-dot" />
                </span>
              </div>
              <div className="journey-quote">
                <span>“</span>
                <p>
                  保持对问题的耐心，
                  <br />
                  和对世界的好奇。
                </p>
              </div>
              <a className="subtle-link" href="#honors">
                那些闪光的瞬间
                <ArrowDown size={14} />
              </a>
            </div>
            <div className="journey-content" data-reveal>
              <div className="journey-tabs" role="group" aria-label="经历分类">
                {(
                  [
                    { id: 'all', label: '全部历程', icon: Layers3 },
                    { id: 'work', label: '工作经历', icon: BriefcaseBusiness },
                    { id: 'education', label: '校园时光', icon: GraduationCap },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={journeyFilter === id ? 'selected' : ''}
                    aria-pressed={journeyFilter === id}
                    onClick={() => setJourneyFilter(id)}
                  >
                    <Icon size={14} />
                    {label}
                    <span>
                      {
                        journey.filter(
                          (item) => id === 'all' || item.type === id,
                        ).length
                      }
                    </span>
                  </button>
                ))}
              </div>
              <div className="timeline" aria-live="polite">
                {filteredJourney.map((entry) => (
                  <article
                    key={entry.id}
                    className={`timeline-item ${entry.current ? 'current' : ''}`}
                  >
                    <div className="timeline-marker">
                      {entry.type === 'work' ? (
                        <BriefcaseBusiness size={13} />
                      ) : (
                        <GraduationCap size={14} />
                      )}
                    </div>
                    <div className="timeline-meta">
                      <time>{entry.period}</time>
                      {entry.current && (
                        <span className="current-badge">
                          <i />
                          在这里，继续创造
                        </span>
                      )}
                    </div>
                    <div className="timeline-card">
                      <span className="timeline-company">
                        {entry.organization}
                      </span>
                      <h3>{entry.title}</h3>
                      <p>{entry.description}</p>
                      <div className="timeline-tags">
                        {entry.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                      {entry.details && (
                        <details className="timeline-details">
                          <summary>
                            更多校园足迹
                            <ChevronDown size={13} />
                          </summary>
                          <ul>
                            {entry.details.map((detail) => (
                              <li key={detail}>{detail}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <div className="honors-block container" id="honors" data-reveal>
            <div className="honors-header">
              <div>
                <Trophy size={17} />
                <h3>那些闪光的瞬间</h3>
                <span>ALONG THE WAY</span>
              </div>
              <button
                className="subtle-link"
                type="button"
                onClick={() => setShowAwards(true)}
              >
                查看全部 {awards.length} 项<ArrowUpRight size={14} />
              </button>
            </div>
            <div className="honors-grid">
              {awards.slice(0, 4).map((award) => (
                <div
                  className={`honor-card medal-${award.type}`}
                  key={award.title}
                >
                  <span className="honor-icon">
                    <Trophy size={19} strokeWidth={1.4} />
                  </span>
                  <span className="honor-acronym">{award.acronym}</span>
                  <span className="honor-medal">{award.medal}</span>
                  <h4>{award.title}</h4>
                  <p>
                    {award.year} · {award.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="about-section section-space container">
          <div className="section-heading" data-reveal>
            <div>
              <SectionLabel number="03">BEYOND THE CODE</SectionLabel>
              <h2>
                代码之外，也是我<span className="heading-dot">.</span>
              </h2>
              <p>认真写代码，也认真感受生活。</p>
            </div>
            <span className="small-note">A HUMAN, NOT JUST A DEVELOPER.</span>
          </div>
          <div className="about-grid" data-reveal>
            <TiltCard className="about-card about-philosophy" intensity={3}>
              <span className="about-card-icon">
                <Code2 size={20} />
              </span>
              <span className="about-card-label">HOW I BUILD</span>
              <h3>
                向下扎根，
                <br />
                向外探索。
              </h3>
              <p>
                {profile.engineering.map((line, index) => (
                  <Fragment key={line}>
                    {index > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </p>
              <div className="philosophy-code">
                <span>const</span> curiosity = <b>always_on</b>;
                <span className="code-caret" />
              </div>
              <div className="philosophy-orbit" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </TiltCard>
            <TiltCard className="about-card about-open-source" intensity={3}>
              <span className="about-card-icon">
                <Github size={20} />
              </span>
              <span className="about-card-label">LEARN. BUILD. SHARE.</span>
              <h3>
                从使用者，
                <br />
                到贡献者。
              </h3>
              <p>在真实问题中学习，也把解决方案分享回去。</p>
              <div className="contribution-list">
                {profile.contributions.map((item) => (
                  <div key={item.name}>
                    <span className="contribution-symbol">{item.mark}</span>
                    <span>
                      <b>{item.name}</b>
                      <small>{item.description}</small>
                    </span>
                    <span className="contribution-label">{item.kind}</span>
                  </div>
                ))}
              </div>
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="subtle-link"
              >
                {githubLabel}
                <ArrowUpRight size={14} />
              </a>
            </TiltCard>
            <TiltCard className="about-card about-life" intensity={3}>
              <div className="life-illustration" aria-hidden="true">
                <div className="camera-illustration">
                  <span className="camera-viewfinder" />
                  <span className="camera-shutter" />
                  <div className="camera-body">
                    <div className="camera-grip" />
                    <div className="camera-lens">
                      <i />
                      <i />
                      <i />
                    </div>
                    <span className="camera-dot" />
                  </div>
                  <span className="camera-strap" />
                </div>
                <span className="life-cross cross-a">+</span>
                <span className="life-cross cross-b">+</span>
              </div>
              <div className="life-copy">
                <span className="about-card-label">
                  <Camera size={13} />
                  OFFLINE MODE
                </span>
                <h3>
                  偶尔离线，
                  <br />
                  去收集一点生活。
                </h3>
                <div className="life-tags">
                  {profile.interests.map((interest) => (
                    <span key={interest}>{interest}</span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </div>
        </section>

        <section id="contact" className="contact-section container" data-reveal>
          <div className="contact-card">
            <div className="contact-grid" aria-hidden="true" />
            <div className="contact-top">
              <span className="contact-eyebrow">
                <span className="status-dot" />
                GOOD CONVERSATIONS START HERE.
              </span>
              <ArrowUpRight size={30} strokeWidth={1} />
            </div>
            <div className="contact-main">
              <div>
                <h2>
                  下一个好想法，
                  <br />
                  也许从一句<span>你好</span>开始。
                </h2>
                <p>聊技术、聊开源，或者只是打个招呼。很高兴认识你。</p>
              </div>
              <div className="contact-actions">
                <a
                  className="button button-primary"
                  href={`mailto:${profile.email}`}
                >
                  <Mail size={17} />
                  {profile.demo ? '试用邮件入口' : '给我写封邮件'}
                  <ArrowUpRight size={16} />
                </a>
                <button
                  className={`copy-email ${copied ? 'copied' : ''}`}
                  type="button"
                  onClick={copyEmail}
                  aria-label={`复制邮箱 ${profile.demo ? '示例 · ' : ''}${profile.email}`}
                >
                  {profile.demo && '示例 · '}
                  {profile.email}
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <span className="copy-status" role="status">
                  {copied
                    ? '邮箱地址已复制。'
                    : copyFailed
                      ? '无法自动复制，请手动选择上方邮箱。'
                      : ''}
                </span>
              </div>
            </div>
            <div className="contact-bottom">
              <span>
                <MapPin size={12} />
                {profile.location}
              </span>
              <span>LET’S MAKE SOMETHING GOOD.</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer container">
        <div className="footer-main">
          <a className="footer-brand" href="#home">
            {profile.brand}
            <span>.</span>
          </a>
          <span>认真创造，保持好奇。</span>
          <div className="footer-socials">
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`在新标签页打开${githubLabel}`}
            >
              <Github size={17} />
            </a>
            <a
              href={`mailto:${profile.email}`}
              aria-label={`发送邮件给${profile.name}${profile.demo ? '（示例）' : ''}`}
            >
              <Mail size={17} />
            </a>
            <a href="#home" className="back-top" aria-label="回到顶部">
              <ArrowUp size={16} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {profile.englishName.toUpperCase()}
          </span>
          <span>
            MADE WITH <Heart size={10} /> & A LITTLE CURIOSITY
          </span>
          <a
            href="https://deerflow.tech"
            target="_blank"
            rel="noopener noreferrer"
          >
            Created By Deerflow
            <ArrowUpRight size={10} />
          </a>
        </div>
      </footer>

      {selectedProject && (
        <Modal
          title={`${selectedProject.name} · 项目详情`}
          onClose={() => setSelectedProject(null)}
          className="project-modal"
        >
          <div
            className="modal-art"
            style={
              { '--project-accent': selectedProject.accent } as CSSProperties
            }
          >
            <ProjectPreview project={selectedProject} />
          </div>
          <div className="modal-project-content">
            <span className="modal-kicker">
              {selectedProject.demo
                ? 'CONCEPT DEMO / 概念展示'
                : 'OPEN SOURCE PROJECT'}
            </span>
            <h3>
              {selectedProject.name}
              <span>{selectedProject.english}</span>
            </h3>
            <p>{selectedProject.details}</p>
            <div className="project-tags">
              {selectedProject.stack.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="modal-links">
              {selectedProject.website ? (
                <a
                  className="button button-primary"
                  href={selectedProject.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe2 size={15} />
                  访问网站
                  <ExternalLink size={13} />
                </a>
              ) : (
                <span className="pending-link">
                  <Globe2 size={15} />
                  上线地址待补充
                </span>
              )}
              {selectedProject.github ? (
                <a
                  className="button button-outline"
                  href={selectedProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={15} />
                  GitHub 源码
                  <ExternalLink size={13} />
                </a>
              ) : (
                <span className="pending-link">
                  <Github size={15} />
                  GitHub 仓库待补充
                </span>
              )}
            </div>
            {selectedProject.demo && (
              <p className="modal-disclaimer">
                <BookOpen size={14} />
                这是界面设计样例，不代表已上线或已开源的真实项目。
              </p>
            )}
          </div>
        </Modal>
      )}
      {showAwards && (
        <Modal
          title="竞赛与荣誉"
          onClose={() => setShowAwards(false)}
          className="awards-modal"
        >
          <div className="awards-modal-header">
            <Trophy size={26} strokeWidth={1.3} />
            <span className="modal-kicker">MOMENTS THAT MATTER</span>
            <h3>每一份热爱，都有回响。</h3>
            <p>{awardRange && `${awardRange} · `}竞赛与荣誉</p>
          </div>
          <div className="awards-list">
            {awards.map((award) => (
              <div
                className="award-row"
                key={award.title + award.location + award.year}
              >
                <span className="award-year">{award.year}</span>
                <div>
                  <b>{award.title}</b>
                  <span>{award.location}</span>
                </div>
                <span className={`award-medal medal-${award.type}`}>
                  <Trophy size={12} />
                  {award.medal}
                </span>
              </div>
            ))}
          </div>
          <div className="awards-extra">
            <GraduationCap size={17} />
            <div>
              <b>不止于赛场</b>
              <p>{profile.extraHonor}</p>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default App
