import { database } from './database.js'

export class AuthManager {
  constructor() {
    this.user = null
    this.isGoogleLoaded = false
  }

  init() {
    // Check if user was previously logged in
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      this.user = JSON.parse(savedUser)
      this.updateUI()
    }

    // Wait for Google API to load
    this.waitForGoogleAPI()
  }

  waitForGoogleAPI() {
    if (window.google && window.google.accounts) {
      this.isGoogleLoaded = true
      this.initializeGoogleSignIn()
    } else {
      setTimeout(() => this.waitForGoogleAPI(), 100)
    }
  }

  initializeGoogleSignIn() {
    // Note: In a real application, you would need to:
    // 1. Get a Google Client ID from Google Cloud Console
    // 2. Replace 'YOUR_GOOGLE_CLIENT_ID' in index.html with your actual client ID
    // 3. Configure authorized domains
    
    // For demo purposes, we'll simulate the Google Sign-In
    console.log('Google Sign-In would be initialized here with a real client ID')
  }

  signIn() {
    // For demo purposes, simulate Google Sign-In
    // In a real app, this would trigger the Google Sign-In flow
    this.simulateGoogleSignIn()
  }

  simulateGoogleSignIn() {
    // Simulate a successful Google Sign-In for demo
    const demoUser = {
      id: 'demo-user-123',
      name: 'Usuario Demo',
      email: 'demo@ejemplo.com',
      picture: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    }

    this.user = demoUser
    localStorage.setItem('user', JSON.stringify(demoUser))
    this.updateUI()
  }

  handleGoogleResponse(response) {
    // This would handle the actual Google Sign-In response
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      
      this.user = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      }

      localStorage.setItem('user', JSON.stringify(this.user))
      this.updateUI()
    } catch (error) {
      console.error('Error handling Google response:', error)
    }
  }

  signOut() {
    this.user = null
    localStorage.removeItem('user')
    this.updateUI()

    // Hide history modal if open
    document.getElementById('history-modal').classList.add('hidden')
  }

  updateUI() {
    const loginBtn = document.getElementById('login-btn')
    const userMenu = document.getElementById('user-menu')
    const userAvatar = document.getElementById('user-avatar')
    const userName = document.getElementById('user-name')

    if (this.user) {
      loginBtn.classList.add('hidden')
      userMenu.classList.remove('hidden')
      userAvatar.src = this.user.picture
      userName.textContent = this.user.name
    } else {
      loginBtn.classList.remove('hidden')
      userMenu.classList.add('hidden')
      userMenu.classList.remove('show-dropdown')
    }
  }

  isAuthenticated() {
    return this.user !== null
  }

  getUser() {
    return this.user
  }
}