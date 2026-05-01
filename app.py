from flask import Flask, request, jsonify, render_template
from models import db, User, Project, Task
from config import Config
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

with app.app_context():
    db.create_all()

# ------------------ ROUTES ------------------
@app.route('/dashboard')
def dashboard():
    return render_template("dashboard.html")

@app.route('/')
def home():
    return render_template("login.html")

# Signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json

    hashed_password = generate_password_hash(data['password'])

    user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        role=data['role']
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created"})

# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.password, data['password']):
        return jsonify({
            "message": "Login success",
            "user_id": user.id,
            "role": user.role
        })
    return jsonify({"message": "Invalid credentials"}), 401

# Create Project (Admin only)
@app.route('/projects', methods=['POST'])
def create_project():
    data = request.json

    project = Project(
        name=data['name'],
        created_by=data['user_id']
    )

    db.session.add(project)
    db.session.commit()

    return jsonify({"message": "Project created"})

# Get Projects
@app.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()

    result = []
    for p in projects:
        result.append({"id": p.id, "name": p.name})

    return jsonify(result)

# Create Task
@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.json

    task = Task(
        title=data['title'],
        assigned_to=data['assigned_to'],
        project_id=data['project_id'],
        deadline=data['deadline']
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({"message": "Task created"})

# Get Tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()

    result = []
    for t in tasks:
        result.append({
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "deadline": t.deadline
        })

    return jsonify(result)

# Update Task Status
@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.json

    task = Task.query.get(id)
    task.status = data['status']

    db.session.commit()

    return jsonify({"message": "Updated"})

# ------------------

if __name__ == '__main__':
    app.run(debug=True)