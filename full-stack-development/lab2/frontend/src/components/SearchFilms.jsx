import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { searchFilms, getFilms, getStats } from '../services/api'
import './SearchFilms.css'

function SearchFilms() {
  const [searchQuery, setSearchQuery] = useState('')
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchMode, setSearchMode] = useState('title') // 'title' или 'filter'
  const [stats, setStats] = useState(null)

  // Фильтры
  const [filters, setFilters] = useState({
    year_min: '',
    year_max: '',
    rating_min: '',
    rating_max: '',
    genre: '',
    sort_by: 'rating',
    sort_order: 'desc'
  })

  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  // Загрузка статистики
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err)
    }
  }

  // Поиск по названию
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSearchMode('title')
      const data = await searchFilms(searchQuery.trim(), page, 12)
      setFilms(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Фильтрация
  const handleFilter = async () => {
    try {
      setLoading(true)
      setError(null)
      setSearchMode('filter')
      const params = {
        page,
        size: 12,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order
      }

      if (filters.year_min) params.year_min = parseInt(filters.year_min)
      if (filters.year_max) params.year_max = parseInt(filters.year_max)
      if (filters.rating_min) params.rating_min = parseFloat(filters.rating_min)
      if (filters.rating_max) params.rating_max = parseFloat(filters.rating_max)
      if (filters.genre) params.genre = filters.genre

      const data = await getFilms(params)
      setFilms(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Очистка фильтров
  const clearFilters = () => {
    setFilters({
      year_min: '',
      year_max: '',
      rating_min: '',
      rating_max: '',
      genre: '',
      sort_by: 'rating',
      sort_order: 'desc'
    })
    setFilms([])
    setTotal(0)
    setSearchQuery('')
    setError(null)
  }

  // Изменение фильтров
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  useEffect(() => {
    if (searchMode === 'filter' && (filters.year_min || filters.year_max || filters.rating_min || filters.rating_max || filters.genre)) {
      handleFilter()
    }
  }, [filters.sort_by, filters.sort_order, page])

  return (
    <div className="search-films-container">
      <div className="container">
        <h2>Поиск и фильтрация фильмов</h2>

        {stats && (
          <div className="stats-section">
            <h3>📊 Статистика</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Всего фильмов</div>
                <div className="stat-value">{stats.total_films}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Средний рейтинг</div>
                <div className="stat-value">⭐ {stats.average_rating}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Минимальный рейтинг</div>
                <div className="stat-value">⭐ {stats.min_rating}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Максимальный рейтинг</div>
                <div className="stat-value">⭐ {stats.max_rating}</div>
              </div>
            </div>
          </div>
        )}

        {/* Поиск по названию */}
        <div className="search-section">
          <h3>🔍 Поиск по названию</h3>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введите название фильма..."
              className="search-input"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Поиск...' : 'Найти'}
            </button>
          </form>
        </div>

        {/* Фильтры */}
        <div className="filters-section">
          <h3>🔧 Фильтрация</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Год выпуска от:</label>
              <input
                type="number"
                value={filters.year_min}
                onChange={(e) => handleFilterChange('year_min', e.target.value)}
                placeholder="1888"
                min="1888"
                max="2100"
              />
            </div>
            <div className="filter-group">
              <label>Год выпуска до:</label>
              <input
                type="number"
                value={filters.year_max}
                onChange={(e) => handleFilterChange('year_max', e.target.value)}
                placeholder="2100"
                min="1888"
                max="2100"
              />
            </div>
            <div className="filter-group">
              <label>Рейтинг от:</label>
              <input
                type="number"
                step="0.1"
                value={filters.rating_min}
                onChange={(e) => handleFilterChange('rating_min', e.target.value)}
                placeholder="0.0"
                min="0"
                max="10"
              />
            </div>
            <div className="filter-group">
              <label>Рейтинг до:</label>
              <input
                type="number"
                step="0.1"
                value={filters.rating_max}
                onChange={(e) => handleFilterChange('rating_max', e.target.value)}
                placeholder="10.0"
                min="0"
                max="10"
              />
            </div>
            <div className="filter-group">
              <label>Жанр:</label>
              <input
                type="text"
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                placeholder="Например: Драма"
              />
            </div>
            <div className="filter-group">
              <label>Сортировка:</label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              >
                <option value="rating">По рейтингу</option>
                <option value="year">По году</option>
                <option value="title">По названию</option>
                <option value="id">По ID</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Порядок:</label>
              <select
                value={filters.sort_order}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
              >
                <option value="desc">По убыванию</option>
                <option value="asc">По возрастанию</option>
              </select>
            </div>
          </div>
          <div className="filters-actions">
            <button onClick={handleFilter} className="btn btn-primary" disabled={loading}>
              {loading ? 'Применение...' : 'Применить фильтры'}
            </button>
            <button onClick={clearFilters} className="btn btn-secondary">
              Очистить
            </button>
          </div>
        </div>

        {/* Результаты */}
        {error && <div className="error">{error}</div>}

        {loading && <div className="loading">Загрузка...</div>}

        {films.length > 0 && (
          <>
            <div className="results-header">
              <h3>Результаты ({total})</h3>
            </div>

            <div className="films-grid">
              {films.map(film => (
                <div key={film.id} className="film-card">
                  <div className="film-card-header">
                    <h4>{film.title}</h4>
                    <div className="film-rating">⭐ {film.rating}</div>
                  </div>
                  <div className="film-card-body">
                    <div className="film-info">
                      <p><strong>Режиссер:</strong> {film.director}</p>
                      <p><strong>Год:</strong> {film.year}</p>
                      <p><strong>Жанр:</strong> {film.genre}</p>
                      {film.description && (
                        <p className="film-description">{film.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="film-card-actions">
                    <Link to={`/films/${film.id}`} className="btn btn-primary">
                      Подробнее
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Пагинация */}
            {pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn btn-secondary"
                >
                  ← Назад
                </button>
                <span className="page-info">
                  Страница {page} из {pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pages}
                  className="btn btn-secondary"
                >
                  Вперед →
                </button>
              </div>
            )}
          </>
        )}

        {!loading && films.length === 0 && (searchQuery || filters.year_min || filters.year_max || filters.rating_min || filters.rating_max || filters.genre) && (
          <div className="empty-state">
            <p>Фильмы не найдены</p>
            <button onClick={clearFilters} className="btn btn-primary">
              Очистить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchFilms

