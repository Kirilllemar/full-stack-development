#!/bin/bash

# Скрипт для запуска Backend и Frontend

echo "Запуск проекта..."
echo ""

# Запуск Backend
echo "Запуск Backend..."
cd lab1

# Создание venv если нет
if [ ! -d "venv" ]; then
    echo "Создание виртуального окружения..."
    python3 -m venv venv
fi

# Активация venv
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Инициализация данных
if [ ! -f "filmoteka.db" ]; then
    python init_test_data.py
fi

# Запуск Backend
echo "Backend запущен на http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!

cd ..

# Небольшая пауза
sleep 2

# Запуск Frontend
echo ""
echo "Запуск Frontend..."
cd lab2/frontend

# Установка зависимостей если нужно
if [ ! -d "node_modules" ]; then
    echo "Установка npm зависимостей..."
    npm install
fi

# Запуск Frontend
echo "Frontend запущен на http://localhost:3000"
npm run dev > ../../frontend.log 2>&1 &
FRONTEND_PID=$!

cd ../..

echo ""
echo "Проект запущен!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Для остановки нажмите Ctrl+C"

# Ожидание
wait
