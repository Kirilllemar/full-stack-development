from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class FilmBase(BaseModel):
    """Базовая схема фильма"""
    title: str = Field(..., min_length=1, max_length=200, description="Название фильма")
    director: str = Field(..., min_length=1, max_length=100, description="Режиссер")
    year: int = Field(..., ge=1888, le=2100, description="Год выпуска")
    rating: float = Field(..., ge=0.0, le=10.0, description="Рейтинг (0.0-10.0)")
    genre: str = Field(..., min_length=1, max_length=50, description="Жанр")
    description: Optional[str] = Field(None, max_length=1000, description="Описание")

    @validator('year')
    def validate_year(cls, v):
        """Валидация года"""
        if v < 1888:
            raise ValueError('Год не может быть раньше 1888 (первый фильм)')
        if v > 2100:
            raise ValueError('Год не может быть больше 2100')
        return v

    @validator('rating')
    def validate_rating(cls, v):
        """Валидация рейтинга"""
        if v < 0.0 or v > 10.0:
            raise ValueError('Рейтинг должен быть от 0.0 до 10.0')
        return v


class FilmCreate(FilmBase):
    """Схема для создания фильма"""
    pass


class FilmUpdate(BaseModel):
    """Схема для обновления фильма (все поля опциональные)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    director: Optional[str] = Field(None, min_length=1, max_length=100)
    year: Optional[int] = Field(None, ge=1888, le=2100)
    rating: Optional[float] = Field(None, ge=0.0, le=10.0)
    genre: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=1000)


class FilmResponse(FilmBase):
    """Схема для ответа с фильмом"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FilmListResponse(BaseModel):
    """Схема для списка фильмов с пагинацией"""
    items: list[FilmResponse]
    total: int
    page: int
    size: int
    pages: int


class FilmStatsResponse(BaseModel):
    """Схема для статистики"""
    total_films: int
    average_rating: float
    min_rating: float
    max_rating: float
    films_by_year: dict
    films_by_genre: dict

