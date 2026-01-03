import { supabase } from './supabase.js'
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'

marked.setOptions({
  breaks: true,
  gfm: true
})

const markdownButtons = [
  { action: 'h2', label: 'H2' },
  { action: 'bold', label: '太字' },
  { action: 'italic', label: '斜体' },
  { action: 'quote', label: '引用' },
  { action: 'list', label: '箇条書き' },
  { action: 'code', label: '`code`' },
  { action: 'codeblock', label: '```' },
  { action: 'link', label: 'リンク' },
  { action: 'image', label: '画像' }
]

function wrapSelection(textarea, prefix, suffix, placeholder) {
  const value = textarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = value.slice(start, end)
  const content = selected || placeholder
  const nextValue = value.slice(0, start) + prefix + content + suffix + value.slice(end)
  textarea.value = nextValue
  const cursorStart = start + prefix.length
  const cursorEnd = cursorStart + content.length
  textarea.focus()
  textarea.setSelectionRange(cursorStart, cursorEnd)
}

function prefixSelectionLines(textarea, prefix, placeholder) {
  const value = textarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = value.slice(start, end)
  const content = selected || placeholder
  const lines = content.split('\n').map((line) => (line ? `${prefix}${line}` : prefix.trimEnd()))
  const replaced = lines.join('\n')
  textarea.value = value.slice(0, start) + replaced + value.slice(end)
  textarea.focus()
  textarea.setSelectionRange(start, start + replaced.length)
}

function insertLink(textarea) {
  const value = textarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = value.slice(start, end) || 'リンクテキスト'
  const urlPlaceholder = 'https://example.com'
  const insertText = `[${selected}](${urlPlaceholder})`
  textarea.value = value.slice(0, start) + insertText + value.slice(end)
  const urlStart = start + selected.length + 3
  const urlEnd = urlStart + urlPlaceholder.length
  textarea.focus()
  textarea.setSelectionRange(urlStart, urlEnd)
}

function insertImage(textarea) {
  const value = textarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const altPlaceholder = '画像の説明'
  const urlPlaceholder = 'image/your-image.png'
  const insertText = `![${altPlaceholder}](${urlPlaceholder})`
  textarea.value = value.slice(0, start) + insertText + value.slice(end)
  const urlStart = start + altPlaceholder.length + 4
  const urlEnd = urlStart + urlPlaceholder.length
  textarea.focus()
  textarea.setSelectionRange(urlStart, urlEnd)
}

function applyMarkdownAction(action, textarea) {
  if (!textarea) {
    return
  }
  switch (action) {
    case 'h2':
      prefixSelectionLines(textarea, '## ', '見出し')
      break
    case 'bold':
      wrapSelection(textarea, '**', '**', '太字')
      break
    case 'italic':
      wrapSelection(textarea, '*', '*', '斜体')
      break
    case 'quote':
      prefixSelectionLines(textarea, '> ', '引用文')
      break
    case 'list':
      prefixSelectionLines(textarea, '- ', 'リスト項目')
      break
    case 'code':
      wrapSelection(textarea, '`', '`', 'code')
      break
    case 'codeblock':
      wrapSelection(textarea, '```\n', '\n```', 'code')
      break
    case 'link':
      insertLink(textarea)
      break
    case 'image':
      insertImage(textarea)
      break
    default:
      break
  }
  updatePreviewIfVisible(textarea)
}

function updateMarkdownPreview(textarea) {
  const preview = document.querySelector(`[data-preview-for="${textarea.id}"]`)
  if (!preview) {
    return
  }
  const content = textarea.value.trim()
  preview.innerHTML = content
    ? marked.parse(content)
    : '<p class="text-gray-500">プレビューがここに表示されます。</p>'
}

function updatePreviewIfVisible(textarea) {
  const preview = document.querySelector(`[data-preview-for="${textarea.id}"]`)
  if (!preview || preview.classList.contains('hidden')) {
    return
  }
  updateMarkdownPreview(textarea)
}

function buildMarkdownToolbars() {
  document.querySelectorAll('.md-toolbar').forEach((toolbar) => {
    if (toolbar.dataset.ready === 'true') {
      return
    }
    toolbar.dataset.ready = 'true'
    markdownButtons.forEach((item) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'md-btn'
      button.dataset.md = item.action
      button.textContent = item.label
      toolbar.appendChild(button)
    })
    toolbar.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-md]')
      if (!button) {
        return
      }
      const targetId = toolbar.dataset.target
      const textarea = document.getElementById(targetId)
      applyMarkdownAction(button.dataset.md, textarea)
    })
  })
}

function initMarkdownPreviewToggles() {
  document.querySelectorAll('.md-preview-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target
      const textarea = document.getElementById(targetId)
      const preview = document.querySelector(`[data-preview-for="${targetId}"]`)
      if (!textarea || !preview) {
        return
      }
      const willShow = preview.classList.contains('hidden')
      preview.classList.toggle('hidden')
      button.textContent = willShow ? 'プレビューを閉じる' : 'プレビュー'
      if (willShow) {
        updateMarkdownPreview(textarea)
      }
    })
  })
}

function bindMarkdownInputs() {
  document.querySelectorAll('.markdown-input').forEach((textarea) => {
    textarea.addEventListener('input', () => updatePreviewIfVisible(textarea))
  })
}

function initMarkdownHelpers() {
  buildMarkdownToolbars()
  initMarkdownPreviewToggles()
  bindMarkdownInputs()
}

initMarkdownHelpers()

// ログイン処理
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value
  
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  
  if (!error) {
    document.getElementById('login-screen').style.display = 'none'
    document.getElementById('admin-screen').style.display = 'block'
    hyojiKijiIchiran()
    hyojiPortfolioIchiran()
    hyojiJikatarIchiran()
  } else {
    alert('ログインに失敗しました: ' + error.message)
  }
})

// ログアウト
window.logout = async () => {
  await supabase.auth.signOut()
  location.reload()
}

// ブログ記事追加
document.getElementById('blog-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const title = document.getElementById('blog-title').value
  const content = document.getElementById('blog-content').value
  
  const { error } = await supabase.from('blog_posts').insert({ title, content })
  
  if (!error) {
    alert('投稿完了')
    e.target.reset()
    hyojiKijiIchiran()
  } else {
    alert('エラー: ' + error.message)
  }
})

// ブログ記事一覧
async function hyojiKijiIchiran() {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const tbody = document.getElementById('blog-list-admin')
  tbody.innerHTML = data?.map(kiji => `
    <tr>
      <td class="py-3 px-4 text-sm">${kiji.title}</td>
      <td class="py-3 px-4 text-sm text-gray-600">${new Date(kiji.created_at).toLocaleDateString('ja-JP')}</td>
      <td class="py-3 px-4">
        <button onclick="sakujoKiji('${kiji.id}')" class="px-4 py-2 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-colors">削除</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="3" class="py-8 text-center text-gray-500">データがありません</td></tr>'
}

// ブログ記事削除
window.sakujoKiji = async (id) => {
  if (confirm('本当に削除しますか？')) {
    await supabase.from('blog_posts').delete().eq('id', id)
    hyojiKijiIchiran()
  }
}

// ポートフォリオ追加
document.getElementById('portfolio-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const title = document.getElementById('portfolio-title').value
  const description = document.getElementById('portfolio-description').value
  const image_url = document.getElementById('portfolio-image').value
  const link_url = document.getElementById('portfolio-link').value
  
  const { error } = await supabase.from('portfolio_items').insert({ 
    title, 
    description, 
    image_url: image_url || null, 
    link_url: link_url || null 
  })
  
  if (!error) {
    alert('追加完了')
    e.target.reset()
    hyojiPortfolioIchiran()
  } else {
    alert('エラー: ' + error.message)
  }
})

// ポートフォリオ一覧
async function hyojiPortfolioIchiran() {
  const { data } = await supabase
    .from('portfolio_items')
    .select('*')
    .order('created_at', { ascending: false })

  const tbody = document.getElementById('portfolio-list-admin')
  tbody.innerHTML = data?.map(item => `
    <tr>
      <td class="py-3 px-4 text-sm">${item.title}</td>
      <td class="py-3 px-4 text-sm text-gray-600">${new Date(item.created_at).toLocaleDateString('ja-JP')}</td>
      <td class="py-3 px-4">
        <button onclick="sakujoPortfolio('${item.id}')" class="px-4 py-2 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-colors">削除</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="3" class="py-8 text-center text-gray-500">データがありません</td></tr>'
}

// ポートフォリオ削除
window.sakujoPortfolio = async (id) => {
  if (confirm('本当に削除しますか？')) {
    await supabase.from('portfolio_items').delete().eq('id', id)
    hyojiPortfolioIchiran()
  }
}

// 自語り投稿
document.getElementById('jikatar-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const title = document.getElementById('jikatar-title').value
  const content = document.getElementById('jikatar-content').value
  const tagsInput = document.getElementById('jikatar-tags').value
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : []
  
  const { error } = await supabase.from('jikatar_posts').insert({ 
    title, 
    content,
    tags: JSON.stringify(tags)
  })
  
  if (!error) {
    alert('投稿完了')
    e.target.reset()
    hyojiJikatarIchiran()
  } else {
    alert('エラー: ' + error.message)
  }
})

// 自語り一覧
async function hyojiJikatarIchiran() {
  const { data } = await supabase
    .from('jikatar_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const tbody = document.getElementById('jikatar-list-admin')
  tbody.innerHTML = data?.map(post => `
    <tr>
      <td class="py-3 px-4 text-sm">${post.title}</td>
      <td class="py-3 px-4 text-sm text-gray-600">${new Date(post.created_at).toLocaleDateString('ja-JP')}</td>
      <td class="py-3 px-4">
        <button onclick="sakujoJikatar('${post.id}')" class="px-4 py-2 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-colors">削除</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="3" class="py-8 text-center text-gray-500">データがありません</td></tr>'
}

// 自語り削除
window.sakujoJikatar = async (id) => {
  if (confirm('本当に削除しますか？')) {
    await supabase.from('jikatar_posts').delete().eq('id', id)
    hyojiJikatarIchiran()
  }
}
