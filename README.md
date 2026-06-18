# Django + React проект

## Структура проекта
project/
├── backend/ # Django проект
│ ├── manage.py
│ ├── requirements.txt
│ └── ...
└── frontend/ # React приложение
├── package.json
├── public/
└── src/


## Установка и запуск

### 1. Бэкенд (Django)

```bash
cd backend
python -m venv venv     
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
Сервер запустится на http://127.0.0.1:8000/

2. Фронтенд (React)

cd frontend
npm install
npm run dev
Приложение будет доступно на http://localhost:3000/