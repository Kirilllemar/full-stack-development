#!/bin/bash

# Запуск Frontend

cd lab2/frontend

# Установка зависимостей
if [ ! -d "node_modules" ]; then
    npm install
fi

# Запуск
echo "Frontend запущен на http://localhost:3000"
npm run dev

