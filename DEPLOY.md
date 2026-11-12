# 🚀 CRM Ilovasini Internetda Joylashtirish Ko'rsatmalari

Bu faylda CRM ilovasini **bepul** internetda joylashtirish usullari keltirilgan.

---

## 📋 Tayyorgarlik

Barcha kerakli fayllar tayyor:
- ✅ `Dockerfile` — Docker container uchun
- ✅ `render.yaml` — Render.com uchun
- ✅ `Procfile` — Heroku/PythonAnywhere uchun
- ✅ `.dockerignore` — Docker build uchun
- ✅ `crm/requirements.txt` — Python paketlari ro'yxati

---

## 🌐 1-usul: Render.com (Eng Oson — Tavsiya Etiladi)

### 1-qadam: GitHub ga yuklash

PyCharm'dagi terminalda quyidagi buyruqlarni bajaring:

```powershell
cd D:\dars_1_kompyuter
git init
git add .
git commit -m "O'quv markaz CRM — dastlabki versiya"
```

Keyin [github.com](https://github.com) da yangi repository yarating:
1. **New repository** tugmasini bosing
2. Nomini `oquv-markaz-crm` deb yozing
3. **Public** tanlang
4. **Create repository** bosing
5. Repository sahifasidan link'ni nusxalang (masalan: `https://github.com/username/oquv-markaz-crm.git`)

Terminalda davom eting:

```powershell
git remote add origin https://github.com/USERNAME/oquv-markaz-crm.git
git branch -M main
git push -u origin main
```

### 2-qadam: Render.com da ro'yxatdan o'tish

1. [render.com](https://render.com) ga kiring
2. **Get Started for Free** bosing
3. GitHub hisobingiz bilan kiring
4. Repository'ingizni ruxsat bering

### 3-qadam: Deploy qilish

1. Dashboard'da **New +** → **Blueprint** bosing
2. **Connect a repository** → `oquv-markaz-crm` ni tanlang
3. **Set up and deploy** bosing
4. Render avtomatik `render.yaml` faylni topadi va deploy qiladi
5. Taxminan 2-3 daqiqa kutib turing

### ✅ Natija

`https://oquv-markaz-crm.onrender.com` manzili ochiladi!

**API endpoint'lar:**
- Dashboard: `https://oquv-markaz-crm.onrender.com/api/dashboard`
- Talabalar: `https://oquv-markaz-crm.onrender.com/api/students`
- Kurslar: `https://oquv-markaz-crm.onrender.com/api/courses`
- To'lovlar: `https://oquv-markaz-crm.onrender.com/api/payments`

---

## ☁️ 2-usul: PythonAnywhere (Bepul + Doimiy Baza)

### 1-qadam: Ro'yxatdan o'tish

1. [pythonanywhere.com](https://www.pythonanywhere.com) ga kiring
2. **Sign up** → **Beginner** (bepul) tanlang

### 2-qadam: Kodni yuklash

1. **Consoles** → **Bash** bosing
2. Quyidagi buyruqlarni bajaring:

```bash
git clone https://github.com/USERNAME/oquv-markaz-crm.git
cd oquv-markaz-crm
pip install flask flask-cors gunicorn
```

### 3-qadam: Web app sozlash

1. **Web** → **Add a new web app** bosing
2. **Manual config** → **Python 3.11** tanlang
3. **Source code** → `wsgi.py` faylini oching
4. Quyidagi kodni yozing:

```python
import sys
sys.path.insert(0, '/home/USERNAME/oquv-markaz-crm/crm')
from app import app as application
```

5. **Reload** tugmasini bosing

### ✅ Natija

`https://USERNAME.pythonanywhere.com` manzili ochiladi!

---

## 🐳 3-usul: Docker (Mahalliy Server)

Agar o'z serveringiz bo'lsa:

```powershell
cd D:\dars_1_kompyuter
docker build -t oquv-markaz-crm .
docker run -p 8080:8080 oquv-markaz-crm
```

---

## ⚠️ Muhim Eslatmalar

### 1. SQLite Ma'lumotlar Bazasi

Cloud platformalarda **SQLite ma'lumotlari o'chishi mumkin** (container o'chsa, baza ham o'chadi).

**Yechim:**
- Ma'lumotlarni muntazam backup qiling
- Yoki PostgreSQL ga o'ting (Supabase bepul)

### 2. Render.com Cheklovlari

- Bepul versiyada server 15 daqiqa faol bo'lmasa, **uxlaydi**
- Keyingi so'rovda avtomatik uyg'onadi (2-3 soniya)
- Bu normal holat

### 3. Xavfsizlik

- Login: `admin` / `admin123`
- Parolni o'zgartirishni unutmang!
- Production da `debug=False` bo'lishi kerak

---

## 🎯 Qaysi birini tanlash kerak?

| Platforma | Qiyinlik | Bepul | Doimiy Baza |
|-----------|----------|-------|-------------|
| **Render.com** | ⭐ Eng oson | ✅ Ha | ❌ Container o'chsa, baza o'chadi |
| **PythonAnywhere** | ⭐⭐ O'rta | ✅ Ha | ✅ Ha |
| **Docker** | ⭐⭐⭐ Qiyin | 💰 Server kerak | ✅ Ha |

**Mening maslahatim:** Avval **Render.com** bilan boshlang — eng oson va tez!

---

## 📞 Yordam Kerakmi?

Agar muammo bo'lsa:
1. Render.com log'larini tekshiring
2. GitHub repository'ingizda barcha fayllar borligini tekshiring
3. `render.yaml` fayli root papkada ekanligiga ishonch hosil qiling

---

**Omad! 🚀**
