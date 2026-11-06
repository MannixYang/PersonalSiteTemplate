export type ProjectCategory = 'all' | 'web' | 'tools' | 'experiments'
export type ProjectVisual =
  'workspace' | 'terminal' | 'orbital' | 'notes' | 'dashboard' | 'future'

export interface Project {
  id: string
  name: string
  english: string
  description: string
  category: Exclude<ProjectCategory, 'all'>
  stack: string[]
  cover?: string
  visual: ProjectVisual
  accent: string
  demo: boolean
  website: string | null
  github: string | null
  details: string
}

// These are explicitly fictional UI concepts, not claims about the template maintainer's work.
// Replace a record, set demo to false, and provide the real links to publish a project.
export const projects: Project[] = [
  {
    id: 'idea-workspace',
    name: '灵感工作台',
    english: 'IDEA WORKSPACE',
    description: '把零散的想法，整理成下一件值得创造的事。',
    category: 'web',
    stack: ['Web App', 'Productivity'],
    visual: 'workspace',
    accent: '#b4f590',
    demo: true,
    website: null,
    github: null,
    details:
      '一个关于灵感收集与任务管理的界面概念。以看板、轻量笔记和清晰的工作流，将脑海中的想法慢慢变成现实。这只是个人网站的展示样例，不代表已经完成或开源的项目。',
  },
  {
    id: 'developer-toolkit',
    name: '开发者工具箱',
    english: 'DEV TOOLKIT',
    description: '为日常开发减去重复，让专注留给真正的问题。',
    category: 'tools',
    stack: ['CLI', 'Developer Tools'],
    visual: 'terminal',
    accent: '#b8b1fa',
    demo: true,
    website: null,
    github: null,
    details:
      '一个终端工具的视觉探索，想象中的功能包括工程初始化、构建和工作流自动化。终端命令仅用于视觉演示；此处尚未接入真实的软件、网站或 GitHub 仓库。',
  },
  {
    id: 'visual-playground',
    name: '视觉实验场',
    english: 'VISUAL PLAYGROUND',
    description: '在数学、图形与交互之间，寻找一点新的可能。',
    category: 'experiments',
    stack: ['Creative Coding', 'Graphics'],
    visual: 'orbital',
    accent: '#e8c48c',
    demo: true,
    website: null,
    github: null,
    details:
      '一组以几何、光影和生成艺术为主题的视觉概念。卡片中的轨道图形由原生 CSS 绘制，不依赖外部图片。本卡片是可替换的项目展示 Demo。',
  },
  {
    id: 'quiet-notes',
    name: '轻量知识库',
    english: 'QUIET NOTES',
    description: '让知识有迹可循，也给思考留一点安静的空间。',
    category: 'web',
    stack: ['Markdown', 'Knowledge'],
    visual: 'notes',
    accent: '#91c8df',
    demo: true,
    website: null,
    github: null,
    details:
      '一个极简阅读与知识管理界面的概念展示。双栏布局、结构化目录和轻量标签，让内容而不是工具成为主角。这是界面 Demo，暂无在线产品或开源仓库。',
  },
  {
    id: 'tiny-monitor',
    name: '桌面小组件',
    english: 'TINY MONITOR',
    description: '用一个小小的窗口，感知系统运行的每一次脉动。',
    category: 'tools',
    stack: ['Desktop', 'Monitoring'],
    visual: 'dashboard',
    accent: '#c6acdb',
    demo: true,
    website: null,
    github: null,
    details:
      '一个系统监控面板的界面概念。图表、占用率与运行状态均为静态模拟数据，不读取访问者的设备信息。后续可以替换为真实桌面项目。',
  },
  {
    id: 'next-exploration',
    name: '下一次探索',
    english: 'THE NEXT CHAPTER',
    description: '好奇心还在继续，下一件作品正在未来等我。',
    category: 'experiments',
    stack: ['Ideas', 'Coming Next'],
    visual: 'future',
    accent: '#c8c9be',
    demo: true,
    website: null,
    github: null,
    details:
      '这张卡片为未来的真实项目预留。提供项目名称、一句话简介、上线地址和 GitHub 仓库地址后，即可在数据文件中直接更新，无需重新设计页面。',
  },
]

export const templateRepository =
  'https://github.com/MannixYang/PersonalSiteTemplate'

export const profile = {
  demo: true,
  name: '林予星',
  brand: 'Alex',
  englishName: 'Alex Lin',
  role: '前端开发工程师',
  location: '中国 · 杭州',
  email: 'alex.lin@example.com',
  github: null as string | null,
  intro: '用代码搭建实用的小工具，也给界面留一点想象空间。',
  bio: '关注设计系统、可访问性和 Web 图形。',
  seoDescription:
    '一个开源的动态个人网站模板，包含 3D 交互、项目作品矩阵与可筛选的成长时间线。',
  toolkit: ['TypeScript', 'React', 'CSS', 'Canvas', 'Vite', 'Node.js', 'Git'],
  facts: [
    {
      value: '03',
      suffix: '+',
      title: '年界面开发',
      caption: 'FROM DESIGN TO CODE',
    },
    {
      value: '06',
      suffix: '',
      title: '个作品展示示例',
      caption: 'A PLACE FOR IDEAS',
    },
  ],
  journeyStart: '2018',
  journeyEnd: 'NOW',
  sphereLabel: 'WEB',
  sphereCaption: 'DESIGN / CODE / PLAY',
  engineering: [
    '喜欢先把问题说明白，再决定怎么写代码。',
    '从组件到交互细节，重视易用性与可维护性。',
    '把验证过的方法记录下来，让下一次开发更简单。',
  ],
  contributions: [
    {
      mark: 'UI',
      name: 'Canvas Kit',
      description: '为动画组件补充键盘访问示例',
      kind: 'DEMO',
    },
    {
      mark: 'DX',
      name: 'Tiny Docs',
      description: '完善静态站点的上手指南',
      kind: 'DEMO',
    },
  ],
  interests: ['摄影', '徒步', '手冲咖啡', '科幻小说'],
  extraHonor: '学院创新实践奖学金 · 校园技术社团优秀志愿者',
}

export interface JourneyEntry {
  id: string
  type: 'work' | 'education'
  period: string
  organization: string
  title: string
  description: string
  tags: string[]
  current?: boolean
  details?: string[]
}

export const journey: JourneyEntry[] = [
  {
    id: 'design-system',
    type: 'work',
    period: '2024.07 — 至今',
    organization: '星屿工作室（示例）',
    title: '前端开发工程师',
    description:
      '维护产品的设计系统与组件库，让多个业务页面共享一致的交互和视觉语言。',
    tags: ['React', 'TypeScript', 'Design System'],
    current: true,
  },
  {
    id: 'dashboard',
    type: 'work',
    period: '2023.02 — 2024.06',
    organization: '纸舟数据（示例）',
    title: 'Web 应用开发',
    description: '搭建轻量数据看板，负责图表交互、响应式布局与加载性能优化。',
    tags: ['Canvas', 'Data Visualization', 'Web'],
  },
  {
    id: 'internship',
    type: 'work',
    period: '2022.07 — 2023.01',
    organization: '空格实验室（示例）',
    title: '前端开发实习生',
    description:
      '将设计稿转化为可访问的网页组件，并为常见页面流程编写自动化测试。',
    tags: ['JavaScript', 'CSS', 'Playwright'],
  },
  {
    id: 'web-club',
    type: 'education',
    period: '2020.09 — 2022.06',
    organization: '云岚理工学院 · Web 技术社（示例）',
    title: '技术社团负责人',
    description: '组织前端基础工作坊，和社团伙伴一起维护活动报名页。',
    tags: ['Workshops', 'Teamwork', 'Open Web'],
    details: [
      '从 HTML 和 CSS 入门课程开始，逐步增加组件化与部署实践。',
      '为每次工作坊整理课件和练习，方便新成员自学。',
    ],
  },
  {
    id: 'university',
    type: 'education',
    period: '2018.09 — 2022.06',
    organization: '云岚理工学院（示例）',
    title: '软件工程 · 本科',
    description: '学习软件工程与人机交互，用毕业设计探索轻量级知识管理。',
    tags: ['Software Engineering', 'HCI', '创新实践奖学金'],
    details: [
      '毕业设计：面向小型团队的本地优先笔记工具。',
      '参与学院志愿活动，协助维护校园活动资讯。',
    ],
  },
  {
    id: 'creative-lab',
    type: 'education',
    period: '2018.10 — 2020.05',
    organization: '光隙影像社（示例）',
    title: '视觉与影像创作',
    description: '尝试校园纪实、平面设计和动态海报，将视觉语言带进日常开发。',
    tags: ['Photography', 'Visual Design', 'Motion'],
  },
]

export const awards = [
  {
    year: '2022',
    acronym: 'DESIGN',
    title: '校园交互设计挑战',
    location: '团队组',
    medal: '金奖',
    type: 'gold',
  },
  {
    year: '2021',
    acronym: 'WEB',
    title: '学生网页创作大赛',
    location: '区域赛 · 应用组',
    medal: '银奖',
    type: 'silver',
  },
  {
    year: '2021',
    acronym: 'BUILD',
    title: '校园创意编程周',
    location: '可视化赛道',
    medal: '优胜奖',
    type: 'bronze',
  },
  {
    year: '2020',
    acronym: 'MAKER',
    title: '青年创客展示日',
    location: '原型展示组',
    medal: '评审推荐',
    type: 'silver',
  },
  {
    year: '2019',
    acronym: 'IDEA',
    title: '学院创新实践项目',
    location: '校级 · 产品组',
    medal: '优秀项目',
    type: 'gold',
  },
  {
    year: '2019',
    acronym: 'PHOTO',
    title: '校园影像征集',
    location: '纪实摄影组',
    medal: '入选',
    type: 'bronze',
  },
]
