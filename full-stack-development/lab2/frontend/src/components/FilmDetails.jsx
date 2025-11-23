import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getFilm, deleteFilm } from '../services/api'
import './FilmDetails.css'

function FilmDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [film, setFilm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadFilm()
  }, [id])

  const loadFilm = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFilm(id)
      setFilm(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Вы уверены, что хотите удалить фильм "${film.title}"?`)) {
      return
    }

    try {
      await deleteFilm(id)
      navigate('/')
    } catch (err) {
      alert(`Ошибка при удалении: ${err.message}`)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка данных фильма...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <Link to="/" className="btn btn-primary">Вернуться к списку</Link>
      </div>
    )
  }

  if (!film) {
    return <div className="error">Фильм не найден</div>
  }

  return (
    <div className="film-details-container">
      <div className="container">
        <div className="film-details-header">
          <Link to="/" className="back-link">← Вернуться к списку</Link>
          <div className="film-details-actions">
            <Link to={`/films/${id}/edit`} className="btn btn-primary">
              Редактировать
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              Удалить
            </button>
          </div>
        </div>

        <div className="film-details-content">
          <div className="film-details-main">
            <h1 className="film-title">{film.title}</h1>
            <div className="film-rating-large">⭐ {film.rating}</div>
          </div>

          <div className="film-info-grid">
            <div className="info-item">
              <div className="info-label">Режиссер</div>
              <div className="info-value">{film.director}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Год выпуска</div>
              <div className="info-value">{film.year}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Жанр</div>
              <div className="info-value">{film.genre}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Рейтинг</div>
              <div className="info-value">⭐ {film.rating} / 10.0</div>
            </div>
          </div>

          {film.description && (
            <div className="film-description-section">
              <h3>Описание</h3>
              <p>{film.description}</p>
            </div>
          )}

          {(film.created_at || film.updated_at) && (
            <div className="film-metadata">
              {film.created_at && (
                <div className="metadata-item">
                  <strong>Добавлено:</strong>{' '}
                  {new Date(film.created_at).toLocaleString('ru-RU')}
                </div>
              )}
              {film.updated_at && (
                <div className="metadata-item">
                  <strong>Обновлено:</strong>{' '}
                  {new Date(film.updated_at).toLocaleString('ru-RU')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilmDetails

