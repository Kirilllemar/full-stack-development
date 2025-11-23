import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

// Создание экземпляра axios с базовыми настройками
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Функции для работы с API

// Получить все фильмы с фильтрацией и пагинацией
export const getFilms = async (params = {}) => {
  try {
    const response = await api.get('/films', { params })
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

// Получить фильм по ID
export const getFilm = async (id) => {
  try {
    const response = await api.get(`/films/${id}`)
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

// Создать новый фильм
export const createFilm = async (filmData) => {
  try {
    const response = await api.post('/films', filmData)
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

// Обновить фильм
export const updateFilm = async (id, filmData) => {
  try {
    const response = await api.put(`/films/${id}`, filmData)
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

// Удалить фильм
export const deleteFilm = async (id) => {
  try {
    await api.delete(`/films/${id}`)
    return true
  } catch (error) {
    throw handleError(error)
  }
}

// Поиск фильмов по названию
export const searchFilms = async (query, page = 1, size = 10) => {
  try {
    const response = await api.get(`/films/search/${encodeURIComponent(query)}`, {
      params: { page, size }
    })
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

// Получить статистику
export const getStats = async () => {
  try {
    const response = await api.get('/films/stats/overview')
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

// Обработка ошибок
const handleError = (error) => {
  if (error.response) {
    // Сервер ответил с кодом ошибки
    const message = error.response.data?.detail || error.response.data?.message || 'Ошибка сервера'
    return new Error(message)
  } else if (error.request) {
    // Запрос был отправлен, но ответа не получено
    return new Error('Не удалось подключиться к серверу. Убедитесь, что API запущен на http://localhost:8000')
  } else {
    // Что-то пошло не так при настройке запроса
    return new Error(error.message || 'Произошла ошибка')
  }
}

export default api

