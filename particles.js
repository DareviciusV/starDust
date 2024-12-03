const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle settings
const minParticleSize = 1;
const maxParticleSize = 50;
const growthRate = 0.1;
const particles = [];
const numParticles = 500;

// Zoom and offset values
let zoomFactor = 1.0;
let offsetX = 0;
let offsetY = 0;
let zoomedIn = false;

// Background image setup
const backgroundImage = new Image();
backgroundImage.src = 'assets/images/nasa.png'; // Ensure the path is correct

backgroundImage.onload = () => {
    console.log("Background image loaded");
    updateParticles(); // Start animation loop
};

backgroundImage.onerror = () => {
    console.error("Error loading background image");
};

// Explosion sound setup
const explosionSound = document.getElementById("explosionSound");

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
        this.lifetime = (Date.now() - this.creationTime) / 1000; // Lifetime in seconds
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

function updateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

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
