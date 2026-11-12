from flask import Blueprint, request, jsonify
from models import get_db

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/', methods=['GET'])
def get_payments():
    """Barcha to'lovlarni olish"""
    conn = get_db()
    cursor = conn.cursor()

    status = request.args.get('status', '')
    student_id = request.args.get('student_id', '')

    query = '''
        SELECT p.*, s.first_name || ' ' || s.last_name as student_name,
               c.name as course_name
        FROM payments p
        JOIN students s ON p.student_id = s.id
        LEFT JOIN courses c ON p.course_id = c.id
        WHERE 1=1
    '''
    params = []

    if status:
        query += " AND p.status = ?"
        params.append(status)

    if student_id:
        query += " AND p.student_id = ?"
        params.append(student_id)

    query += " ORDER BY p.payment_date DESC"
    cursor.execute(query, params)
    payments = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(payments)


@payments_bp.route('/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    """Bitta to'lovni olish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT p.*, s.first_name || ' ' || s.last_name as student_name,
               c.name as course_name
        FROM payments p
        JOIN students s ON p.student_id = s.id
        LEFT JOIN courses c ON p.course_id = c.id
        WHERE p.id = ?
    ''', (payment_id,))
    payment = cursor.fetchone()
    conn.close()

    if payment is None:
        return jsonify({'error': 'To\'lov topilmadi'}), 404

    return jsonify(dict(payment))


@payments_bp.route('/', methods=['POST'])
def create_payment():
    """Yangi to'lov qo'shish"""
    data = request.get_json()

    if not data or not data.get('student_id') or not data.get('amount'):
        return jsonify({'error': 'Talaba va summa majburiy'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO payments (student_id, course_id, amount, payment_date, method, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['student_id'],
        data.get('course_id'),
        data['amount'],
        data.get('payment_date', ''),
        data.get('method', 'naqd'),
        data.get('status', 'paid'),
        data.get('notes', '')
    ))
    conn.commit()
    payment_id = cursor.lastrowid
    conn.close()

    return jsonify({'id': payment_id, 'message': 'To\'lov muvaffaqiyatli qo\'shildi'}), 201


@payments_bp.route('/<int:payment_id>', methods=['PUT'])
def update_payment(payment_id):
    """To'lovni tahrirlash"""
    data = request.get_json()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payments WHERE id = ?", (payment_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'error': 'To\'lov topilmadi'}), 404

    cursor.execute('''
        UPDATE payments SET student_id=?, course_id=?, amount=?, payment_date=?,
        method=?, status=?, notes=? WHERE id=?
    ''', (
        data.get('student_id'),
        data.get('course_id'),
        data.get('amount'),
        data.get('payment_date'),
        data.get('method', 'naqd'),
        data.get('status', 'paid'),
        data.get('notes'),
        payment_id
    ))
    conn.commit()
    conn.close()

    return jsonify({'message': 'To\'lov muvaffaqiyatli yangilandi'})


@payments_bp.route('/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    """To'lovni o'chirish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payments WHERE id = ?", (payment_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'error': 'To\'lov topilmadi'}), 404

    cursor.execute("DELETE FROM payments WHERE id = ?", (payment_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'To\'lov muvaffaqiyatli o\'chirildi'})


@payments_bp.route('/summary', methods=['GET'])
def payment_summary():
    """To'lovlar haqida qisqacha ma'lumot"""
    conn = get_db()
    cursor = conn.cursor()

    # Jami daromad
    cursor.execute("SELECT SUM(amount) FROM payments WHERE status = 'paid'")
    total_paid = cursor.fetchone()[0] or 0

    # Kutilayotgan
    cursor.execute("SELECT SUM(amount) FROM payments WHERE status = 'pending'")
    total_pending = cursor.fetchone()[0] or 0

    # Oyni daromad
    cursor.execute("""
        SELECT SUM(amount) FROM payments 
        WHERE status = 'paid' 
        AND strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')
    """)
    monthly_revenue = cursor.fetchone()[0] or 0

    # To'lov usuli bo'yicha
    cursor.execute('''
        SELECT method, COUNT(*) as count, SUM(amount) as total 
        FROM payments 
        WHERE status = 'paid'
        GROUP BY method
    ''')
    by_method = [dict(row) for row in cursor.fetchall()]

    # Kurs bo'yicha daromad
    cursor.execute('''
        SELECT c.name, COUNT(*) as count, SUM(p.amount) as total 
        FROM payments p 
        JOIN courses c ON p.course_id = c.id 
        WHERE p.status = 'paid'
        GROUP BY c.id
    ''')
    by_course = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        'total_paid': total_paid,
        'total_pending': total_pending,
        'monthly_revenue': monthly_revenue,
        'by_method': by_method,
        'by_course': by_course
    })
