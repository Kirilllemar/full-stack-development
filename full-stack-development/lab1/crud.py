from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, asc
from typing import List, Optional
from models import Film
from schemas import FilmCreate, FilmUpdate


def get_film(db: Session, film_id: int) -> Optional[Film]:
    """Получить фильм по ID"""
    return db.query(Film).filter(Film.id == film_id).first()


def get_films(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    year_min: Optional[int] = None,
    year_max: Optional[int] = None,
    rating_min: Optional[float] = None,
    rating_max: Optional[float] = None,
    genre: Optional[str] = None,
    sort_by: str = "id",
    sort_order: str = "asc"
) -> tuple[List[Film], int]:
    """
    Получить список фильмов с фильтрацией, сортировкой и пагинацией
    
    Args:
        db: Сессия БД
        skip: Пропустить N записей (для пагинации)
        limit: Максимум записей
        year_min: Минимальный год
        year_max: Максимальный год
        rating_min: Минимальный рейтинг
        rating_max: Максимальный рейтинг
        genre: Жанр
        sort_by: Поле для сортировки (id, title, year, rating)
        sort_order: Порядок сортировки (asc, desc)
    """
    query = db.query(Film)
    
    # Применение фильтров
    if year_min is not None:
        query = query.filter(Film.year >= year_min)
    if year_max is not None:
        query = query.filter(Film.year <= year_max)
    if rating_min is not None:
        query = query.filter(Film.rating >= rating_min)
    if rating_max is not None:
        query = query.filter(Film.rating <= rating_max)
    if genre:
        query = query.filter(Film.genre.ilike(f"%{genre}%"))
    
    # Подсчет общего количества (до применения сортировки и лимита)
    total = query.count()
    
    # Сортировка
    sort_column = {
        "id": Film.id,
        "title": Film.title,
        "year": Film.year,
        "rating": Film.rating,
        "created_at": Film.created_at
    }.get(sort_by, Film.id)
    
    if sort_order.lower() == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Применение пагинации
    films = query.offset(skip).limit(limit).all()
    
    return films, total


def search_films_by_title(db: Session, title_query: str, skip: int = 0, limit: int = 10) -> tuple[List[Film], int]:
    """Поиск фильмов по названию"""
    query = db.query(Film).filter(Film.title.ilike(f"%{title_query}%"))
    total = query.count()
    films = query.offset(skip).limit(limit).all()
    return films, total


def create_film(db: Session, film: FilmCreate) -> Film:
    """Создать новый фильм"""
    db_film = Film(**film.dict())
    db.add(db_film)
    db.commit()
    db.refresh(db_film)
    return db_film


def update_film(db: Session, film_id: int, film: FilmUpdate) -> Optional[Film]:
    """Обновить фильм"""
    db_film = get_film(db, film_id)
    if not db_film:
        return None
    
    update_data = film.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_film, field, value)
    
    db.commit()
    db.refresh(db_film)
    return db_film


def delete_film(db: Session, film_id: int) -> bool:
    """Удалить фильм"""
    db_film = get_film(db, film_id)
    if not db_film:
        return False
    
    db.delete(db_film)
    db.commit()
    return True


def get_film_stats(db: Session) -> dict:
    """Получить статистику по фильмам"""
    total_films = db.query(func.count(Film.id)).scalar()
    
    if total_films == 0:
        return {
            "total_films": 0,
            "average_rating": 0.0,
            "min_rating": 0.0,
            "max_rating": 0.0,
            "films_by_year": {},
            "films_by_genre": {}
        }
    
    stats = db.query(
        func.avg(Film.rating).label('avg_rating'),
        func.min(Film.rating).label('min_rating'),
        func.max(Film.rating).label('max_rating')
    ).first()
    
    # Статистика по годам
    films_by_year = db.query(
        Film.year,
        func.count(Film.id).label('count')
    ).group_by(Film.year).all()
    
    # Статистика по жанрам
    films_by_genre = db.query(
        Film.genre,
        func.count(Film.id).label('count')
    ).group_by(Film.genre).all()
    
    return {
        "total_films": total_films,
        "average_rating": round(stats.avg_rating or 0.0, 2),
        "min_rating": stats.min_rating or 0.0,
        "max_rating": stats.max_rating or 0.0,
        "films_by_year": {str(year): count for year, count in films_by_year},
        "films_by_genre": {genre: count for genre, count in films_by_genre}
    }

