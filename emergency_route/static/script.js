const cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [],
    style: [
        {
            selector: 'node',
            style: {
                'background-color': '#3b82f6',
                'label': 'data(id)',
                'color': '#fff',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '14px',
                'font-weight': 'bold',
                'width': '40px',
                'height': '40px'
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#475569',
                'target-arrow-color': '#475569',
                'target-arrow-shape': 'none',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'color': '#f8fafc',
                'font-size': '12px',
                'text-background-color': '#1e293b',
                'text-background-opacity': 1,
                'text-background-padding': '4px',
                'text-background-shape': 'roundrectangle'
            }
        },
        {
            selector: '.highlighted',
            style: {
                'background-color': '#10b981',
                'line-color': '#10b981',
                'target-arrow-color': '#10b981',
                'width': 5,
                'transition-property': 'background-color, line-color, target-arrow-color',
                'transition-duration': '0.5s',
                'z-index': 10
            }
        },
        {
            selector: '.delayed',
            style: {
                'line-color': '#ef4444',
                'color': '#ef4444'
            }
        }
    ],
    layout: {
        name: 'preset'
    }
});

let isTrafficSimulation = false;

document.getElementById('findRouteBtn').addEventListener('click', () => {
    isTrafficSimulation = false;
    calculateRoute();
});

document.getElementById('simulateBtn').addEventListener('click', () => {
    isTrafficSimulation = true;
    calculateRoute();
});

async function calculateRoute() {
    const startNode = document.getElementById('start').value;
    const endNode = document.getElementById('end').value;

    if (startNode === endNode) {
        alert("Start and destination cannot be the same!");
        return;
    }

    const btn1 = document.getElementById('findRouteBtn');
    const btn2 = document.getElementById('simulateBtn');
    
    const originalText1 = btn1.innerText;
    const originalText2 = btn2.innerText;

    if(isTrafficSimulation) btn2.innerText = "Simulating...";
    else btn1.innerText = "Calculating...";

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                start: startNode,
                end: endNode,
                simulate_traffic: isTrafficSimulation
            })
        });

        const data = await response.json();
        
        if (data.error) {
            alert(data.error);
            return;
        }

        updateUI(data);
        updateGraph(data);

    } catch (error) {
        console.error("Error calculating route:", error);
        alert("An error occurred. Make sure the backend is running.");
    } finally {
        btn1.innerText = originalText1;
        btn2.innerText = originalText2;
    }
}

function updateUI(data) {
    const content = document.getElementById('resultContent');
    
    let delaysHtml = '';
    if (data.delays.length > 0) {
        delaysHtml = `<div class="delay-info">Traffic delays detected on: ${data.delays.map(d => `${d.edge} (+${d.delay}m)`).join(', ')}</div>`;
    }

    content.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">Best Route Found</div>
            <div class="stat-value route-text">${data.best_path.join(' → ')}</div>
            ${delaysHtml}
        </div>
        
        <div class="stat-item">
            <div class="stat-label">Total Estimated Time</div>
            <div class="stat-value">${data.best_cost} mins</div>
        </div>

        <div class="stat-item">
            <div class="stat-label">Comparison to Normal Route (${data.normal_path.join(' → ')})</div>
            <div class="stat-value" style="font-size: 1rem; font-weight: normal;">
                Old route would now take: <b>${data.normal_path_new_cost} mins</b><br>
                ${data.time_saved > 0 ? `<span class="time-saved">You saved ${data.time_saved} mins using hybrid routing!</span>` : `<span style="color: #94a3b8;">No faster alternative found.</span>`}
            </div>
        </div>
    `;
}

const nodePositions = {
    'A': {x: 50, y: 300}, 'B': {x: 200, y: 150}, 'C': {x: 200, y: 450},
    'D': {x: 200, y: 300}, 'E': {x: 400, y: 300}, 'F': {x: 550, y: 150},
    'G': {x: 550, y: 450}, 'H': {x: 700, y: 300}, 'I': {x: 700, y: 150},
    'J': {x: 700, y: 450}, 'K': {x: 850, y: 200}, 'L': {x: 950, y: 300}
};

function updateGraph(data) {
    cy.elements().remove();
    const elements = [];
    const addedNodes = new Set();
    const addedEdges = new Set();

    // Add nodes
    for (const node in data.current_graph) {
        if (!addedNodes.has(node)) {
            elements.push({ 
                data: { id: node },
                position: nodePositions[node]
            });
            addedNodes.add(node);
        }
    }

    // Add edges
    for (const u in data.current_graph) {
        for (const v in data.current_graph[u]) {
            const edgeId = [u, v].sort().join('-');
            if (!addedEdges.has(edgeId)) {
                
                const weight = data.current_graph[u][v];
                const baseWeight = data.base_graph[u][v];
                const isDelayed = weight > baseWeight;
                
                const label = isDelayed ? `${weight} (+${weight - baseWeight})` : `${weight}`;

                elements.push({
                    data: {
                        id: edgeId,
                        source: u,
                        target: v,
                        label: label,
                        isDelayed: isDelayed
                    },
                    classes: isDelayed ? 'delayed' : ''
                });
                addedEdges.add(edgeId);
            }
        }
    }

    cy.add(elements);
    
    cy.layout({ name: 'preset' }).run();
    cy.fit(elements, 50); // Pad nicely within container

    // Highlight best path
    let delay = 0;
    for (let i = 0; i < data.best_path.length; i++) {
        const node = data.best_path[i];
        setTimeout(() => {
            cy.$(`#${node}`).addClass('highlighted');
        }, delay);
        delay += 300;

        if (i < data.best_path.length - 1) {
            const nextNode = data.best_path[i + 1];
            const edgeId = [node, nextNode].sort().join('-');
            setTimeout(() => {
                cy.$(`#${edgeId}`).addClass('highlighted');
            }, delay);
            delay += 300;
        }
    }
}

// Initial dummy graph load
document.addEventListener('DOMContentLoaded', () => {
    const elements = [];
    
    for (const [id, pos] of Object.entries(nodePositions)) {
        elements.push({ data: { id: id }, position: pos });
    }
    
    const edges = [
        ['A', 'B', 5], ['A', 'D', 4], ['A', 'C', 5],
        ['B', 'F', 8], ['B', 'D', 3],
        ['C', 'D', 3], ['C', 'G', 8],
        ['D', 'E', 4],
        ['E', 'F', 4], ['E', 'H', 6], ['E', 'G', 4],
        ['F', 'I', 5],
        ['G', 'J', 5],
        ['H', 'I', 4], ['H', 'L', 7], ['H', 'J', 4],
        ['I', 'K', 3], ['I', 'L', 6],
        ['J', 'L', 6],
        ['K', 'L', 4]
    ];
    
    edges.forEach(e => {
        elements.push({
            data: { id: `${e[0]}-${e[1]}`, source: e[0], target: e[1], label: `${e[2]}` }
        });
    });

    cy.add(elements);
    cy.layout({ name: 'preset' }).run();
    cy.fit(elements, 50);
});
