import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'

// Компоненты
import FilmsList from './components/FilmsList'
import FilmForm from './components/FilmForm'
import FilmDetails from './components/FilmDetails'
import SearchFilms from './components/SearchFilms'

function App() {
  const location = useLocation()

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Filmoteka</h1>
        <p>Управление вашей коллекцией фильмов</p>
      </header>

      <nav className="app-nav">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
        >
          Список фильмов
        </Link>
        <Link 
          to="/films/new" 
          className={location.pathname === '/films/new' ? 'active' : ''}
        >
          Добавить фильм
        </Link>
        <Link 
          to="/search" 
          className={location.pathname === '/search' ? 'active' : ''}
        >
          Поиск и фильтры
        </Link>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<FilmsList />} />
          <Route path="/films/new" element={<FilmForm />} />
          <Route path="/films/:id/edit" element={<FilmForm />} />
          <Route path="/films/:id" element={<FilmDetails />} />
          <Route path="/search" element={<SearchFilms />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

