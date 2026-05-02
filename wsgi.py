import sys
import os

# Ensure the emergency_route package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'emergency_route'))

from app import app

if __name__ == "__main__":
    app.run()
