from flask import Blueprint, request, jsonify
from models import get_db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Foydalanuvchi login"""
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Login va parol kerak'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username = ? AND password_hash = ?",
        (data['username'], data['password'])
    )
    user = cursor.fetchone()
    conn.close()

    if user is None:
        return jsonify({'error': 'Login yoki parol noto\'g\'ri'}), 401

    user_dict = dict(user)
    # Parolni javobdan olib tashlash
    del user_dict['password_hash']

    return jsonify({
        'message': 'Muvaffaqiyatli kirdingiz!',
        'user': user_dict
    })


@auth_bp.route('/users', methods=['GET'])
def get_users():
    """Barcha foydalanuvchilarni olish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, role, full_name, created_at FROM users ORDER BY created_at DESC")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(users)


@auth_bp.route('/users', methods=['POST'])
def create_user():
    """Yangi foydalanuvchi qo'shish"""
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password_hash'):
        return jsonify({'error': 'Login va parol majburiy'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Tekshirish: login bandmi?
    cursor.execute("SELECT * FROM users WHERE username = ?", (data['username'],))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Bu login allaqachon band'}), 400

    cursor.execute('''
        INSERT INTO users (username, password_hash, role, full_name)
        VALUES (?, ?, ?, ?)
    ''', (
        data['username'],
        data['password_hash'],
        data.get('role', 'teacher'),
        data.get('full_name', '')
    ))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    return jsonify({'id': user_id, 'message': 'Foydalanuvchi muvaffaqiyatli qo\'shildi'}), 201


@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Foydalanuvchini tahrirlash"""
    data = request.get_json()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404

    cursor.execute('''
        UPDATE users SET role=?, full_name=? WHERE id=?
    ''', (
        data.get('role'),
        data.get('full_name'),
        user_id
    ))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Foydalanuvchi muvaffaqiyatli yangilandi'})


@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Foydalanuvchini o'chirish"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404

    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Foydalanuvchi muvaffaqiyatli o\'chirildi'})
