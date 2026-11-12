from flask import Blueprint, request, jsonify
from models import get_db

students_bp = Blueprint('students', __name__)


@students_bp.route('/', methods=['GET'])
def get_students():
    """Barcha talabalarni olish"""
    conn = get_db()
    cursor = conn.cursor()

    # Qidiruv parametri
    search = request.args.get('search', '')
    status = request.args.get('status', '')

    query = "SELECT * FROM students WHERE 1=1"
    params = []

    if search:
        query += " AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ?)"
        params.extend([f'%{search}%', f'%{search}%', f'%{search}%'])

    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY created_at DESC"

    cursor.execute(query, params)
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(students)


@students_bp.route('/<int:student_id>', methods=['GET'])
def get_student(student_id):
    """Bitta talabani olish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = cursor.fetchone()
    conn.close()

    if student is None:
        return jsonify({'error': 'Talaba topilmadi'}), 404

    return jsonify(dict(student))


@students_bp.route('/', methods=['POST'])
def create_student():
    """Yangi talaba qo'shish"""
    data = request.get_json()

    if not data or not data.get('first_name') or not data.get('last_name'):
        return jsonify({'error': 'Ism va familiya majburiy'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO students (first_name, last_name, phone, email, enrollment_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['first_name'],
        data['last_name'],
        data.get('phone', ''),
        data.get('email', ''),
        data.get('enrollment_date', ''),
        data.get('status', 'active'),
        data.get('notes', '')
    ))
    conn.commit()
    student_id = cursor.lastrowid
    conn.close()

    return jsonify({'id': student_id, 'message': 'Talaba muvaffaqiyatli qo\'shildi'}), 201


@students_bp.route('/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    """Talabani tahrirlash"""
    data = request.get_json()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'error': 'Talaba topilmadi'}), 404

    cursor.execute('''
        UPDATE students SET first_name=?, last_name=?, phone=?, email=?,
        enrollment_date=?, status=?, notes=?
        WHERE id=?
    ''', (
        data.get('first_name'),
        data.get('last_name'),
        data.get('phone'),
        data.get('email'),
        data.get('enrollment_date'),
        data.get('status', 'active'),
        data.get('notes'),
        student_id
    ))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Talaba muvaffaqiyatli yangilandi'})


@students_bp.route('/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Talabani o'chirish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'error': 'Talaba topilmadi'}), 404

    cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Talaba muvaffaqiyatli o\'chirildi'})


@students_bp.route('/<int:student_id>/payments', methods=['GET'])
def get_student_payments(student_id):
    """Talabaning to'lovlarini olish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT p.*, c.name as course_name 
        FROM payments p 
        LEFT JOIN courses c ON p.course_id = c.id 
        WHERE p.student_id = ? 
        ORDER BY p.payment_date DESC
    ''', (student_id,))
    payments = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(payments)


@students_bp.route('/<int:student_id>/attendance', methods=['GET'])
def get_student_attendance(student_id):
    """Talabaning qatnashuvchiligini olish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT a.status, a.created_at, l.lesson_date, l.start_time, c.name as course_name
        FROM attendance a
        JOIN lessons l ON a.lesson_id = l.id
        JOIN courses c ON l.course_id = c.id
        WHERE a.student_id = ?
        ORDER BY l.lesson_date DESC
    ''', (student_id,))
    attendance = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(attendance)
