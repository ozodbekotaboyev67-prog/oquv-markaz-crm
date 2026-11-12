from flask import Blueprint, request, jsonify
from models import get_db

lessons_bp = Blueprint('lessons', __name__)


@lessons_bp.route('/', methods=['GET'])
def get_lessons():
    """Barcha darslarni olish"""
    conn = get_db()
    cursor = conn.cursor()

    course_id = request.args.get('course_id', '')
    date_from = request.args.get('date_from', '')
    date_to = request.args.get('date_to', '')

    query = '''
        SELECT l.*, c.name as course_name, u.full_name as teacher_name
        FROM lessons l
        JOIN courses c ON l.course_id = c.id
        LEFT JOIN users u ON l.teacher_id = u.id
        WHERE 1=1
    '''
    params = []

    if course_id:
        query += " AND l.course_id = ?"
        params.append(course_id)

    if date_from:
        query += " AND l.lesson_date >= ?"
        params.append(date_from)

    if date_to:
        query += " AND l.lesson_date <= ?"
        params.append(date_to)

    query += " ORDER BY l.lesson_date DESC, l.start_time DESC"
    cursor.execute(query, params)
    lessons = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(lessons)


@lessons_bp.route('/<int:lesson_id>', methods=['GET'])
def get_lesson(lesson_id):
    """Bitta darsni olish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT l.*, c.name as course_name, u.full_name as teacher_name
        FROM lessons l
        JOIN courses c ON l.course_id = c.id
        LEFT JOIN users u ON l.teacher_id = u.id
        WHERE l.id = ?
    ''', (lesson_id,))
    lesson = cursor.fetchone()
    conn.close()

    if lesson is None:
        return jsonify({'error': 'Dars topilmadi'}), 404

    return jsonify(dict(lesson))


@lessons_bp.route('/', methods=['POST'])
def create_lesson():
    """Yangi dars qo'shish"""
    data = request.get_json()

    if not data or not data.get('course_id') or not data.get('lesson_date'):
        return jsonify({'error': 'Kurs va sana majburiy'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO lessons (course_id, teacher_id, lesson_date, start_time, end_time, is_completed)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['course_id'],
        data.get('teacher_id'),
        data['lesson_date'],
        data.get('start_time', ''),
        data.get('end_time', ''),
        data.get('is_completed', 0)
    ))
    conn.commit()
    lesson_id = cursor.lastrowid
    conn.close()

    return jsonify({'id': lesson_id, 'message': 'Dars muvaffaqiyatli qo\'shildi'}), 201


@lessons_bp.route('/<int:lesson_id>', methods=['PUT'])
def update_lesson(lesson_id):
    """Darsni tahrirlash"""
    data = request.get_json()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM lessons WHERE id = ?", (lesson_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'error': 'Dars topilmadi'}), 404

    cursor.execute('''
        UPDATE lessons SET course_id=?, teacher_id=?, lesson_date=?,
        start_time=?, end_time=?, is_completed=? WHERE id=?
    ''', (
        data.get('course_id'),
        data.get('teacher_id'),
        data.get('lesson_date'),
        data.get('start_time'),
        data.get('end_time'),
        data.get('is_completed', 0),
        lesson_id
    ))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Dars muvaffaqiyatli yangilandi'})


@lessons_bp.route('/<int:lesson_id>', methods=['DELETE'])
def delete_lesson(lesson_id):
    """Darsni o'chirish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM lessons WHERE id = ?", (lesson_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'error': 'Dars topilmadi'}), 404

    cursor.execute("DELETE FROM lessons WHERE id = ?", (lesson_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Dars muvaffaqiyatli o\'chirildi'})


# ===== QATNASHUVCHILIK (Attendance) =====

@lessons_bp.route('/<int:lesson_id>/attendance', methods=['GET'])
def get_attendance(lesson_id):
    """Darsdagi qatnashuvchilarni olish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT a.*, s.first_name, s.last_name, s.phone
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.lesson_id = ?
        ORDER BY s.last_name, s.first_name
    ''', (lesson_id,))
    attendance = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(attendance)


@lessons_bp.route('/<int:lesson_id>/attendance', methods=['POST'])
def add_attendance(lesson_id):
    """Qatnashuvchilik qo'shish"""
    data = request.get_json()

    if not data or not data.get('student_id'):
        return jsonify({'error': 'Talaba ID majburiy'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Tekshirish: allaqachon qo'shilganmi?
    cursor.execute("SELECT * FROM attendance WHERE lesson_id = ? AND student_id = ?",
                   (lesson_id, data['student_id']))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Talaba allaqachon ro\'yxatda'}), 400

    cursor.execute('''
        INSERT INTO attendance (lesson_id, student_id, status)
        VALUES (?, ?, ?)
    ''', (
        lesson_id,
        data['student_id'],
        data.get('status', 'present')
    ))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Qatnashuvchilik qayd etildi'}), 201


@lessons_bp.route('/<int:lesson_id>/attendance/bulk', methods=['POST'])
def bulk_attendance(lesson_id):
    """Ko'p talabalar uchun qatnashuvchilik qo'shish"""
    data = request.get_json()

    if not data or not data.get('attendance_list'):
        return jsonify({'error': 'attendance_list majburiy'}), 400

    conn = get_db()
    cursor = conn.cursor()
    count = 0

    for item in data['attendance_list']:
        student_id = item.get('student_id')
        status = item.get('status', 'present')

        if not student_id:
            continue

        cursor.execute('''
            INSERT OR REPLACE INTO attendance (lesson_id, student_id, status)
            VALUES (?, ?, ?)
        ''', (lesson_id, student_id, status))
        count += 1

    conn.commit()
    conn.close()

    return jsonify({'message': f'{count} ta talaba qatnashuvchiligi qayd etildi'})


@lessons_bp.route('/<int:lesson_id>/students', methods=['GET'])
def get_lesson_students(lesson_id):
    """Darsga yozilgan barcha talabalarni olish (qatnashuvchilik bilan)"""
    conn = get_db()
    cursor = conn.cursor()

    # Kursdagi barcha faol talabalar
    cursor.execute('''
        SELECT s.id, s.first_name, s.last_name, s.phone,
               a.status as attendance_status
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id AND a.lesson_id = ?
        WHERE s.status = 'active'
        ORDER BY s.last_name, s.first_name
    ''', (lesson_id,))
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(students)
