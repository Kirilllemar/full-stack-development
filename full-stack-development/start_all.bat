@echo off
:: Скрипт для запуска Backend и Frontend на Windows

echo Запуск проекта...
echo.

:: Запуск Backend
echo Запуск Backend...
cd lab1

:: Создание виртуального окружения, если его нет
if not exist venv (
    echo Создание виртуального окружения...
    python -m venv venv
)

:: Активация виртуального окружения
call venv\Scripts\activate

:: Установка зависимостей
if not exist requirements.txt (
    echo Файл requirements.txt не найден!
    exit /b 1
)
pip install -r requirements.txt > nul

:: Инициализация тестовых данных, если база не существует
if not exist filmoteka.db (
    echo Инициализация тестовых данных...
    python init_test_data.py
)

:: Запуск Backend в фоновом режиме с логами
echo Backend запущен на http://localhost:8000
start "Backend" cmd /c "uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ..\backend.log 2>&1"
set BACKEND_PID=%errorlevel%

cd ..

:: Небольшая пауза
timeout /t 3 > nul

:: Запуск Frontend
echo.
echo Запуск Frontend...
cd lab2\frontend

:: Установка npm-зависимостей, если node_modules нет
if not exist node_modules (
    echo Установка npm зависимостей...
    npm install
)

:: Запуск Frontend в фоновом режиме с логами
echo Frontend запущен на http://localhost:3000
start "Frontend" cmd /c "npm run dev > ..\..\frontend.log 2>&1"
set FRONTEND_PID=%errorlevel%

cd ..\..

echo.
echo Проект запущен!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Для остановки закройте это окно или завершите процессы вручную (Ctrl+C в каждом окне или через Диспетчер задач).

:: Пауза, чтобы пользователь мог видеть сообщение
pause
