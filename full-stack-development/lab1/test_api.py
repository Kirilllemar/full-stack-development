"""
Скрипт для тестирования Filmoteka API
Демонстрирует все основные операции с API
"""
import requests
import json
from typing import Dict, Optional

BASE_URL = "http://localhost:8000"


def print_response(title: str, response: requests.Response):
    """Вывод ответа сервера"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Статус код: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except:
        print(response.text)
    print()


def test_root():
    """Тест корневого эндпоинта"""
    print("\n1. Тест корневого эндпоинта")
    response = requests.get(f"{BASE_URL}/")
    print_response("GET /", response)
    return response.status_code == 200


def test_get_all_films():
    """Тест получения всех фильмов"""
    print("\n2. Тест получения всех фильмов")
    response = requests.get(f"{BASE_URL}/films")
    print_response("GET /films", response)
    return response.status_code == 200


def test_get_film_by_id(film_id: int = 1):
    """Тест получения фильма по ID"""
    print(f"\n3. Тест получения фильма по ID (ID: {film_id})")
    response = requests.get(f"{BASE_URL}/films/{film_id}")
    print_response(f"GET /films/{film_id}", response)
    return response.status_code == 200


def test_create_film():
    """Тест создания нового фильма"""
    print("\n4. Тест создания нового фильма")
    new_film = {
        "title": "Тестовый фильм",
        "director": "Тестовый режиссер",
        "year": 2024,
        "rating": 7.5,
        "genre": "Комедия",
        "description": "Это тестовый фильм для проверки API"
    }
    response = requests.post(
        f"{BASE_URL}/films",
        json=new_film,
        headers={"Content-Type": "application/json"}
    )
    print_response("POST /films", response)
    
    if response.status_code == 201:
        film_id = response.json().get("id")
        print(f"✓ Фильм успешно создан с ID: {film_id}")
        return film_id
    return None


def test_update_film(film_id: int):
    """Тест обновления фильма"""
    print(f"\n5. Тест обновления фильма (ID: {film_id})")
    update_data = {
        "rating": 8.0,
        "description": "Обновленное описание тестового фильма"
    }
    response = requests.put(
        f"{BASE_URL}/films/{film_id}",
        json=update_data,
        headers={"Content-Type": "application/json"}
    )
    print_response(f"PUT /films/{film_id}", response)
    return response.status_code == 200


def test_delete_film(film_id: int):
    """Тест удаления фильма"""
    print(f"\n6. Тест удаления фильма (ID: {film_id})")
    response = requests.delete(f"{BASE_URL}/films/{film_id}")
    print(f"\n{'='*60}")
    print(f"DELETE /films/{film_id}")
    print(f"{'='*60}")
    print(f"Статус код: {response.status_code}")
    if response.status_code == 204:
        print("✓ Фильм успешно удален")
    else:
        try:
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        except:
            print(response.text)
    print()
    return response.status_code == 204


def test_search_films():
    """Тест поиска фильмов"""
    print("\n7. Тест поиска фильмов по названию")
    query = "матрица"
    response = requests.get(f"{BASE_URL}/films/search/{query}")
    print_response(f"GET /films/search/{query}", response)
    return response.status_code == 200


def test_filter_by_year():
    """Тест фильтрации по году"""
    print("\n8. Тест фильтрации по году (2000-2010)")
    params = {"year_min": 2000, "year_max": 2010}
    response = requests.get(f"{BASE_URL}/films", params=params)
    print_response("GET /films?year_min=2000&year_max=2010", response)
    return response.status_code == 200


def test_filter_by_rating():
    """Тест фильтрации по рейтингу"""
    print("\n9. Тест фильтрации по рейтингу (≥ 8.5)")
    params = {"rating_min": 8.5}
    response = requests.get(f"{BASE_URL}/films", params=params)
    print_response("GET /films?rating_min=8.5", response)
    return response.status_code == 200


def test_filter_by_genre():
    """Тест фильтрации по жанру"""
    print("\n10. Тест фильтрации по жанру (Драма)")
    params = {"genre": "Драма"}
    response = requests.get(f"{BASE_URL}/films", params=params)
    print_response("GET /films?genre=Драма", response)
    return response.status_code == 200


def test_sorting():
    """Тест сортировки"""
    print("\n11. Тест сортировки по рейтингу (desc)")
    params = {"sort_by": "rating", "sort_order": "desc", "size": 5}
    response = requests.get(f"{BASE_URL}/films", params=params)
    print_response("GET /films?sort_by=rating&sort_order=desc&size=5", response)
    return response.status_code == 200


def test_pagination():
    """Тест пагинации"""
    print("\n12. Тест пагинации (страница 1, размер 5)")
    params = {"page": 1, "size": 5}
    response = requests.get(f"{BASE_URL}/films", params=params)
    print_response("GET /films?page=1&size=5", response)
    return response.status_code == 200


def test_complex_filter():
    """Тест комплексной фильтрации"""
    print("\n13. Тест комплексной фильтрации (год, рейтинг, жанр, сортировка)")
    params = {
        "year_min": 2000,
        "year_max": 2010,
        "rating_min": 8.0,
        "genre": "Фантастика",
        "sort_by": "rating",
        "sort_order": "desc",
        "size": 5
    }
    response = requests.get(f"{BASE_URL}/films", params=params)
    print_response("GET /films с комплексными фильтрами", response)
    return response.status_code == 200


def test_get_stats():
    """Тест получения статистики"""
    print("\n14. Тест получения статистики")
    response = requests.get(f"{BASE_URL}/films/stats/overview")
    print_response("GET /films/stats/overview", response)
    return response.status_code == 200


def test_validation_errors():
    """Тест валидации (ошибки)"""
    print("\n15. Тест валидации (должна быть ошибка)")
    
    # Неверный год
    print("\n15.1. Тест с неверным годом (1800)")
    invalid_film = {
        "title": "Тест",
        "director": "Тест",
        "year": 1800,  # Неверный год
        "rating": 8.0,
        "genre": "Тест"
    }
    response = requests.post(f"{BASE_URL}/films", json=invalid_film)
    print_response("POST /films (неверный год)", response)
    
    # Неверный рейтинг
    print("\n15.2. Тест с неверным рейтингом (15.0)")
    invalid_film = {
        "title": "Тест",
        "director": "Тест",
        "year": 2000,
        "rating": 15.0,  # Неверный рейтинг
        "genre": "Тест"
    }
    response = requests.post(f"{BASE_URL}/films", json=invalid_film)
    print_response("POST /films (неверный рейтинг)", response)
    
    # Пустое название
    print("\n15.3. Тест с пустым названием")
    invalid_film = {
        "title": "",  # Пустое название
        "director": "Тест",
        "year": 2000,
        "rating": 8.0,
        "genre": "Тест"
    }
    response = requests.post(f"{BASE_URL}/films", json=invalid_film)
    print_response("POST /films (пустое название)", response)


def test_not_found():
    """Тест 404 ошибки"""
    print("\n16. Тест 404 ошибки (несуществующий фильм)")
    response = requests.get(f"{BASE_URL}/films/99999")
    print_response("GET /films/99999 (должна быть 404)", response)
    return response.status_code == 404


def main():
    """Главная функция для запуска всех тестов"""
    print("\n" + "="*60)
    print("ТЕСТИРОВАНИЕ FILMOTEKA API")
    print("="*60)
    print(f"\nБазовый URL: {BASE_URL}")
    print("\nУбедитесь, что сервер запущен на http://localhost:8000")
    print("Запустите: uvicorn main:app --reload")
    
    input("\nНажмите Enter для начала тестирования...")
    
    results = []
    
    # Базовые тесты
    results.append(("Корневой эндпоинт", test_root()))
    results.append(("Получение всех фильмов", test_get_all_films()))
    results.append(("Получение фильма по ID", test_get_film_by_id(1)))
    
    # CRUD операции
    film_id = test_create_film()
    if film_id:
        results.append(("Создание фильма", True))
        results.append(("Обновление фильма", test_update_film(film_id)))
        # Не удаляем созданный фильм, чтобы его можно было проверить
        # results.append(("Удаление фильма", test_delete_film(film_id)))
    
    # Поиск и фильтрация
    results.append(("Поиск фильмов", test_search_films()))
    results.append(("Фильтрация по году", test_filter_by_year()))
    results.append(("Фильтрация по рейтингу", test_filter_by_rating()))
    results.append(("Фильтрация по жанру", test_filter_by_genre()))
    
    # Сортировка и пагинация
    results.append(("Сортировка", test_sorting()))
    results.append(("Пагинация", test_pagination()))
    results.append(("Комплексная фильтрация", test_complex_filter()))
    
    # Статистика
    results.append(("Получение статистики", test_get_stats()))
    
    # Тесты ошибок
    test_validation_errors()
    results.append(("404 ошибка", test_not_found()))
    
    # Итоги
    print("\n" + "="*60)
    print("ИТОГИ ТЕСТИРОВАНИЯ")
    print("="*60)
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\nПройдено: {passed}/{total} тестов")
    print("="*60 + "\n")


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n✗ ОШИБКА: Не удалось подключиться к серверу!")
        print("Убедитесь, что сервер запущен на http://localhost:8000")
        print("Запустите: uvicorn main:app --reload")
    except KeyboardInterrupt:
        print("\n\nТестирование прервано пользователем")
    except Exception as e:
        print(f"\n✗ ОШИБКА: {e}")

