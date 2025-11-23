import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getFilms, deleteFilm } from '../services/api'
import './FilmsList.css'

function FilmsList() {
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [size] = useState(12)
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState('asc')

  const navigate = useNavigate()

  // Загрузка фильмов
  const loadFilms = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFilms({
        page,
        size,
        sort_by: sortBy,
        sort_order: sortOrder
      })
      setFilms(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFilms()
  }, [page, sortBy, sortOrder])

  // Удаление фильма
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Вы уверены, что хотите удалить фильм "${title}"?`)) {
      return
    }

    try {
      await deleteFilm(id)
      setFilms(films.filter(film => film.id !== id))
      if (films.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        loadFilms()
      }
    } catch (err) {
      alert(`Ошибка при удалении: ${err.message}`)
    }
  }

  // Изменение сортировки
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  if (loading) {
    return <div className="loading">Загрузка фильмов...</div>
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>
  }

  return (
    <div className="films-list-container">
      <div className="films-header">
        <h2>Каталог фильмов</h2>
        <div className="films-controls">
          <div className="sort-controls">
            <span>Сортировка:</span>
            <button
              onClick={() => handleSortChange('title')}
              className={`sort-btn ${sortBy === 'title' ? 'active' : ''}`}
            >
              Название {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('year')}
              className={`sort-btn ${sortBy === 'year' ? 'active' : ''}`}
            >
              Год {sortBy === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('rating')}
              className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
            >
              Рейтинг {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          <Link to="/films/new" className="btn btn-primary">
            ➕ Добавить фильм
          </Link>
        </div>
      </div>

      {films.length === 0 ? (
        <div className="empty-state">
          <p>Фильмы не найдены</p>
          <Link to="/films/new" className="btn btn-primary">
            Добавить первый фильм
          </Link>
        </div>
      ) : (
        <>
          <div className="films-grid">
            {films.map(film => (
              <div key={film.id} className="film-card">
                <div className="film-card-header">
                  <h3>{film.title}</h3>
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
                  <Link to={`/films/${film.id}/edit`} className="btn btn-secondary">
                    Редактировать
                  </Link>
                  <button
                    onClick={() => handleDelete(film.id, film.title)}
                    className="btn btn-danger"
                  >
                    Удалить
                  </button>
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
                Страница {page} из {pages} (всего {total} фильмов)
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
    </div>
  )
}

export default FilmsList

