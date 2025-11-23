import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { createFilm, updateFilm, getFilm } from '../services/api'
import './FilmForm.css'

function FilmForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    title: '',
    director: '',
    year: new Date().getFullYear(),
    rating: 0.0,
    genre: '',
    description: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingFilm, setLoadingFilm] = useState(isEditing)
  const [error, setError] = useState(null)

  // Загрузка данных фильма для редактирования
  useEffect(() => {
    if (isEditing) {
      loadFilm()
    }
  }, [id])

  const loadFilm = async () => {
    try {
      setLoadingFilm(true)
      const film = await getFilm(id)
      setFormData({
        title: film.title || '',
        director: film.director || '',
        year: film.year || new Date().getFullYear(),
        rating: film.rating || 0.0,
        genre: film.genre || '',
        description: film.description || ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingFilm(false)
    }
  }

  // Обработка изменений в форме
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'rating' 
        ? (name === 'year' ? parseInt(value) || 0 : parseFloat(value) || 0.0)
        : value
    }))
    // Очистка ошибки для поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // Валидация формы
  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Название не должно превышать 200 символов'
    }

    if (!formData.director.trim()) {
      newErrors.director = 'Режиссер обязателен'
    } else if (formData.director.length > 100) {
      newErrors.director = 'Имя режиссера не должно превышать 100 символов'
    }

    if (formData.year < 1888 || formData.year > 2100) {
      newErrors.year = 'Год должен быть от 1888 до 2100'
    }

    if (formData.rating < 0 || formData.rating > 10) {
      newErrors.rating = 'Рейтинг должен быть от 0.0 до 10.0'
    }

    if (!formData.genre.trim()) {
      newErrors.genre = 'Жанр обязателен'
    } else if (formData.genre.length > 50) {
      newErrors.genre = 'Жанр не должен превышать 50 символов'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Описание не должно превышать 1000 символов'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const dataToSend = {
        ...formData,
        description: formData.description || null
      }

      if (isEditing) {
        await updateFilm(id, dataToSend)
        navigate(`/films/${id}`)
      } else {
        const newFilm = await createFilm(dataToSend)
        navigate(`/films/${newFilm.id}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingFilm) {
    return <div className="loading">Загрузка данных фильма...</div>
  }

  return (
    <div className="film-form-container">
      <div className="container">
        <h2>{isEditing ? 'Редактировать фильм' : 'Добавить новый фильм'}</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="film-form">
          <div className="input-group">
            <label htmlFor="title">Название фильма *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
              placeholder="Например: Матрица"
              required
            />
            {errors.title && <div className="input-error">{errors.title}</div>}
          </div>

          <div className="input-group">
            <label htmlFor="director">Режиссер *</label>
            <input
              type="text"
              id="director"
              name="director"
              value={formData.director}
              onChange={handleChange}
              className={errors.director ? 'input-error' : ''}
              placeholder="Например: Кристофер Нолан"
              required
            />
            {errors.director && <div className="input-error">{errors.director}</div>}
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="year">Год выпуска *</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={errors.year ? 'input-error' : ''}
                min="1888"
                max="2100"
                required
              />
              {errors.year && <div className="input-error">{errors.year}</div>}
            </div>

            <div className="input-group">
              <label htmlFor="rating">Рейтинг (0.0 - 10.0) *</label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className={errors.rating ? 'input-error' : ''}
                min="0"
                max="10"
                step="0.1"
                required
              />
              {errors.rating && <div className="input-error">{errors.rating}</div>}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="genre">Жанр *</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className={errors.genre ? 'input-error' : ''}
              placeholder="Например: Фантастика, Драма, Комедия"
              required
            />
            {errors.genre && <div className="input-error">{errors.genre}</div>}
          </div>

          <div className="input-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'input-error' : ''}
              placeholder="Описание фильма (необязательно)"
              rows="5"
            />
            {errors.description && <div className="input-error">{errors.description}</div>}
            <small>Максимум 1000 символов</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Создать фильм')}
            </button>
            <Link to={isEditing ? `/films/${id}` : '/'} className="btn btn-secondary">
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FilmForm

