from flask import Flask, jsonify
from flask_cors import CORS
import sys
import os

# Gunicorn da ishlaganda import'larni to'g'rilash
sys.path.insert(0, os.path.dirname(__file__))

from models import init_db, seed_data
from routes.students import students_bp
from routes.courses import courses_bp
from routes.payments import payments_bp
from routes.lessons import lessons_bp
from routes.auth import auth_bp

app = Flask(__name__)
CORS(app)

# Route'larni ro'yxatga olish
app.register_blueprint(students_bp, url_prefix='/api/students')
app.register_blueprint(courses_bp, url_prefix='/api/courses')
app.register_blueprint(payments_bp, url_prefix='/api/payments')
app.register_blueprint(lessons_bp, url_prefix='/api/lessons')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Baza tayyorlash
init_db()
seed_data()
print("✅ Ma'lumotlar bazasi tayyor!")


@app.route('/')
def index():
    return jsonify({
        'message': "O'quv markaz CRM tizimiga xush kelibsiz!",
        'version': '1.0.0',
        'endpoints': {
            'students': '/api/students',
            'courses': '/api/courses',
            'payments': '/api/payments',
            'lessons': '/api/lessons',
            'auth': '/api/auth/login'
        }
    })


@app.route('/api/dashboard')
def dashboard():
    """Dashboard statistikasi"""
    from models import get_db
    conn = get_db()
    cursor = conn.cursor()

    # Jami talabalar
    cursor.execute("SELECT COUNT(*) FROM students WHERE status = 'active'")
    active_students = cursor.fetchone()[0]

    # Jami kurslar
    cursor.execute("SELECT COUNT(*) FROM courses WHERE is_active = 1")
    active_courses = cursor.fetchone()[0]

    # Jami daromad (barcha to'lovlar)
    cursor.execute("SELECT SUM(amount) FROM payments WHERE status = 'paid'")
    total_revenue = cursor.fetchone()[0] or 0

    # Oyni daromad
    cursor.execute("SELECT SUM(amount) FROM payments WHERE status = 'paid' AND strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')")
    monthly_revenue = cursor.fetchone()[0] or 0

    # Kutilayotgan to'lovlar
    cursor.execute("SELECT SUM(amount) FROM payments WHERE status = 'pending'")
    pending_payments = cursor.fetchone()[0] or 0

    # Yaqindagi darslar
    cursor.execute('''
        SELECT l.id, l.lesson_date, l.start_time, c.name as course_name 
        FROM lessons l 
        JOIN courses c ON l.course_id = c.id 
        WHERE l.lesson_date >= date('now') 
        ORDER BY l.lesson_date ASC 
        LIMIT 5
    ''')
    upcoming_lessons = [dict(row) for row in cursor.fetchall()]

    # Kurs bo'yicha talabalar soni
    cursor.execute('''
        SELECT c.name, COUNT(DISTINCT p.student_id) as student_count 
        FROM courses c 
        LEFT JOIN payments p ON c.id = p.course_id 
        WHERE c.is_active = 1 
        GROUP BY c.id
    ''')
    course_stats = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        'active_students': active_students,
        'active_courses': active_courses,
        'total_revenue': total_revenue,
        'monthly_revenue': monthly_revenue,
        'pending_payments': pending_payments,
        'upcoming_lessons': upcoming_lessons,
        'course_stats': course_stats
    })


if __name__ == '__main__':
    print("\n" + "="*50)
    print("🎓 O'quv markaz CRM tizimi")
    print("="*50)
    print("📡 Server: http://127.0.0.1:5000")
    print("📚 API: http://127.0.0.1:5000/api/dashboard")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)
