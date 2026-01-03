import { supabase } from './supabase.js'
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'

marked.setOptions({
  breaks: true,
  gfm: true
})

const stripMarkdown = (markdown) => {
  const html = marked.parse(markdown || '')
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const truncateText = (text, length) => {
  if (!text) {
    return ''
  }
  if (text.length <= length) {
    return text
  }
  return `${text.substring(0, length).trim()}...`
}

const iconCode = `
  <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke="currentColor">
    <path d="M9 18l-6-6 6-6"/>
    <path d="M15 6l6 6-6 6"/>
  </svg>
`

const iconChip = `
  <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>
  </svg>
`

const iconSpark = `
  <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke="currentColor">
    <path d="M12 2l2.4 6.4L21 10l-6.2 2.1L12 22l-2.8-9.9L3 10l6.6-1.6L12 2z"/>
  </svg>
`

const iconDatabase = `
  <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke="currentColor">
    <ellipse cx="12" cy="5" rx="7" ry="3"/>
    <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/>
    <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>
  </svg>
`

async function hyojiSaikinBlog() {
  const container = document.getElementById('recent-blog')
  if (!container) {
    return
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <article class="card" data-reveal>
        <h3 class="card__title">まだ記事がありません</h3>
        <p class="card__desc">新しい記事が公開されるまでお待ちください。</p>
      </article>
    `
    return
  }

  container.innerHTML = data.map((kiji, index) => `
    <article class="card" data-reveal style="--delay: ${index * 0.08}s;">
      <div class="card__meta">
        <span class="tag">${new Date(kiji.created_at).toLocaleDateString('ja-JP')}</span>
        <span class="tag">Blog</span>
      </div>
      <h3 class="card__title">${kiji.title}</h3>
      <p class="card__desc clamp-3">${truncateText(stripMarkdown(kiji.content), 160)}</p>
    </article>
  `).join('')
}

async function hyojiTechStack() {
  const container = document.getElementById('tech-stack')
  if (!container) {
    return
  }

  const techStack = [
    {
      name: 'Web UI Engineering',
      description: '情報設計から実装まで、UIの完成度を高める。',
      icon: iconCode,
      level: 88,
      tags: ['UI', 'CSS', 'JavaScript']
    },
    {
      name: 'Embedded Systems',
      description: 'マイコン制御やIoTの基礎を活かした開発。',
      icon: iconChip,
      level: 82,
      tags: ['C/C++', 'I2C', 'SPI']
    },
    {
      name: 'Game Development',
      description: '体験設計とインタラクションの研究。',
      icon: iconSpark,
      level: 76,
      tags: ['Unity', 'Physics', 'UX']
    },
    {
      name: 'Data & Infrastructure',
      description: 'データを活かすための設計と運用。',
      icon: iconDatabase,
      level: 72,
      tags: ['SQL', 'Supabase', 'Ops']
    }
  ]

  container.innerHTML = techStack.map((tech, index) => `
    <article class="card tech-card" data-reveal style="--delay: ${index * 0.08}s; --level: ${tech.level}%;">
      <div class="tech-card__icon">${tech.icon}</div>
      <h3 class="card__title">${tech.name}</h3>
      <p class="card__desc">${tech.description}</p>
      <div class="card__meta">
        ${tech.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
        <span class="tag">${tech.level}%</span>
      </div>
      <div class="tech-bar">
        <div class="tech-bar__fill"></div>
      </div>
    </article>
  `).join('')
}

hyojiSaikinBlog()
hyojiTechStack()
