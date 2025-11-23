#!/bin/bash

# Запуск Backend API

cd lab1

# Создание venv
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Активация
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Инициализация данных
if [ ! -f "filmoteka.db" ]; then
    python init_test_data.py
fi

# Запуск
echo "Backend запущен на http://localhost:8000"
uvicorn main:app --reload

