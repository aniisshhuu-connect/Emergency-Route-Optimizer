# 🚑 Emergency Route Optimizer

[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-ED1C24?style=for-the-badge&logo=cytoscape&logoColor=white)](https://js.cytoscape.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

**Emergency Route Optimizer** is a sophisticated web application designed to navigate city grids during emergencies. By leveraging a **Hybrid Algorithm** combining Dijkstra, Backtracking, and Randomization, it identifies the fastest path while accounting for real-time traffic simulations.

---

## ✨ Features

- 🏥 **City Grid Visualization**: Interactive 12-node graph representing city intersections and hospitals.
- ⚡ **Hybrid Optimization**: 
  - **Dijkstra**: Foundation for baseline shortest path calculation.
  - **Backtracking**: Exhaustive path search to evaluate alternatives under stress.
  - **Randomization**: Simulates dynamic traffic delays and road closures.
- 🚦 **Real-time Simulation**: Toggle traffic conditions to see how the optimizer adapts to delays.
- 📊 **Performance Analytics**: Compares the "Ideal Path" vs. "Traffic-Adjusted Path" with time-saved metrics.
- 🎨 **Modern UI**: Clean, responsive dashboard built with a premium aesthetic and Cytoscape.js.

---

## 🛠️ Tech Stack

- **Backend**: Python, Flask
- **Frontend**: Javascript (Cytoscape.js), HTML5, CSS3 (Inter Typography)
- **Algorithms**:
  - Dijkstra (Baseline Shortest Path)
  - Backtracking (All-Paths Discovery)
  - Randomization (Traffic Delay Simulation)

---

## 🚀 Getting Started

### Prerequisites

- Python 3.x
- pip (Python Package Installer)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd "Emergency Route Optimizer"
   ```

2. **Setup Virtual Environment** (Optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install flask
   ```

### Running the Application

1. Navigate to the `emergency_route` directory:
   ```bash
   cd emergency_route
   ```

2. Start the Flask server:
   ```bash
   python app.py
   ```

3. Open your browser and visit:
   `http://127.0.0.1:5555`

---

## 🧠 How it Works

1. **Graph Initialization**: The city is modeled as an undirected weighted graph where nodes are locations and edges are roads.
2. **Dijkstra's Phase**: Upon selecting a start and end, the system calculates the theoretical shortest path using the Dijkstra algorithm.
3. **Traffic Simulation (Randomization)**: When traffic is simulated, random delays (weights) are added to specific edges.
4. **Hybrid Re-calculation**: The system uses backtracking to evaluate all possible routes against the new weights, ensuring the selected path is truly optimal under current conditions.
5. **Visualization**: Cytoscape.js highlights the optimal route in real-time, providing visual feedback to the user.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ for Emergency Responders.**
