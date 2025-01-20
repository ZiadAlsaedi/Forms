from flask import Flask, json, request, jsonify, session, make_response
from flask_cors import CORS
import sqlite3
import os
import re

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app, supports_credentials=True)  

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS forms(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            fields TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)    
        )                 
    ''')

    cursor.execute(''' 
        CREATE TABLE IF NOT EXISTS form_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            submitted_data TEXT NOT NULL,
            FOREIGN KEY (form_id) REFERENCES forms(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        ) 
    ''')

    conn.commit()
    conn.close()

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name:
        return jsonify({"message": "Name is required"}), 400
    if not email:
        return jsonify({"message": "Email is required"}), 400
    if not password:
        return jsonify({"message": "Password is required"}), 400

    email_regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if not re.match(email_regex, email):
        return jsonify({"message": "Invalid email format"}), 400

    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters long"}), 400

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        return jsonify({"message": "Email already in use"}), 400

    cursor.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', (name, email, password))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "message": "User created successfully",
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }), 201

@app.route('/signin', methods=['POST']) 
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email:
        return jsonify({"message": "Email is required"}), 400
    if not password:
        return jsonify({"message": "Password is required"}), 400

    email_regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if not re.match(email_regex, email):
        return jsonify({"message": "Invalid email format"}), 400


    conn = sqlite3.connect('database.db') 
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, password FROM users WHERE email = ?', (email,)) 
    user = cursor.fetchone()
    conn.close()

    if user and user[2] == password:
        session['user'] = {'id': user[0], 'name': user[1], 'email': email}
        response = make_response(jsonify({"message": "Sign-in successful", "user": session['user']}))
        return response, 200 
    else:
        return jsonify({"message": "Invalid email or password"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    response = make_response(jsonify({'message': 'Logged out successfully'}))
    return response, 200

@app.route('/get_user', methods=['GET'])
def get_user():
    user = session.get('user')
    if user:
        return jsonify({'user': user}), 200
    else:
        return jsonify({'message': 'No user logged in'}), 401

@app.route('/forms', methods=["POST"])
def add_form():
    data = request.get_json()
    user_id = session.get('user').get('id')
    title = data.get('title')
    description = data.get('description')
    fields = data.get('fields')

    if not title or not description or not fields:
      return jsonify({"message": "All fields (title, description, fields) are required"}), 400
    if len(title) < 1: 
        return jsonify({"message": "Title must be at least 1 characters long"}), 400
    if len(description) < 3:
        return jsonify({"message": "Description must be at least 3 characters long"}),400

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO forms (user_id, title, description, fields) VALUES (?, ?, ?, ?)', (user_id, title, description, fields))
    form_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({ 
        "message": "Form created successfully",
        "form": { 
            "id": form_id, 
            "user_id": user_id, 
            "title": title, 
            "description": description, 
            "fields": fields 
        } 
    }), 201

@app.route('/forms', methods=['GET'])
def get_forms():
    user_id = session.get('user').get('id')

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, title, description, fields FROM forms WHERE user_id = ?', (user_id,))
    forms = cursor.fetchall()
    conn.close()

    forms_list = [{"id": form[0], 'title': form[1], "description": form[2], "fields": form[3]} for form in forms]
    return jsonify(forms_list), 200

@app.route('/forms/<int:id>', methods=['GET'])
def get_form(id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, user_id, title, description, fields FROM forms WHERE id = ?', (id,))
    form = cursor.fetchone()
    conn.close()
    
    if form:
        form_details = {"id": form[0], "user_id": form[1], "title": form[2], "description": form[3], "fields": form[4]}
        return jsonify(form_details), 200
    else:
        return jsonify({"message": "Form not found"}), 404

@app.route('/forms/<int:id>/submissions/', methods=['POST'])
def submit_form(id):
    data = request.get_json()
    formData = data.get('formData')
    user_id = session.get('user').get('id')

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    try:
        cursor.execute(
            'INSERT INTO form_submissions (form_id, user_id, submitted_data) VALUES (?, ?, ?)',
            (id, user_id, json.dumps(formData))
        )
        conn.commit()
        response = jsonify({"message": "Form submitted successfully"})
        response.status_code = 200
    except sqlite3.Error as e:
        conn.rollback()
        response = jsonify({"message": "Form submission failed"})
        response.status_code = 500
    finally:
        conn.close()
    return response

@app.route('/forms/<int:form_id>/submissions/', methods=['GET'])
def get_replies(form_id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, form_id, user_id, submitted_data FROM form_submissions WHERE form_id = ?', (form_id,))
    replies = cursor.fetchall()
    conn.close()

    if replies:
        replies_data = []
        for reply in replies:
            replies_data.append({
                "id": reply[0],
                "form_id": reply[1],
                "user_id": reply[2],
                "submitted_data": json.loads(reply[3])
            })
        return jsonify(replies_data), 200
    else:
        return jsonify({"message": "Replies not found"}), 404
    
    return jsonify(replies_data)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
