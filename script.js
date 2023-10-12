const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let totalCreatedPoints = 0;
const centralPoint = {
    x: canvas.width / 2,
    y: canvas.height / 2
};
let pointToWatch;
const POINT_SIZE = 50;
const ENERGY_DECAY = 0.01;
let myChart;
const ctxChart = document.getElementById('myChart').getContext('2d');
myChart = new Chart(ctxChart, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Alive',
                data: [],
                borderColor: 'rgba(0, 128, 0, 1)',
                fill: false
            },
            {
                label: 'Dead',
                data: [],
                borderColor: 'rgba(255, 0, 0, 1)',
                fill: false
            }
        ]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom'
            }
        }
    }
});
function generateRandomPoint(center, maxDistance) {
    const angle = 0;
    const distance =  maxDistance;

    return {
        x: center.x + distance * Math.cos(angle),
        y: center.y + distance * Math.sin(angle),
        size: POINT_SIZE,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        energy: 1,
        collided: false,
        flashColor: null
    };
}

const points = [];

function isColliding(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 2 * POINT_SIZE;
}

function handleCollision(pointA, pointB) {
    const m1 = pointA.energy, m2 = pointB.energy;
    const v1i = {x: pointA.vx, y: pointA.vy};
    const v2i = {x: pointB.vx, y: pointB.vy};

    pointA.vx = ((m1 - m2) / (m1 + m2)) * v1i.x + ((2 * m2) / (m1 + m2)) * v2i.x;
    pointA.vy = ((m1 - m2) / (m1 + m2)) * v1i.y + ((2 * m2) / (m1 + m2)) * v2i.y;

    pointB.vx = ((2 * m1) / (m1 + m2)) * v1i.x - ((m1 - m2) / (m1 + m2)) * v2i.x;
    pointB.vy = ((2 * m1) / (m1 + m2)) * v1i.y - ((m1 - m2) / (m1 + m2)) * v2i.y;
    
    pointA.collided = false;
    pointB.collided = false;
    if (pointA.energy <= 0.1 && pointB.energy > pointA.energy) {
        pointB.energy += pointB.energy * pointA.energy;
        pointA.energy = 0;
        pointB.flashColor = "blue";
    } else if (pointB.energy <= 0.1 && pointA.energy > pointB.energy) {
        pointA.energy += pointA.energy * pointB.energy;
        pointB.energy = 0;
        pointA.flashColor = "blue";
    }
    pointA.x += pointA.vx;
    pointA.y += pointA.vy;
    pointB.x += pointB.vx;
    pointB.y += pointB.vy;
}
function updatePointDataDisplay(point) {
    
    
}
function updatePoints() {
    for (let i = points.length - 1; i >= 0; i--) {
        const point = points[i];

        // Decay energy over time
        point.energy -= ENERGY_DECAY;

        // Update momentum potential based on energy
        point.momentumPotential = 0.5 + (point.energy - 0.1) * 0.5;

        // Check for collisions
        for (let otherPoint of points) {
            if (point !== otherPoint && isColliding(point, otherPoint)) {
                handleCollision(point, otherPoint);
            }
        }

        // Bounce off canvas edges (only check, no position update here)
        if (point.x - POINT_SIZE < 0 || point.x + POINT_SIZE > canvas.width) {
            point.vx = -point.vx;
        }
        if (point.y - POINT_SIZE < 0 || point.y + POINT_SIZE > canvas.height) {
            point.vy = -point.vy;
        }

        // Remove dots with 0 energy
        if (point.energy === 0) {
            points.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // const newPoint = generateRandomPoint(centralPoint, 50);
    // points.push(newPoint);
    // totalCreatedPoints++;
    updatePoints();

    let aliveCount = 0;
    let deadCount = 0;

    for (let i = 0; i < points.length; i++) {
        let point = points[i];
        
        // Count alive and dead dots
        if (point.energy > 0.2) {
            aliveCount++;
        } else {
            deadCount++;
        }

        const colorIntensity = Math.floor(255 * point.energy);
        ctx.beginPath();
        
        // Determine fill color
        const defaultColor = i == 0 ? `rgb(${colorIntensity}, 0, 0)` : `rgb(${colorIntensity/3}, ${colorIntensity*2}, ${colorIntensity})`;
        const fillColor = point.flashColor || defaultColor;
        ctx.fillStyle = fillColor;
        
        // Determine size (special dot is larger)
        const size = i == 20 ? POINT_SIZE * 1.5 : POINT_SIZE;
        
        ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);
        ctx.fill();

        // Reset flash color after drawing
        point.flashColor = null;
    }

    if (!pointToWatch  && points.length > 20) {
        pointToWatch=points[20]
        // updatePointDataDisplay(points[200]);
    }
    if (myChart) {
        myChart.data.labels.push(totalCreatedPoints);
        myChart.data.datasets[0].data.push(aliveCount);
        myChart.data.datasets[1].data.push(deadCount);
        myChart.update();
    }
    displayCounts(aliveCount, deadCount, points.length);  // Display the counts

    requestAnimationFrame(draw);
}

function displayCounts(alive, dead, total) {
    const div = document.getElementById('counts');
    div.innerHTML = `
        Alive: ${alive}<br>
        Dead: ${dead}<br>
        Total Created: ${totalCreatedPoints}
    `;
    const div2 = document.getElementById('pointData');
    if(pointToWatch){
        div2.innerHTML = `
        <strong>Point Data:</strong><br>
        X: ${pointToWatch.x.toFixed(2)}<br>
        Y: ${pointToWatch.y.toFixed(2)}<br>
        VX: ${pointToWatch.vx.toFixed(2)}<br>
        VY: ${pointToWatch.vy.toFixed(2)}<br>
        Energy: ${pointToWatch.energy.toFixed(2)},
        
    `;
    }
}
setInterval(() => {
    const newPoint = generateRandomPoint({ x: canvas.width / 2, y: canvas.height / 2 }, 50);
    points.push(newPoint);
    totalCreatedPoints++;
    for (let otherPoint of points) {
        if (newPoint !== otherPoint && isColliding(newPoint, otherPoint)) {
            handleCollision(newPoint, otherPoint);
        }
    }
}, 500);  // 1000 milliseconds = 1 second
draw();