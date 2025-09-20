import { database } from './database.js'

export class URLShortener {
  constructor() {
    this.baseUrl = 'https://short.ly/'
  }

  init() {
    // Initialize URL shortener
  }

  async shortenURL(originalUrl, customAlias = '') {
    const shortenBtn = document.getElementById('shorten-btn')

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
      const authManager = window.app?.authManager
      const user = authManager?.getUser()
      const userId = user?.id || null

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
    const btnText = shortenBtn.querySelector('.btn-text')
    const btnLoader = shortenBtn.querySelector('.btn-loader')

    if (loading) {
      btnText.classList.add('hidden')
      btnLoader.classList.remove('hidden')
      shortenBtn.disabled = true
    } else {
      btnText.classList.remove('hidden')
      btnLoader.classList.add('hidden')
      shortenBtn.disabled = false
    }
  }

  showResult(result) {
    const resultSection = document.getElementById('result-section')
    const shortUrlElement = document.getElementById('short-url')
    const originalUrlElement = document.getElementById('original-url')

    shortUrlElement.textContent = result.shortUrl
    originalUrlElement.textContent = result.originalUrl

    resultSection.classList.remove('hidden')
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

    // Clear form
    document.getElementById('url-input').value = ''
    document.getElementById('alias-input').value = ''
  }

  hideResult() {
    const resultSection = document.getElementById('result-section')
    resultSection.classList.add('hidden')
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