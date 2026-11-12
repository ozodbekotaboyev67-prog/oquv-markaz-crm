from flask import Blueprint, request, jsonify
from models import get_db

courses_bp = Blueprint('courses', __name__)


@courses_bp.route('/', methods=['GET'])
def get_courses():
    """Barcha kurslarni olish"""
    conn = get_db()
    cursor = conn.cursor()

    active = request.args.get('active', '')
    query = "SELECT c.*, u.full_name as teacher_name FROM courses c LEFT JOIN users u ON c.teacher_id = u.id WHERE 1=1"
    params = []

    if active == '1':
        query += " AND c.is_active = 1"
    elif active == '0':
        query += " AND c.is_active = 0"

    query += " ORDER BY c.created_at DESC"
    cursor.execute(query, params)
    courses = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(courses)


@courses_bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    """Bitta kursni olish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.*, u.full_name as teacher_name 
        FROM courses c 
        LEFT JOIN users u ON c.teacher_id = u.id 
        WHERE c.id = ?
    ''', (course_id,))
    course = cursor.fetchone()
    conn.close()

    if course is None:
        return jsonify({'error': 'Kurs topilmadi'}), 404

    return jsonify(dict(course))


@courses_bp.route('/', methods=['POST'])
def create_course():
    """Yangi kurs qo'shish"""
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'Kurs nomi majburiy'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO courses (name, description, duration_hours, price, schedule, teacher_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['name'],
        data.get('description', ''),
        data.get('duration_hours', 0),
        data.get('price', 0),
        data.get('schedule', ''),
        data.get('teacher_id'),
        data.get('is_active', 1)
    ))
    conn.commit()
    course_id = cursor.lastrowid
    conn.close()

    return jsonify({'id': course_id, 'message': 'Kurs muvaffaqiyatli qo\'shildi'}), 201


@courses_bp.route('/<int:course_id>', methods=['PUT'])
def update_course(course_id):
    """Kursni tahrirlash"""
    data = request.get_json()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'error': 'Kurs topilmadi'}), 404

    cursor.execute('''
        UPDATE courses SET name=?, description=?, duration_hours=?, price=?,
        schedule=?, teacher_id=?, is_active=? WHERE id=?
    ''', (
        data.get('name'),
        data.get('description'),
        data.get('duration_hours'),
        data.get('price'),
        data.get('schedule'),
        data.get('teacher_id'),
        data.get('is_active', 1),
        course_id
    ))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Kurs muvaffaqiyatli yangilandi'})


@courses_bp.route('/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    """Kursni o'chirish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'error': 'Kurs topilmadi'}), 404

    cursor.execute("DELETE FROM courses WHERE id = ?", (course_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Kurs muvaffaqiyatli o\'chirildi'})


@courses_bp.route('/<int:course_id>/students', methods=['GET'])
def get_course_students(course_id):
    """Kursdagi talabalarni olish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT DISTINCT s.*, 
            COUNT(DISTINCT p.id) as payment_count,
            COALESCE(SUM(p.amount), 0) as total_paid
        FROM students s
        JOIN payments p ON s.id = p.student_id
        WHERE p.course_id = ? AND s.status = 'active'
        GROUP BY s.id
        ORDER BY s.last_name, s.first_name
    ''', (course_id,))
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(students)
