import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'database', 'crm.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Foydalanuvchilar jadvali
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'teacher',
            full_name TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Talabalar jadvali
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            enrollment_date TEXT,
            status TEXT DEFAULT 'active',
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Kurslar jadvali
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            duration_hours INTEGER DEFAULT 0,
            price REAL DEFAULT 0,
            schedule TEXT,
            teacher_id INTEGER,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES users(id)
        )
    ''')

    # To'lovlar jadvali
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_id INTEGER,
            amount REAL NOT NULL,
            payment_date TEXT,
            method TEXT DEFAULT 'naqd',
            status TEXT DEFAULT 'paid',
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
    ''')

    # Darslar jadvali
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            teacher_id INTEGER,
            lesson_date TEXT NOT NULL,
            start_time TEXT,
            end_time TEXT,
            is_completed INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id),
            FOREIGN KEY (teacher_id) REFERENCES users(id)
        )
    ''')

    # Qatnashuvchilik jadvali
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            status TEXT DEFAULT 'present',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES lessons(id),
            FOREIGN KEY (student_id) REFERENCES students(id),
            UNIQUE(lesson_id, student_id)
        )
    ''')

    conn.commit()
    conn.close()


def seed_data():
    """Namuna ma'lumotlarni qo'shish"""
    conn = get_db()
    cursor = conn.cursor()

    # Tekshirish: agar ma'lumotlar bo'sh bo'lsa, to'ldiramiz
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # Admin foydalanuvchi
    cursor.execute('''
        INSERT INTO users (username, password_hash, role, full_name)
        VALUES (?, ?, ?, ?)
    ''', ('admin', 'admin123', 'admin', 'Administrator'))

    # O'qituvchilar
    cursor.execute('''
        INSERT INTO users (username, password_hash, role, full_name)
        VALUES (?, ?, ?, ?)
    ''', ('teacher1', 'teacher123', 'teacher', 'Abdulloev Karim'))

    cursor.execute('''
        INSERT INTO users (username, password_hash, role, full_name)
        VALUES (?, ?, ?, ?)
    ''', ('teacher2', 'teacher123', 'teacher', 'Rustamova Nilufar'))

    # Talabalar
    students = [
        ('Alisher', 'Karimov', '+998901234567', 'alisher@email.com', '2024-09-01', 'active', 'Python kursi'),
        ('Madina', 'Toshmatova', '+998912345678', 'madina@email.com', '2024-09-01', 'active', 'Web dasturlash'),
        ('Bobur', 'Aliyev', '+998933456789', 'bobur@email.com', '2024-09-15', 'active', 'Python kursi'),
        ('Dilnoza', 'Saidova', '+998944567890', 'dilnoza@email.com', '2024-10-01', 'active', 'Dizayn kursi'),
        ('Jasur', 'Normatov', '+998955678901', 'jasur@email.com', '2024-09-01', 'graduated', 'Tamomlagan'),
        ('Nilufar', 'Ergasheva', '+998916789012', 'nilufar@email.com', '2024-10-15', 'active', 'Web dasturlash'),
        ('Sardor', 'Xolmatov', '+998937890123', 'sardor@email.com', '2024-11-01', 'active', 'Python kursi'),
        ('Malika', 'Baxriddinova', '+998948901234', 'malika@email.com', '2024-09-15', 'dropped_out', 'Chiqib ketgan'),
    ]

    cursor.executemany('''
        INSERT INTO students (first_name, last_name, phone, email, enrollment_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', students)

    # Kurslar
    courses = [
        ('Python dasturlash', 'Python asoslari va ilovalar', 120, 1500000, 'Dushanba, Chorshanba, Juma 18:00-20:00', 1, 1),
        ('Web dasturlash', 'HTML, CSS, JavaScript, React', 160, 2000000, 'Seshanba, Payshanba 17:00-19:00', 2, 1),
        ('Grafik dizayn', 'Photoshop, Illustrator, Figma', 80, 1200000, 'Dushanba, Chorshanba 16:00-18:00', 2, 1),
        ('Ingliz tili', 'General English B1-B2', 100, 1000000, 'Har kuni 19:00-20:30', 1, 1),
    ]

    cursor.executemany('''
        INSERT INTO courses (name, description, duration_hours, price, schedule, teacher_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', courses)

    # To'lovlar
    payments = [
        (1, 1, 1500000, '2024-09-01', 'naqd', 'paid', 'Sentyabr to\'lovi'),
        (2, 2, 2000000, '2024-09-01', 'karta', 'paid', 'Sentyabr to\'lovi'),
        (3, 1, 1500000, '2024-09-15', 'naqd', 'paid', 'Qo\'shimcha to\'lov'),
        (1, 1, 1500000, '2024-10-01', 'naqd', 'paid', 'Oktyabr to\'lovi'),
        (2, 2, 2000000, '2024-10-01', 'karta', 'paid', 'Oktyabr to\'lovi'),
        (4, 3, 1200000, '2024-10-01', 'naqd', 'paid', 'Birinchi to\'lov'),
        (5, 4, 1000000, '2024-09-01', 'karta', 'paid', 'Sentyabr to\'lov'),
        (6, 2, 2000000, '2024-10-15', 'naqd', 'paid', 'Birinchi to\'lov'),
        (7, 1, 1500000, '2024-11-01', 'naqd', 'paid', 'Noyabr to\'lov'),
        (1, 1, 1500000, '2024-11-15', 'naqd', 'pending', 'Kutilmoqda'),
        (3, 1, 1500000, '2024-11-01', 'naqd', 'paid', 'Noyabr to\'lov'),
        (4, 3, 1200000, '2024-11-01', 'karta', 'pending', 'Kutilmoqda'),
    ]

    cursor.executemany('''
        INSERT INTO payments (student_id, course_id, amount, payment_date, method, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', payments)

    # Darslar
    lessons = [
        (1, 1, '2024-11-11', '18:00', '20:00', 1),
        (1, 1, '2024-11-13', '18:00', '20:00', 0),
        (1, 1, '2024-11-15', '18:00', '20:00', 0),
        (2, 2, '2024-11-12', '17:00', '19:00', 0),
        (2, 2, '2024-11-14', '17:00', '19:00', 0),
        (3, 2, '2024-11-12', '16:00', '18:00', 0),
        (4, 1, '2024-11-12', '19:00', '20:30', 0),
    ]

    cursor.executemany('''
        INSERT INTO lessons (course_id, teacher_id, lesson_date, start_time, end_time, is_completed)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', lessons)

    # Qatnashuvchilik (birinchi dars uchun)
    attendance = [
        (1, 1, 'present'),
        (1, 3, 'present'),
        (1, 7, 'late'),
        (1, 5, 'absent'),
    ]

    cursor.executemany('''
        INSERT INTO attendance (lesson_id, student_id, status)
        VALUES (?, ?, ?)
    ''', attendance)

    conn.commit()
    conn.close()


# Dastur ishga tushganda bazani yaratish
# init_db() va seed_data() app.py da chaqiriladi
