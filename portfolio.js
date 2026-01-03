import { supabase } from './supabase.js'
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'

marked.setOptions({
  breaks: true,
  gfm: true
})

const previewImages = [
  'image/portfolio-bg-1280x720.png',
  'image/portfolio-hero-1600x900.png',
  'image/grad-linear_teal-1920x1080.png',
  'image/grad-linear_cyan-1920x1080.png'
]

const container = document.getElementById('portfolio-list')
const viewToggle = document.querySelector('[data-view-toggle="portfolio"]')
const modal = document.getElementById('content-modal')
const modalImage = document.getElementById('content-modal-image')
const modalMeta = document.getElementById('content-modal-meta')
const modalTitle = document.getElementById('content-modal-title')
const modalBody = document.getElementById('content-modal-body')
const modalActions = document.getElementById('content-modal-actions')

const viewKey = 'portfolio-view'
let currentView = 'grid'
let projectsCache = []

const getStoredView = () => {
  const saved = localStorage.getItem(viewKey)
  return saved === 'list' ? 'list' : 'grid'
}

const setContainerView = (view) => {
  if (!container) {
    return
  }
  container.classList.toggle('is-grid', view === 'grid')
  container.classList.toggle('is-list', view === 'list')
}

const setToggleState = (view) => {
  if (!viewToggle) {
    return
  }
  viewToggle.querySelectorAll('button[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view)
    button.setAttribute('aria-pressed', button.dataset.view === view ? 'true' : 'false')
  })
}

const setView = (view) => {
  currentView = view === 'list' ? 'list' : 'grid'
  localStorage.setItem(viewKey, currentView)
  setContainerView(currentView)
  setToggleState(currentView)
  renderProjects()
}

const formatDate = (dateString) => {
  if (!dateString) {
    return ''
  }
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}

const stripMarkdown = (markdown) => {
  if (!markdown) {
    return ''
  }
  const html = marked.parse(markdown)
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const buildExcerpt = (markdown, limit) => {
  const text = stripMarkdown(markdown)
  if (text.length <= limit) {
    return text
  }
  return `${text.slice(0, limit)}...`
}

const getPreviewImage = (project, index) => project.image_url || previewImages[index % previewImages.length]

const buildCard = (project, index) => {
  const excerptLimit = currentView === 'list' ? 200 : 110
  const imageUrl = getPreviewImage(project, index)
  return `
    <article class="post-card" data-post-id="${project.id}" data-index="${index}" data-reveal style="--delay: ${index * 0.05}s;">
      <img class="post-thumb" src="${imageUrl}" alt="${project.title || 'Project'}" loading="lazy" decoding="async">
      <div class="post-content">
        <div class="card__meta">
          <span class="tag">${formatDate(project.created_at)}</span>
          <span class="tag">Project</span>
        </div>
        <h3 class="post-title">${project.title || 'Untitled'}</h3>
        <p class="post-excerpt">${buildExcerpt(project.description || '', excerptLimit)}</p>
      </div>
    </article>
  `
}

const renderProjects = () => {
  if (!container) {
    return
  }
  if (!projectsCache || projectsCache.length === 0) {
    container.innerHTML = `
      <article class="empty-state" data-reveal>
        <h3 class="section-title">まだプロジェクトがありません</h3>
        <p class="section-lead">制作物が公開されるまでお待ちください。</p>
      </article>
    `
    return
  }
  container.innerHTML = projectsCache.map((project, index) => buildCard(project, index)).join('')
}

const openModal = (project, index) => {
  if (!modal || !modalTitle || !modalBody || !modalImage) {
    return
  }
  const imageUrl = getPreviewImage(project, index)
  modalImage.src = imageUrl
  modalImage.alt = project.title || 'Project'
  if (modalMeta) {
    modalMeta.textContent = formatDate(project.created_at)
  }
  modalTitle.textContent = project.title || 'Untitled'
  modalBody.innerHTML = marked.parse(project.description || '')
  if (modalActions) {
    modalActions.innerHTML = project.link_url
      ? `<a class="content-modal__link" href="${project.link_url}" target="_blank" rel="noopener">詳細を見る →</a>`
      : ''
  }
  modal.classList.add('is-open')
  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('modal-open')
}

const closeModal = () => {
  if (!modal) {
    return
  }
  modal.classList.remove('is-open')
  modal.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('modal-open')
}

const bindModal = () => {
  if (!modal) {
    return
  }
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('[data-modal-close]')) {
      closeModal()
    }
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal()
    }
  })
}

const bindCards = () => {
  if (!container) {
    return
  }
  container.addEventListener('click', (event) => {
    const card = event.target.closest('[data-post-id]')
    if (!card || !container.contains(card)) {
      return
    }
    const projectId = card.dataset.postId
    const index = Number(card.dataset.index || 0)
    const project = projectsCache.find((item) => String(item.id) === projectId)
    if (!project) {
      return
    }
    openModal(project, index)
  })
}

const bindViewToggle = () => {
  if (!viewToggle) {
    return
  }
  viewToggle.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-view]')
    if (!button) {
      return
    }
    setView(button.dataset.view)
  })
}

async function hyojiPortfolioIchiran() {
  if (!container) {
    return
  }

  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    container.innerHTML = `
      <article class="empty-state" data-reveal>
        <h3 class="section-title">読み込みに失敗しました</h3>
        <p class="section-lead">時間を置いて再度お試しください。</p>
      </article>
    `
    return
  }

  projectsCache = data || []
  renderProjects()
}

currentView = getStoredView()
setContainerView(currentView)
setToggleState(currentView)
bindViewToggle()
bindCards()
bindModal()
hyojiPortfolioIchiran()
