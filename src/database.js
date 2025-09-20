import { createClient } from '@supabase/supabase-js'

class Database {
  constructor() {
    this.supabase = null
    this.init()
  }

  init() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    } else {
      console.warn('Supabase credentials not found. Using localStorage fallback.')
    }
  }

  // Crear una URL acortada
  async createShortUrl(originalUrl, shortCode, customAlias = null, userId = null) {
    if (!this.supabase) {
      // Fallback a localStorage si no hay Supabase
      return this.createShortUrlLocal(originalUrl, shortCode, customAlias, userId)
    }

    try {
      const { data, error } = await this.supabase
        .from('urls')
        .insert([
          {
            original_url: originalUrl,
            short_code: shortCode,
            custom_alias: customAlias,
            user_id: userId
          }
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating short URL:', error)
      throw error
    }
  }

  // Obtener URL por código corto
  async getUrlByShortCode(shortCode) {
    if (!this.supabase) {
      return this.getUrlByShortCodeLocal(shortCode)
    }

    try {
      const { data, error } = await this.supabase
        .from('urls')
        .select('*')
        .eq('short_code', shortCode)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting URL by short code:', error)
      return null
    }
  }

  // Verificar si un código corto ya existe
  async isShortCodeAvailable(shortCode) {
    if (!this.supabase) {
      return this.isShortCodeAvailableLocal(shortCode)
    }

    try {
      const { data, error } = await this.supabase
        .from('urls')
        .select('id')
        .eq('short_code', shortCode)
        .single()

      if (error && error.code === 'PGRST116') {
        // No se encontró, está disponible
        return true
      }

      return !data
    } catch (error) {
      console.error('Error checking short code availability:', error)
      return false
    }
  }

  // Obtener historial de URLs de un usuario
  async getUserUrls(userId, limit = 50) {
    if (!this.supabase) {
      return this.getUserUrlsLocal(userId)
    }

    try {
      const { data, error } = await this.supabase
        .from('urls')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting user URLs:', error)
      return []
    }
  }

  // Incrementar contador de clicks
  async incrementClicks(shortCode) {
    if (!this.supabase) {
      return this.incrementClicksLocal(shortCode)
    }

    try {
      const { error } = await this.supabase
        .rpc('increment_clicks', { short_code: shortCode })

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing clicks:', error)
    }
  }

  // Eliminar URL
  async deleteUrl(id, userId) {
    if (!this.supabase) {
      return this.deleteUrlLocal(id, userId)
    }

    try {
      const { error } = await this.supabase
        .from('urls')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting URL:', error)
      return false
    }
  }

  // Métodos de fallback para localStorage
  createShortUrlLocal(originalUrl, shortCode, customAlias, userId) {
    const urls = JSON.parse(localStorage.getItem('urls') || '[]')
    const newUrl = {
      id: Date.now().toString(),
      original_url: originalUrl,
      short_code: shortCode,
      custom_alias: customAlias,
      user_id: userId,
      clicks: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    urls.push(newUrl)
    localStorage.setItem('urls', JSON.stringify(urls))
    return newUrl
  }

  getUrlByShortCodeLocal(shortCode) {
    const urls = JSON.parse(localStorage.getItem('urls') || '[]')
    return urls.find(url => url.short_code === shortCode) || null
  }

  isShortCodeAvailableLocal(shortCode) {
    const urls = JSON.parse(localStorage.getItem('urls') || '[]')
    return !urls.some(url => url.short_code === shortCode)
  }

  getUserUrlsLocal(userId) {
    const urls = JSON.parse(localStorage.getItem('urls') || '[]')
    return urls
      .filter(url => url.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50)
  }

  incrementClicksLocal(shortCode) {
    const urls = JSON.parse(localStorage.getItem('urls') || '[]')
    const urlIndex = urls.findIndex(url => url.short_code === shortCode)
    
    if (urlIndex !== -1) {
      urls[urlIndex].clicks = (urls[urlIndex].clicks || 0) + 1
      localStorage.setItem('urls', JSON.stringify(urls))
    }
  }

  deleteUrlLocal(id, userId) {
    const urls = JSON.parse(localStorage.getItem('urls') || '[]')
    const filteredUrls = urls.filter(url => !(url.id === id && url.user_id === userId))
    localStorage.setItem('urls', JSON.stringify(filteredUrls))
    return true
  }

  // Obtener estadísticas del usuario
  async getUserStats(userId) {
    if (!this.supabase) {
      return this.getUserStatsLocal(userId)
    }

    try {
      const { data, error } = await this.supabase
        .from('urls')
        .select('clicks')
        .eq('user_id', userId)

      if (error) throw error

      const totalUrls = data.length
      const totalClicks = data.reduce((sum, url) => sum + (url.clicks || 0), 0)

      return { totalUrls, totalClicks }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return { totalUrls: 0, totalClicks: 0 }
    }
  }

  getUserStatsLocal(userId) {
    const urls = JSON.parse(localStorage.getItem('urls') || '[]')
    const userUrls = urls.filter(url => url.user_id === userId)
    
    return {
      totalUrls: userUrls.length,
      totalClicks: userUrls.reduce((sum, url) => sum + (url.clicks || 0), 0)
    }
  }
}

export const database = new Database()