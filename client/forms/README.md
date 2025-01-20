# Full-Stack Setup with Next.js and Flask

This guide demonstrates how to set up a full-stack web application using **Next.js** for the frontend and **Flask** for the backend. You can run the backend (Flask) on one terminal and the frontend (Next.js) on another, connecting them for a full-stack experience.

## Instructions

Follow these steps to set up the project using a bash script.

### Step 1: Create the Full-Stack Application

Create a `setup_fullstack.sh` file and paste the following script:

```bash
#!/bin/bash

# Create project directory
mkdir next-flask-fullstack
cd next-flask-fullstack

# Set up the Backend (Flask)
echo "Setting up Flask Backend..."

# Create the backend directory and navigate to it
mkdir backend
cd backend

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install Flask
pip install Flask

# Create the Flask app (app.py)
cat <<EOF > app.py
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data():

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
EOF

# Go back to the root directory
cd ..

# Set up the Frontend (Next.js)
echo "Setting up Next.js Frontend..."

# Create the frontend directory and navigate to it
npx create-next-app@latest  

# Navigate to the frontend directory
cd frontend


# Display instructions for running the servers
echo "Setup complete! To start the project, follow these steps:"

echo "1. In one terminal window, navigate to the 'backend' directory and run the Flask server:"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python app.py"
echo "   Flask API should be running on http://localhost:5000"

echo "2. In another terminal window, navigate to the 'frontend' directory and run the Next.js server:"
echo "   cd frontend"
echo "   npm run dev"
echo "   Next.js frontend should be running on http://localhost:3000"

echo "Visit http://localhost:3000 to see the full-stack app in action!"
