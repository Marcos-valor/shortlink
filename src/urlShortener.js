export class URLShortener {
  constructor() {
    this.baseUrl = 'https://short.ly/'
  }

  init() {
    // Initialize URL shortener
  }

  async shortenURL(originalUrl, customAlias = '') {
    const shortenBtn = document.getElementById('shorten-btn')
    const btnText = shortenBtn.querySelector('.btn-text')
    const btnLoader = shortenBtn.querySelector('.btn-loader')

    // Show loading state
    this.setLoadingState(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Generate short URL
      const shortCode = customAlias || this.generateShortCode()
      const shortUrl = this.baseUrl + shortCode

      // Validate URL
      if (!this.isValidURL(originalUrl)) {
        throw new Error('URL no válida')
      }

      // Check if custom alias is available (simulate)
      if (customAlias && !this.isAliasAvailable(customAlias)) {
        throw new Error('El alias ya está en uso')
      }

      const result = {
        originalUrl,
        shortUrl,
        shortCode,
        createdAt: new Date().toISOString(),
        clicks: 0
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

  isAliasAvailable(alias) {
    // Simulate checking if alias is available
    // In a real app, this would check against a database
    const unavailableAliases = ['admin', 'api', 'www', 'test', 'demo']
    return !unavailableAliases.includes(alias.toLowerCase())
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