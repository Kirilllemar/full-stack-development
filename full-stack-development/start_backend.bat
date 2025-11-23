@echo off
:: Запуск Backend API на Windows

echo Переход в папку lab1...
cd /d "%~dp0lab1" || (
    echo Ошибка: папка lab1 не найдена!
    exit /b 1
)

:: Создание виртуального окружения, если его нет
if not exist venv (
    echo Создаю виртуальное окружение...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo Ошибка при создании виртуального окружения. Убедитесь, что Python установлен.
        exit /b 1
    )
)

:: Активация виртуального окружения
echo Активирую виртуальное окружение...
call venv\Scripts\activate

:: Установка зависимостей
if exist requirements.txt (
    echo Устанавливаю зависимости из requirements.txt...
    pip install -r requirements.txt
) else (
    echo Ошибка: файл requirements.txt не найден!
    exit /b 1
)

:: Инициализация тестовых данных, если база отсутствует
if not exist filmoteka.db (
    echo Инициализирую тестовые данные (filmoteka.db)...
    python init_test_data.py
    if %errorlevel% neq 0 (
        echo Ошибка при выполнении init_test_data.py
        exit /b 1
    )
)

:: Запуск uvicorn
echo.
echo Backend запущен на http://localhost:8000
echo Для остановки нажмите Ctrl+C
uvicorn main:app --reload --host 0.0.0.0 --port 8000

:: Деактивация (после остановки)
deactivate
