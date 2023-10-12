const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let totalCreatedPoints = 0;
let indexCount=0;
const centralPoint = {
    x: canvas.width / 2,
    y: canvas.height / 2
};
canvas.style.backgroundColor = 'black';
let pointToWatch;
const watchindex = 2000;
const POINT_SIZE = 10;
const ENERGY_DECAY = 0.001;
let myChart;

canvas.addEventListener('click', selectPoint);
function selectPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let point of points) {
        if (Math.sqrt((point.x - mouseX) ** 2 + (point.y - mouseY) ** 2) <= POINT_SIZE) {
            pointToWatch = point; 
            ctx.strokeStyle = "red";
            ctx.lineWidth = 3;
            ctx.stroke(); // Set the clicked point as pointToWatch
            break;
        }
    }
}
// const ctxChart = document.getElementById('myChart').getContext('2d');
// myChart = new Chart(ctxChart, {
//     type: 'line',
//     data: {
//         labels: [],
//         datasets: [
//             {
//                 label: 'Alive',
//                 data: [],
//                 borderColor: 'rgba(0, 128, 0, 1)',
//                 fill: false
//             },
//             {
//                 label: 'Dead',
//                 data: [],
//                 borderColor: 'rgba(255, 0, 0, 1)',
//                 fill: false
//             }
//         ]
//     },
//     options: {
//         scales: {
//             x: {
//                 type: 'linear',
//                 position: 'bottom'
//             }
//         }
//     }
// });
function generateRandomPoint(center, maxDistance) {
    indexCount++;
    const angle = 0;
    const distance = maxDistance;

    return {
        x: center.x + distance * Math.cos(angle),
        y: center.y + distance * Math.sin(angle),
        //size: POINT_SIZE,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        energy: 2,  // Starts with 20% energy
        size: POINT_SIZE,
        collided: false,
        flashColor: null,
        selected: false,
        color:undefined,
        checker:false,
        intensity:0,
        abouttodie:false,
        angularVelocity: 0,
        i:indexCount
    };
}
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Deselect previously selected dot
    points.forEach(point => point.selected = false);

    // Check if any dot was clicked
    for (let point of points) {
        const dx = x - point.x;
        const dy = y - point.y;
        if (Math.sqrt(dx * dx + dy * dy) <= point.size) {
            point.selected = true;
            pointToWatch=point
            ctx.strokeStyle = "red";
            ctx.lineWidth = 3;
            ctx.stroke();
            break;
        }
    }
});
const points = [];

function isColliding(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 2 * POINT_SIZE;
}

function handleCollision(pointA, pointB) {
    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const overlap = (2 * POINT_SIZE - distance) / 2;

    // Calculate the collision angle
    const collisionAngle = Math.atan2(dy, dx);
    const relativeAngle = Math.PI/2 - collisionAngle;
    const angularEffect = Math.sin(relativeAngle);

    // Move points away from each other based on the overlap
    pointA.x -= overlap * Math.cos(collisionAngle);
    pointA.y -= overlap * Math.sin(collisionAngle);
    pointB.x += overlap * Math.cos(collisionAngle);
    pointB.y += overlap * Math.sin(collisionAngle);

    const m1 = pointA.energy, m2 = pointB.energy;
    const v1i = { x: pointA.vx, y: pointA.vy };
    const v2i = { x: pointB.vx, y: pointB.vy };

    pointA.vx = ((m1 - m2) / (m1 + m2)) * v1i.x + ((2 * m2) / (m1 + m2)) * v2i.x;
    pointA.vy = ((m1 - m2) / (m1 + m2)) * v1i.y + ((2 * m2) / (m1 + m2)) * v2i.y;

    pointB.vx = ((2 * m1) / (m1 + m2)) * v1i.x - ((m1 - m2) / (m1 + m2)) * v2i.x;
    pointB.vy = ((2 * m1) / (m1 + m2)) * v1i.y - ((m1 - m2) / (m1 + m2)) * v2i.y;

    pointA.collided = false;
    pointB.collided = false;
    const scalingFactor = 0.2;  // Adjust this value to control the overall rotational effect
pointA.angularVelocity += angularEffect * scalingFactor;
pointB.angularVelocity -= angularEffect * scalingFactor;

    if (pointA.energy <= 0.5 && pointA.energy <= 0.2 && pointB.energy > pointA.energy) {
        pointB.energy += pointB.energy * pointA.energy;
        //pointB.energy = Math.min(pointB.energy, 1);  // Ensure energy doesn't exceed 1
        pointA.energy = 0;
        // pointB.flashColor = "blue";
    } else if (pointB.energy <= 0.5 && pointB.energy <= 0.2 && pointA.energy > pointB.energy) {
        pointA.energy += pointA.energy * pointB.energy;
        //pointA.energy = Math.min(pointA.energy, 1);  // Ensure energy doesn't exceed 1
        pointB.energy = 0;
        // pointA.flashColor = "blue";
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
        //point.size = POINT_SIZE * (0.2 + 1.8 * point.energy);
        //point.size=point.size<POINT_SIZE?POINT_SIZE:point.size;
        // Update momentum potential based on energy
        point.momentumPotential = 0.5 + (point.energy * 0.1) * 0.5;

        // Check for collisions
        for (let otherPoint of points) {
            if (point !== otherPoint && isColliding(point, otherPoint)) {
                handleCollision(point, otherPoint);
            }
        }

        // Bounce off canvas edges and adjust position to ensure dot stays within canvas
        if (point.x - POINT_SIZE < 0) {
            point.vx = Math.abs(point.vx);
            point.x = POINT_SIZE;
        } else if (point.x + POINT_SIZE > canvas.width) {
            point.vx = -Math.abs(point.vx);
            point.x = canvas.width - POINT_SIZE;
        }
        if (point.y - POINT_SIZE < 0) {
            point.vy = Math.abs(point.vy);
            point.y = POINT_SIZE;
        } else if (point.y + POINT_SIZE > canvas.height) {
            point.vy = -Math.abs(point.vy);
            point.y = canvas.height - POINT_SIZE;
        }

        point.x += point.vx;
        point.y += point.vy;
        point.x += point.angularVelocity/4;
        point.y += point.angularVelocity/4;

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
    let maxEnergyPoint = points[0];
    let maxEnergyPointIndex = 0;
    for (let i = 0; i < points.length; i++) {
        if (points[i].energy > maxEnergyPoint.energy) {
            maxEnergyPoint = points[i];
            maxEnergyPointIndex = i;
        }
        let point = points[i];

        // Count alive and dead dots
        if (point.energy > 0.2) {
            
            aliveCount++;
        } else {
            point.abouttodie=true
            deadCount++;
        }

        const colorIntensity = Math.floor(255 * point.energy);
        point.intensity=colorIntensity
        ctx.beginPath();
        // let redComponent = colorIntensity/3 ;
        // if (point.energy > 0.8) {
        //     redComponent = 123;  // Shift towards red if energy is more than 80%
        // }
        if (point === pointToWatch ||point.checker) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 5;
            ctx.stroke();
              // Draw a red border for pointToWatch
        }
        if(point.checker){
            ctx.strokeStyle = "green";
            ctx.lineWidth = 5;
            ctx.stroke();
        }
        // Determine fill color
        let redComponent = colorIntensity / 3;
let greenComponent = colorIntensity * 2;
let blueComponent = colorIntensity;

// Check if energy surpasses initial level by 10%
if (point.energy > 2.20) {
    // Shift color range, for example to a more purple hue
    redComponent = colorIntensity;
    greenComponent = colorIntensity / 3;
    blueComponent = colorIntensity * 2;
}

// Determine fill color
const defaultColor = `rgb(${redComponent}, ${greenComponent}, ${blueComponent})`;
const fillColor = point.flashColor || defaultColor;
ctx.fillStyle = point.abouttodie ? "lightgrey" : fillColor;
        point.color=fillColor;
        //point.size = POINT_SIZE + POINT_SIZE * 2 * point.energy<POINT_SIZE?POINT_SIZE:POINT_SIZE + POINT_SIZE * 2 * point.energy;
        // Determine size (special dot is larger)
         point.size=point.size * 0.9+0.1*point.energy*ENERGY_DECAY<=POINT_SIZE?POINT_SIZE:point.size * 0.9+0.1*point.energy*ENERGY_DECAY>POINT_SIZE*4?POINT_SIZE*4:point.size * 0.9+0.1*point.energy*ENERGY_DECAY;
        const size =  point.size;
        point.checker=0.1*point.energy*ENERGY_DECAY
        ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);
        ctx.fill();

        // Reset flash color after drawing
        point.flashColor = null;
    }

    if (!pointToWatch && points.length > 2000) {
        pointToWatch = points[2000]
        // updatePointDataDisplay(points[2000]);
    }
    // if (myChart) {
    //     myChart.data.labels.push(totalCreatedPoints);
    //     myChart.data.datasets[0].data.push(aliveCount);
    //     myChart.data.datasets[1].data.push(deadCount);
    //     myChart.update();
    // }
    if (maxEnergyPoint) displayMaxEnergyPointDetails(ctx,maxEnergyPoint, maxEnergyPointIndex);
    displayCounts(aliveCount, deadCount, points.length);  // Display the counts
    if(pointToWatch){
        ctx.beginPath();
        ctx.fillStyle ="red"
        ctx.arc(pointToWatch.x, pointToWatch.y, POINT_SIZE/2, 0, 2 * Math.PI);
        ctx.fill();
    }
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
    if (pointToWatch) {
        div2.innerHTML = `
            <strong>Point Characteristics:</strong><br>
            Index: ${pointToWatch.index}<br>
            I: ${pointToWatch.i}<br>
            X: ${pointToWatch.x.toFixed(2)}<br>
            Y: ${pointToWatch.y.toFixed(2)}<br>
            VX: ${pointToWatch.vx.toFixed(2)}<br>
            VY: ${pointToWatch.vy.toFixed(2)}<br>
            Energy: ${pointToWatch.energy.toFixed(2)}<br>
            Size: ${pointToWatch.size.toFixed(2)}<br>
            Collided: ${pointToWatch.collided}<br>
            
            Momentum Potential: ${pointToWatch.momentumPotential.toFixed(2)}
            Color:<div style="background-color:${pointToWatch.color};width:50px;height:50px"></div>
            size checker: ${Math.floor(pointToWatch.checker.toFixed(2))}
            `;
            
    }
}
function roundToDecimalPlaces(value, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(value * factor) / factor;
}
function displayMaxEnergyPointDetails(ctx,point, index) {
    const div = document.getElementById('maxEnergyPointDetails');
    div.innerHTML = `
        <strong>Point with Most Energy:</strong><br>
        Index: ${index}<br>
        I: ${point.i}<br>
        X: ${point.x.toFixed(2)}<br>
        Y: ${point.y.toFixed(2)}<br>
        Energy: ${point.energy.toFixed(2)}<br>
            Size: ${point.size.toFixed(2)}<br>
            Collided: ${point.collided}<br>
             
            Momentum Potential: ${point.momentumPotential.toFixed(2)}
            Color:<div style="background-color:${point.color};width:50px;height:50px"></div>
            size checker: ${point.checker.toFixed(2)}
    `;
    
        ctx.beginPath();
        ctx.fillStyle ="green"
        ctx.arc(point.x, point.y, POINT_SIZE/3, 0, 2 * Math.PI);
        ctx.fill();
    

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
}, 1);  // 1000 milliseconds = 1 second
draw();