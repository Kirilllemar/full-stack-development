@echo off
:: Запуск Frontend приложения на Windows

echo Переход в папку lab2\frontend...
cd /d "%~dp0lab2\frontend" || (
    echo Ошибка: папка lab2\frontend не найдена!
    exit /b 1
)

:: Проверка наличия node.js
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Ошибка: npm не найден. Убедитесь, что Node.js установлен и добавлен в PATH.
    exit /b 1
)

:: Установка зависимостей, если node_modules отсутствует
if not exist node_modules (
    echo Устанавливаю npm-зависимости... Это может занять некоторое время.
    npm install
    if %errorlevel% neq 0 (
        echo Ошибка при установке зависимостей через npm.
        exit /b 1
    )
)

:: Запуск dev-сервера
echo.
echo Frontend запущен на http://localhost:3000
echo Для остановки нажмите Ctrl+C
npm run dev

:: После остановки (Ctrl+C) — завершение скрипта
echo.
echo Разработка остановлена.
