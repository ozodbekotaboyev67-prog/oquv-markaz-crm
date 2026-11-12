# 🎓 O'quv markaz CRM tizimi

O'quv markazlar uchun mo'ljallangan to'liq CRM (Customer Relationship Management) tizimi.

## ✨ Asosiy imkoniyatlar

- **📊 Dashboard** — Umumiy statistika: faol talabalar, kurslar, daromad, kutilayotgan to'lovlar
- **👨‍🎓 Talabalar boshqaruvi** — Talabalarni qo'shish, tahrirlash, o'chirish, qidirish
- **📚 Kurslar boshqaruvi** — Kurs yaratish, narx, jadval, o'qituvchi tayinlash
- **💰 To'lovlar** — To'lovlarni qayd etish, holatni kuzatish, hisobotlar
- **📅 Darslar** — Dars jadvali, qatnashuvchilikni belgilash (Bor/Yo'q/Kech)
- **🔐 Login tizimi** — Admin va o'qituvchi uchun alohida login

## 🛠 Texnologiyalar

### Backend
- **Python** + **Flask** — REST API
- **SQLite** — Ma'lumotlar bazasi
- **Flask-CORS** — Cross-origin so'rovlar

### Frontend
- **React 18** — Foydalanuvchi interfeysi
- **Bootstrap 5** — Dizayn va responsive
- **Axios** — API so'rovlar
- **Bootstrap Icons** — Iconlar

## 📋 Talablar

- Python 3.8 yoki yuqori
- Node.js 16 yoki yuqori
- npm yoki yarn

## 🚀 Ishga tushirish

### 1. Backend (Flask API)

```bash
# crm papkasiga o'ting
cd crm

# Kerakli kutubxonalarni o'rnating
pip install -r requirements.txt

# Serverni ishga tushiring
python app.py
```

Server `http://127.0.0.1:5000` manzilida ishlaydi.

### 2. Frontend (React)

```bash
# react-frontend papkasiga o'ting
cd react-frontend

# Dependency'larni o'rnating
npm install

# Ilova ishga tushiring
npm start
```

Frontend `http://localhost:3000` manzilida ochiladi.

## 🔑 Login ma'lumotlari

| Rol | Login | Parol |
|-----|-------|-------|
| Admin | `admin` | `admin123` |
| O'qituvchi | `teacher1` | `teacher123` |
| O'qituvchi | `teacher2` | `teacher123` |

## 📁 Loyiha tuzilmasi

```
crm/
├── app.py                      # Asosiy Flask ilova
├── models.py                   # Ma'lumotlar bazasi modellari
├── requirements.txt            # Python dependency'lar
├── routes/
│   ├── students.py             # Talabalar API
│   ├── courses.py              # Kurslar API
│   ├── payments.py             # To'lovlar API
│   ├── lessons.py              # Darslar API
│   └── auth.py                 # Login API
├── database/
│   └── crm.db                  # SQLite baza (avtomatik yaratiladi)
└── react-frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js              # Asosiy komponent
        ├── index.js
        ├── components/
        │   ├── Dashboard.js
        │   ├── Students.js
        │   ├── Courses.js
        │   ├── Payments.js
        │   ├── Lessons.js
        │   └── Login.js
        └── styles/
            └── App.css
```

## 📡 API Endpoint'lar

### Dashboard
- `GET /api/dashboard` — Umumiy statistika

### Talabalar
- `GET /api/students` — Barcha talabalar
- `GET /api/students?search=ism` — Qidirish
- `POST /api/students` — Yangi talaba
- `PUT /api/students/:id` — Tahrirlash
- `DELETE /api/students/:id` — O'chirish
- `GET /api/students/:id/payments` — Talaba to'lovlari
- `GET /api/students/:id/attendance` — Talaba qatnashuvchiligi

### Kurslar
- `GET /api/courses` — Barcha kurslar
- `POST /api/courses` — Yangi kurs
- `PUT /api/courses/:id` — Tahrirlash
- `DELETE /api/courses/:id` — O'chirish
- `GET /api/courses/:id/students` — Kursdagi talabalar

### To'lovlar
- `GET /api/payments` — Barcha to'lovlar
- `GET /api/payments?status=paid` — Filtr
- `POST /api/payments` — Yangi to'lov
- `PUT /api/payments/:id` — Tahrirlash
- `DELETE /api/payments/:id` — O'chirish
- `GET /api/payments/summary` — To'lovlar hisoboti

### Darslar
- `GET /api/lessons` — Barcha darslar
- `POST /api/lessons` — Yangi dars
- `PUT /api/lessons/:id` — Tahrirlash
- `DELETE /api/lessons/:id` — O'chirish
- `GET /api/lessons/:id/attendance` — Qatnashuvchilik
- `POST /api/lessons/:id/attendance/bulk` — Ko'p qatnashuvchilik

### Auth
- `POST /api/auth/login` — Login
- `GET /api/auth/users` — Foydalanuvchilar

## 📝 Ma'lumotlar bazasi

Birinchi ishga tushirishda avtomatik yaratiladi va namuna ma'lumotlar bilan to'ldiriladi:

- **users** — Foydalanuvchilar (admin, o'qituvchilar)
- **students** — Talabalar
- **courses** — Kurslar
- **payments** — To'lovlar
- **lessons** — Darslar
- **attendance** — Qatnashuvchilik

## 📱 Foydalanish

1. Backend ni ishga tushiring: `python app.py`
2. Frontend ni ishga tushiring: `npm start`
3. Brauzerda `http://localhost:3000` oching
4. Login va parolni kiriting
5. Dashboard da statistika ko'ring
6. Talabalar, kurslar, to'lovlar va darslarni boshqaring

## 🎯 Kelajak rejalari

- [ ] PDF hisobotlar chiqarish
- [ ] SMS/Email xabarnomalar
- [ ] Talaba uchun shaxsiy kabinet
- [ ] Ota-ona uchun hisobotlar
- [ ] Ko'p tilli interfeys

## 📄 Litsenziya

Bu loyiha o'quv maqsadlarida yaratilgan.

## 🤝 Yordam

Savollaringiz bo'lsa, muammo yuzaga kelsa, loyiha muallifiga murojaat qiling.
