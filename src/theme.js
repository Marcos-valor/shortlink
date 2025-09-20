export class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light'
  }

  init() {
    this.applyTheme(this.currentTheme)
    this.updateToggleIcon()
  }

  toggle() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light'
    this.applyTheme(this.currentTheme)
    this.updateToggleIcon()
    localStorage.setItem('theme', this.currentTheme)
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
  }

  updateToggleIcon() {
    const themeToggle = document.getElementById('theme-toggle')
    const sunIcon = themeToggle.querySelector('.sun-icon')
    const moonIcon = themeToggle.querySelector('.moon-icon')

    if (this.currentTheme === 'dark') {
      sunIcon.classList.remove('hidden')
      moonIcon.classList.add('hidden')
    } else {
      sunIcon.classList.add('hidden')
      moonIcon.classList.remove('hidden')
    }
  }

  getCurrentTheme() {
    return this.currentTheme
  }
}