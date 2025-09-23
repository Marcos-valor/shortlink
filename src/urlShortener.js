import { database } from './database.js'

export class URLShortener {
  constructor() {
    this.baseUrl = window.location.origin + '/r/'
  }

  init() {
    // Handle redirect routes
    this.handleRedirect()
  }

  handleRedirect() {
    const path = window.location.pathname
    if (path.startsWith('/r/')) {
      const shortCode = path.substring(3) // Remove '/r/'
      if (shortCode) {
        this.redirectToOriginal(shortCode)
      }
    }
  }

  async redirectToOriginal(shortCode) {
    try {
      const urlData = await database.getUrlByShortCode(shortCode)
      if (urlData) {
        // Increment click count
        await database.incrementClicks(shortCode)
        // Redirect to original URL
        window.location.href = urlData.original_url
      } else {
        // Show 404 or redirect to home
        this.show404()
      }
    } catch (error) {
      console.error('Error redirecting:', error)
      this.show404()
    }
  }

  show404() {
    document.body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem; font-family: Inter, sans-serif;">
        <h1 style="font-size: 4rem; margin-bottom: 1rem; color: #3b82f6;">404</h1>
        <h2 style="margin-bottom: 1rem; color: #1e293b;">URL no encontrada</h2>
        <p style="margin-bottom: 2rem; color: #64748b;">La URL que buscas no existe o ha expirado.</p>
        <a href="/" style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 500;">Volver al inicio</a>
      </div>
    `
  }

  async shortenURL(originalUrl, customAlias = '') {
    // Show loading state
    this.setLoadingState(true)

    try {
      // Validate URL
      if (!this.isValidURL(originalUrl)) {
        throw new Error('URL no válida')
      }

      // Generate or use custom short code
      let shortCode = customAlias || this.generateShortCode()
      
      // Check if short code is available
      const isAvailable = await database.isShortCodeAvailable(shortCode)
      if (!isAvailable) {
        throw new Error('El alias ya está en uso')
      }

      // Get current user if authenticated
      const user = window.app && window.app.authManager ? window.app.authManager.getUser() : null
      const userId = user ? user.id : null

      // Create short URL in database
      const urlData = await database.createShortUrl(
        originalUrl,
        shortCode,
        customAlias || null,
        userId
      )

      const result = {
        id: urlData.id,
        originalUrl: urlData.original_url,
        shortUrl: this.baseUrl + urlData.short_code,
        shortCode: urlData.short_code,
        createdAt: urlData.created_at,
        clicks: urlData.clicks || 0
      }

      this.showResult(result)
      this.setLoadingState(false)

      return result

    } catch (error) {
      this.showError(error.message)
      this.setLoadingState(false)
      return null
    }
  }

  generateShortCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  isValidURL(string) {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  setLoadingState(loading) {
    const shortenBtn = document.getElementById('shorten-btn')
    if (!shortenBtn) return

    const btnText = shortenBtn.querySelector('.btn-text')
    const btnLoader = shortenBtn.querySelector('.btn-loader')

    if (loading) {
      if (btnText) btnText.classList.add('hidden')
      if (btnLoader) btnLoader.classList.remove('hidden')
      shortenBtn.disabled = true
    } else {
      if (btnText) btnText.classList.remove('hidden')
      if (btnLoader) btnLoader.classList.add('hidden')
      shortenBtn.disabled = false
    }
  }

  showResult(result) {
    const resultSection = document.getElementById('result-section')
    const shortUrlElement = document.getElementById('short-url')
    const originalUrlElement = document.getElementById('original-url')

    if (resultSection && shortUrlElement && originalUrlElement) {
      shortUrlElement.textContent = result.shortUrl
      originalUrlElement.textContent = result.originalUrl

      resultSection.classList.remove('hidden')
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

      // Clear form
      const urlInput = document.getElementById('url-input')
      const aliasInput = document.getElementById('alias-input')
      if (urlInput) urlInput.value = ''
      if (aliasInput) aliasInput.value = ''
    }
  }

  hideResult() {
    const resultSection = document.getElementById('result-section')
    if (resultSection) {
      resultSection.classList.add('hidden')
    }
  }

  showError(message) {
    // Create and show error notification
    const notification = document.createElement('div')
    notification.className = 'notification error'
    notification.innerHTML = `
      <div class="notification-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>${message}</span>
      </div>
    `

    document.body.appendChild(notification)

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100)

    // Remove after 4 seconds
    setTimeout(() => {
      notification.classList.remove('show')
      setTimeout(() => notification.remove(), 300)
    }, 4000)
  }
}