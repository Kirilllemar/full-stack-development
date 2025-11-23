from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil

from database import get_db, init_db
from models import Film
from schemas import (
    FilmCreate, 
    FilmUpdate, 
    FilmResponse, 
    FilmListResponse,
    FilmStatsResponse
)
from crud import (
    get_film,
    get_films,
    create_film,
    update_film,
    delete_film,
    search_films_by_title,
    get_film_stats
)

# Создание приложения FastAPI
app = FastAPI(
    title="Filmoteka API",
    description="REST API для управления фильмотекой с возможностью поиска, фильтрации и сортировки",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Настройка CORS для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Инициализация БД при старте приложения"""
    init_db()


@app.get("/", tags=["Информация"])
async def root():
    """Корневой эндпоинт - информация об API"""
    return {
        "message": "Добро пожаловать в Filmoteka API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "films": "/films",
            "film_by_id": "/films/{id}",
            "search": "/films/search/{query}",
            "stats": "/films/stats"
        }
    }


@app.get("/films", response_model=FilmListResponse, tags=["Фильмы"])
async def read_films(
    page: int = Query(1, ge=1, description="Номер страницы"),
    size: int = Query(10, ge=1, le=100, description="Размер страницы"),
    year_min: Optional[int] = Query(None, ge=1888, description="Минимальный год"),
    year_max: Optional[int] = Query(None, le=2100, description="Максимальный год"),
    rating_min: Optional[float] = Query(None, ge=0.0, le=10.0, description="Минимальный рейтинг"),
    rating_max: Optional[float] = Query(None, ge=0.0, le=10.0, description="Максимальный рейтинг"),
    genre: Optional[str] = Query(None, description="Жанр (поиск по подстроке)"),
    sort_by: str = Query("id", description="Поле для сортировки (id, title, year, rating, created_at)"),
    sort_order: str = Query("asc", regex="^(asc|desc)$", description="Порядок сортировки (asc/desc)"),
    db: Session = Depends(get_db)
):
    """
    Получить список фильмов с пагинацией, фильтрацией и сортировкой
    
    - **page**: Номер страницы (начиная с 1)
    - **size**: Количество записей на странице (1-100)
    - **year_min/year_max**: Фильтр по году
    - **rating_min/rating_max**: Фильтр по рейтингу
    - **genre**: Поиск по жанру
    - **sort_by**: Поле для сортировки
    - **sort_order**: Порядок сортировки (asc/desc)
    """
    skip = (page - 1) * size
    films, total = get_films(
        db=db,
        skip=skip,
        limit=size,
        year_min=year_min,
        year_max=year_max,
        rating_min=rating_min,
        rating_max=rating_max,
        genre=genre,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    pages = ceil(total / size) if total > 0 else 1
    
    return FilmListResponse(
        items=films,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@app.get("/films/{film_id}", response_model=FilmResponse, tags=["Фильмы"])
async def read_film(film_id: int, db: Session = Depends(get_db)):
    """
    Получить фильм по ID
    
    - **film_id**: ID фильма
    """
    film = get_film(db, film_id=film_id)
    if film is None:
        raise HTTPException(status_code=404, detail=f"Фильм с ID {film_id} не найден")
    return film


@app.post("/films", response_model=FilmResponse, status_code=201, tags=["Фильмы"])
async def create_new_film(film: FilmCreate, db: Session = Depends(get_db)):
    """
    Создать новый фильм
    
    - **title**: Название фильма (обязательно, 1-200 символов)
    - **director**: Режиссер (обязательно, 1-100 символов)
    - **year**: Год выпуска (обязательно, 1888-2100)
    - **rating**: Рейтинг (обязательно, 0.0-10.0)
    - **genre**: Жанр (обязательно, 1-50 символов)
    - **description**: Описание (опционально, до 1000 символов)
    """
    return create_film(db=db, film=film)


@app.put("/films/{film_id}", response_model=FilmResponse, tags=["Фильмы"])
async def update_existing_film(
    film_id: int, 
    film: FilmUpdate, 
    db: Session = Depends(get_db)
):
    """
    Обновить фильм по ID
    
    - **film_id**: ID фильма
    - Все поля опциональны - обновляются только переданные поля
    """
    db_film = update_film(db=db, film_id=film_id, film=film)
    if db_film is None:
        raise HTTPException(status_code=404, detail=f"Фильм с ID {film_id} не найден")
    return db_film


@app.delete("/films/{film_id}", status_code=204, tags=["Фильмы"])
async def delete_existing_film(film_id: int, db: Session = Depends(get_db)):
    """
    Удалить фильм по ID
    
    - **film_id**: ID фильма
    """
    success = delete_film(db=db, film_id=film_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Фильм с ID {film_id} не найден")
    return JSONResponse(status_code=204, content=None)


@app.get("/films/search/{query}", response_model=FilmListResponse, tags=["Поиск"])
async def search_films(
    query: str,
    page: int = Query(1, ge=1, description="Номер страницы"),
    size: int = Query(10, ge=1, le=100, description="Размер страницы"),
    db: Session = Depends(get_db)
):
    """
    Поиск фильмов по названию
    
    - **query**: Поисковый запрос (ищется подстрока в названии)
    - **page**: Номер страницы
    - **size**: Размер страницы
    """
    skip = (page - 1) * size
    films, total = search_films_by_title(db=db, title_query=query, skip=skip, limit=size)
    
    pages = ceil(total / size) if total > 0 else 1
    
    return FilmListResponse(
        items=films,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@app.get("/films/stats/overview", response_model=FilmStatsResponse, tags=["Статистика"])
async def get_statistics(db: Session = Depends(get_db)):
    """
    Получить статистику по фильмотеке
    
    Возвращает:
    - Общее количество фильмов
    - Средний, минимальный и максимальный рейтинг
    - Распределение фильмов по годам
    - Распределение фильмов по жанрам
    """
    stats = get_film_stats(db=db)
    return stats


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

