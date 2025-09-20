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
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.themeManager.toggle()
    })

    // Auth events
    document.getElementById('login-btn').addEventListener('click', () => {
      this.authManager.signIn()
    })

    document.getElementById('logout-btn').addEventListener('click', () => {
      this.authManager.signOut()
    })

    // History modal
    document.getElementById('history-btn').addEventListener('click', () => {
      this.historyManager.showModal()
    })

    document.getElementById('close-history').addEventListener('click', () => {
      this.historyManager.hideModal()
    })

    document.querySelector('.modal-overlay').addEventListener('click', () => {
      this.historyManager.hideModal()
    })

    // URL form
    document.getElementById('url-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const url = document.getElementById('url-input').value
      const alias = document.getElementById('alias-input').value
      
      const result = await this.urlShortener.shortenURL(url, alias)
      if (result) {
        // URL is automatically saved to database in urlShortener
        // No need to manually add to history here
      }
    })

    // Copy button
    document.getElementById('copy-btn').addEventListener('click', () => {
      this.copyToClipboard()
    })

    // Close result
    document.getElementById('close-result').addEventListener('click', () => {
      this.urlShortener.hideResult()
    })

    // User menu toggle
    document.addEventListener('click', (e) => {
      const userMenu = document.getElementById('user-menu')
      const userInfo = userMenu.querySelector('.user-info')
      
      if (userInfo && userInfo.contains(e.target)) {
        userMenu.classList.toggle('show-dropdown')
      } else if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('show-dropdown')
      }
    })
  }

  async copyToClipboard() {
    const shortUrl = document.getElementById('short-url').textContent
    const copyBtn = document.getElementById('copy-btn')
    const copyIcon = copyBtn.querySelector('.copy-icon')
    const checkIcon = copyBtn.querySelector('.check-icon')
    const copyText = copyBtn.querySelector('.copy-text')

    try {
      await navigator.clipboard.writeText(shortUrl)
      
      // Show success state
      copyIcon.classList.add('hidden')
      checkIcon.classList.remove('hidden')
      copyText.textContent = '¡Copiado!'
      copyBtn.classList.add('copied')

      // Reset after 2 seconds
      setTimeout(() => {
        copyIcon.classList.remove('hidden')
        checkIcon.classList.add('hidden')
        copyText.textContent = 'Copiar'
        copyBtn.classList.remove('copied')
      }, 2000)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
    }
  }
}

// Initialize app
new App()

// Global function for Google Sign-In callback
window.handleCredentialResponse = (response) => {
  window.app?.authManager?.handleGoogleResponse(response)
}