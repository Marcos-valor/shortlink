import './style.css'
import { ThemeManager } from './theme.js'
import { AuthManager } from './auth.js'
import { URLShortener } from './urlShortener.js'
import { HistoryManager } from './history.js'
import { database } from './database.js'

class App {
  constructor() {
    this.themeManager = new ThemeManager()
    this.authManager = new AuthManager()
    this.urlShortener = new URLShortener()
    this.historyManager = new HistoryManager()
    
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.themeManager.init()
    this.authManager.init()
    this.urlShortener.init()
    this.historyManager.init()
  }

  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle')
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.themeManager.toggle()
      })
    }

    // Auth events
    const loginBtn = document.getElementById('login-btn')
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        this.authManager.signIn()
      })
    }

    const logoutBtn = document.getElementById('logout-btn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.authManager.signOut()
      })
    }

    // History modal
    const historyBtn = document.getElementById('history-btn')
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        this.historyManager.showModal()
      })
    }

    const closeHistory = document.getElementById('close-history')
    if (closeHistory) {
      closeHistory.addEventListener('click', () => {
        this.historyManager.hideModal()
      })
    }

    const modalOverlay = document.querySelector('.modal-overlay')
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => {
        this.historyManager.hideModal()
      })
    }

    // URL form
    const urlForm = document.getElementById('url-form')
    if (urlForm) {
      urlForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const urlInput = document.getElementById('url-input')
        const aliasInput = document.getElementById('alias-input')
        
        if (urlInput && aliasInput) {
          const url = urlInput.value
          const alias = aliasInput.value
          
          const result = await this.urlShortener.shortenURL(url, alias)
          if (result) {
            // URL is automatically saved to database in urlShortener
            // No need to manually add to history here
          }
        }
      })
    }

    // Copy button
    const copyBtn = document.getElementById('copy-btn')
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.copyToClipboard()
      })
    }

    // Close result
    const closeResult = document.getElementById('close-result')
    if (closeResult) {
      closeResult.addEventListener('click', () => {
        this.urlShortener.hideResult()
      })
    }

    // User menu toggle
    document.addEventListener('click', (e) => {
      const userMenu = document.getElementById('user-menu')
      if (userMenu) {
        const userInfo = userMenu.querySelector('.user-info')
        
        if (userInfo && userInfo.contains(e.target)) {
          userMenu.classList.toggle('show-dropdown')
        } else if (!userMenu.contains(e.target)) {
          userMenu.classList.remove('show-dropdown')
        }
      }
    })
  }

  async copyToClipboard() {
    const shortUrlElement = document.getElementById('short-url')
    const copyBtn = document.getElementById('copy-btn')
    
    if (!shortUrlElement || !copyBtn) return

    const shortUrl = shortUrlElement.textContent
    const copyIcon = copyBtn.querySelector('.copy-icon')
    const checkIcon = copyBtn.querySelector('.check-icon')
    const copyText = copyBtn.querySelector('.copy-text')

    try {
      await navigator.clipboard.writeText(shortUrl)
      
      // Show success state
      if (copyIcon) copyIcon.classList.add('hidden')
      if (checkIcon) checkIcon.classList.remove('hidden')
      if (copyText) copyText.textContent = '¡Copiado!'
      copyBtn.classList.add('copied')

      // Reset after 2 seconds
      setTimeout(() => {
        if (copyIcon) copyIcon.classList.remove('hidden')
        if (checkIcon) checkIcon.classList.add('hidden')
        if (copyText) copyText.textContent = 'Copiar'
        copyBtn.classList.remove('copied')
      }, 2000)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App()
})

// Global function for Google Sign-In callback
window.handleCredentialResponse = (response) => {
  if (window.app && window.app.authManager) {
    window.app.authManager.handleGoogleResponse(response)
  }
}