export class HistoryManager {
  constructor() {
    this.history = this.loadHistory()
  }

  init() {
    // Initialize history manager
  }

  loadHistory() {
    const saved = localStorage.getItem('urlHistory')
    return saved ? JSON.parse(saved) : []
  }

  saveHistory() {
    localStorage.setItem('urlHistory', JSON.stringify(this.history))
  }

  addToHistory(urlData) {
    // Add timestamp and ID
    const historyItem = {
      ...urlData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }

    this.history.unshift(historyItem)
    
    // Keep only last 50 items
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50)
    }

    this.saveHistory()
  }

  removeFromHistory(id) {
    this.history = this.history.filter(item => item.id !== id)
    this.saveHistory()
    this.renderHistory()
  }

  clearHistory() {
    this.history = []
    this.saveHistory()
    this.renderHistory()
  }

  showModal() {
    const modal = document.getElementById('history-modal')
    modal.classList.remove('hidden')
    document.body.style.overflow = 'hidden'
    this.renderHistory()
  }

  hideModal() {
    const modal = document.getElementById('history-modal')
    modal.classList.add('hidden')
    document.body.style.overflow = ''
  }

  renderHistory() {
    const historyList = document.getElementById('history-list')
    const emptyState = document.getElementById('empty-history')

    if (this.history.length === 0) {
      historyList.innerHTML = ''
      emptyState.classList.remove('hidden')
      return
    }

    emptyState.classList.add('hidden')
    
    historyList.innerHTML = this.history.map(item => `
      <div class="history-item" data-id="${item.id}">
        <div class="history-item-content">
          <div class="history-urls">
            <div class="short-url-display">
              <span class="short-url">${item.shortUrl}</span>
              <button class="copy-history-btn" data-url="${item.shortUrl}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            <div class="original-url-display">
              <span class="original-url">${this.truncateUrl(item.originalUrl, 60)}</span>
            </div>
          </div>
          <div class="history-meta">
            <span class="history-date">${this.formatDate(item.createdAt)}</span>
            <span class="history-clicks">${item.clicks || 0} clicks</span>
          </div>
        </div>
        <button class="delete-history-btn" data-id="${item.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"></path>
          </svg>
        </button>
      </div>
    `).join('')

    // Add event listeners
    this.addHistoryEventListeners()
  }

  addHistoryEventListeners() {
    // Copy buttons
    document.querySelectorAll('.copy-history-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const url = btn.dataset.url
        
        try {
          await navigator.clipboard.writeText(url)
          
          // Show feedback
          const originalIcon = btn.innerHTML
          btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          `
          btn.classList.add('copied')

          setTimeout(() => {
            btn.innerHTML = originalIcon
            btn.classList.remove('copied')
          }, 1500)
        } catch (err) {
          console.error('Error copying to clipboard:', err)
        }
      })
    })

    // Delete buttons
    document.querySelectorAll('.delete-history-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = btn.dataset.id
        
        if (confirm('¿Estás seguro de que quieres eliminar esta URL de tu historial?')) {
          this.removeFromHistory(id)
        }
      })
    })
  }

  truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + '...'
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return 'Hoy'
    } else if (diffDays === 2) {
      return 'Ayer'
    } else if (diffDays <= 7) {
      return `Hace ${diffDays - 1} días`
    } else {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  getHistory() {
    return this.history
  }
}