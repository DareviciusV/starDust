const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const minParticleSize = 1;
const maxParticleSize = 50;
const growthRate = 0.1;
const particles = [];
const numParticles = 500;

let zoomFactor = 1.0;
let offsetX = 0;
let offsetY = 0;
let zoomedIn = false;

const backgroundImage = new Image();
backgroundImage.src = 'assets/images/nasa.png';

backgroundImage.onload = () => {
    console.log("Background image loaded");
    updateParticles();
};

backgroundImage.onerror = () => {
    console.error("Error loading background image");
};

const explosionSound = document.getElementById("explosionSound");
const backgroundSound = document.getElementById("backgroundSound");
const soundToggleButton = document.getElementById("soundToggleButton");
backgroundSound.muted = true;

soundToggleButton.addEventListener("click", () => {
    if (backgroundSound.muted) {
        backgroundSound.muted = false;
        soundToggleButton.textContent = "Mute Sound";
    } else {
        backgroundSound.muted = true;
        soundToggleButton.textContent = "Unmute Sound";
    }
});


const ufoImage = new Image();
ufoImage.src = 'assets/images/ufo.png';


ufoImage.onload = () => {
    console.log('UFO image loaded');
};


class UFO {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 50;
        this.maxSpeed = 4;
        this.speed = Math.random() * 2 + 1;
        this.velocityX = (Math.random() - 0.5) * this.speed;
        this.velocityY = (Math.random() - 0.5) * this.speed;
        this.acceleration = 0.05;
        this.rotationAngle = Math.random() * 2 * Math.PI;
        this.rotationSpeed = 0.01;
    }

    move() {

        this.velocityX += Math.cos(this.rotationAngle) * this.acceleration;
        this.velocityY += Math.sin(this.rotationAngle) * this.acceleration;

        const speedMagnitude = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        if (speedMagnitude > this.maxSpeed) {
            this.velocityX = (this.velocityX / speedMagnitude) * this.maxSpeed;
            this.velocityY = (this.velocityY / speedMagnitude) * this.maxSpeed;
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        if (Math.random() < 0.02) {
            this.rotationAngle += (Math.random() - 0.5) * Math.PI;
        }


        if (this.x < 0) {
            this.x = canvas.width;
        } else if (this.x > canvas.width) {
            this.x = 0;
        }

        if (this.y < 0) {
            this.y = canvas.height;
        } else if (this.y > canvas.height) {
            this.y = 0;
        }
    }

    draw() {

        ctx.drawImage(ufoImage, this.x, this.y, this.size, this.size);
    }
}


// Create UFO instance
const ufo = new UFO();

// Particle class definition
class Particle {
    constructor(x, y, radius, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.creationTime = Date.now();
        this.lifetime = 0;
        this.growthAmount = 0;
    }

    move() {
        this.x += this.velocityX;
        this.y += this.velocityY;

        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.velocityX = -this.velocityX;
        }
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.velocityY = -this.velocityY;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(
            (this.x - offsetX) * zoomFactor,
            (this.y - offsetY) * zoomFactor,
            this.radius * zoomFactor,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        ctx.fill();
        ctx.closePath();
    }

    checkCollision(other) {
        const distance = Math.hypot(this.x - other.x, this.y - other.y);
        if (distance < this.radius + other.radius) {
            if (this.radius > other.radius) {
                this.radius += other.radius * growthRate;
                this.growthAmount += other.radius * growthRate;
                return true;
            }
        }
        return false;
    }

    updateLifetime() {
        this.lifetime = (Date.now() - this.creationTime) / 1000;
    }

    checkExplosion() {
        if (this.radius >= 10) {
            this.explode();
            return true;
        }
        return false;
    }

    explode() {
        explosionSound.play();
    }
}

function generateParticles(count) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * (2 - minParticleSize) + minParticleSize;
        const velocityX = (Math.random() - 0.5) * 2;
        const velocityY = (Math.random() - 0.5) * 2;
        particles.push(new Particle(x, y, radius, velocityX, velocityY));
    }
}

canvas.addEventListener("click", (e) => {
    if (!zoomedIn) {
        zoomFactor = 2.0;
        zoomedIn = true;
        offsetX = e.clientX / zoomFactor;
        offsetY = e.clientY / zoomFactor;
    } else {
        zoomFactor = 1.0;
        zoomedIn = false;
        offsetX = 0;
        offsetY = 0;
    }
});

// Resize the canvas when the window size changes
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
});

function updateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Move and draw the UFO
    ufo.move();
    ufo.draw();

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.move();
        particle.updateLifetime();

        for (let j = particles.length - 1; j >= 0; j--) {
            if (i !== j && particle.checkCollision(particles[j])) {
                particles.splice(j, 1);
            }
        }

        if (particle.checkExplosion()) {
            particles.splice(i, 1);
        } else {
            particle.draw();
        }
    }

    if (Math.random() < 0.1) {
        generateParticles(1);
    }

    const topParticles = particles
        .slice()
        .sort((a, b) => b.growthAmount - a.growthAmount)
        .slice(0, 5);

    const topParticlesList = document.getElementById("topParticlesList");
    topParticlesList.innerHTML = "";
    topParticles.forEach((particle, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `#${index + 1}: X: ${Math.round(particle.x)}, Y: ${Math.round(particle.y)}, Growth: ${particle.growthAmount.toFixed(2)}`;
        topParticlesList.appendChild(listItem);
    });

    topParticles.forEach((particle) => {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            (particle.x - offsetX) * zoomFactor,
            (particle.y - offsetY) * zoomFactor,
            particle.radius * zoomFactor,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    });

    requestAnimationFrame(updateParticles);
}

generateParticles(numParticles);
