import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";

// Game state
let score = 0;
let velocity = { x: 0, z: 0.1 };
let rotation = { x: 0, y: 0 };
let mouse = { x: 0, y: 0, isDown: false };
let objectRotation = { x: 0, y: 0 };
let isCamera1 = true;
let isTransitioning = false;

const scene = new THREE.Scene();
const clock = new THREE.Clock();


// Create Game Over overlay
const gameOverDiv = document.createElement("div");
gameOverDiv.style.position = "fixed";
gameOverDiv.style.top = "0";
gameOverDiv.style.left = "0";
gameOverDiv.style.width = "100%";
gameOverDiv.style.height = "100%";
gameOverDiv.style.backgroundColor = "black";
gameOverDiv.style.display = "flex";
gameOverDiv.style.flexDirection = "column";
gameOverDiv.style.justifyContent = "center";
gameOverDiv.style.alignItems = "center";
gameOverDiv.style.opacity = "0"; // Start invisible
gameOverDiv.style.transition = "opacity 1s ease-in-out";
gameOverDiv.style.pointerEvents = "none"; // Disable interactions initially
document.body.appendChild(gameOverDiv);

const gameOverText = document.createElement("div");
gameOverText.textContent = "Game Over";
gameOverText.style.color = "white";
gameOverText.style.fontSize = "48px";
gameOverText.style.marginBottom = "20px";
gameOverText.style.opacity = "0"; // Fade-in effect
gameOverText.style.transition = "opacity 1s ease-in-out";
gameOverDiv.appendChild(gameOverText);

const restartText = document.createElement("div");
restartText.textContent = "Press Space to Restart";
restartText.style.color = "white";
restartText.style.fontSize = "24px";
restartText.style.opacity = "0"; // Fade-in effect
restartText.style.transition = "opacity 1s ease-in-out";
gameOverDiv.appendChild(restartText);


// Camera setup
const camera1 = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const camera2 = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
let activeCamera = camera1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Plane setup
const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  wireframe: false,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Aim circle setup
const aimGroup = new THREE.Group();
const smallCircleGeometry = new THREE.RingGeometry(0.2, 0.3, 32);
const largeCircleGeometry = new THREE.RingGeometry(0.4, 0.5, 32);
const circleMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});
const smallCircle = new THREE.Mesh(smallCircleGeometry, circleMaterial);
const largeCircle = new THREE.Mesh(largeCircleGeometry, circleMaterial);
smallCircle.position.z = -3;
largeCircle.position.z = -4;
aimGroup.add(smallCircle);
aimGroup.add(largeCircle);
scene.add(aimGroup);

// Bullet system
const bulletGeometry = new THREE.SphereGeometry(0.1);
const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const bullets = [];
let canShoot = true;
const shootCooldown = 500;

// Particle system
const particleCount = 30;
const particleGeometry = new THREE.BufferGeometry();
const particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.05,
  transparent: true,
  blending: THREE.AdditiveBlending,
});

const particleSystems = [];
for (let i = 0; i < 10; i++) {
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  for (let j = 0; j < particleCount; j++) {
    velocities.push({
      x: (Math.random() - 0.5) * 0.3,
      y: (Math.random() - 0.5) * 0.3,
      z: (Math.random() - 0.5) * 0.3,
    });
  }
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  const particleSystem = {
    points: new THREE.Points(
      particleGeometry.clone(),
      particleMaterial.clone()
    ),
    velocities: velocities,
    active: false,
    life: 0,
  };
  particleSystems.push(particleSystem);
  scene.add(particleSystem.points);
}

// Load 3D object
const loader = new GLTFLoader();
let object3D;
loader.load("PesawatBabe.glb", (gltf) => {
  object3D = gltf.scene;
  object3D.scale.set(1, 1, 1);
  scene.add(object3D);
});

const targetCubes = [];
function createTargetCubes() {
  const directions = ["center", "left", "right"];
  for (let i = 0; i < 5; i++) {
    const cube = createSingleCube(directions[i]);
    targetCubes.push(cube);
    scene.add(cube);
  }
}

function showGameOver() {
  gameOverDiv.style.opacity = "1";
  gameOverDiv.style.pointerEvents = "auto"; // Enable interactions
  setTimeout(() => {
    gameOverText.style.opacity = "1"; // Fade in Game Over text
    restartText.style.opacity = "1"; // Fade in Restart text
  }, 1000); // Delay to sync with background fade-in

  // Freeze game by stopping updates
  cancelAnimationFrame(animationId); // Stop the animation loop
}


document.addEventListener("keydown", (event) => {
  if (event.key === " " && gameOverDiv.style.opacity === "1") {
    restartGame();
  }
});

function restartGame() {
  // Reset game state
  score = 0;
  scoreDiv.textContent = `Score: ${score}`;
  targetCubes.forEach((cube) => scene.remove(cube));
  targetCubes.length = 0;
  createTargetCubes(); // Reinitialize cubes
  bullets.forEach((bullet) => scene.remove(bullet));
  bullets.length = 0;

  object3D.position.set(0, 0, 0); // Reset object position
  velocity = { x: 0, z: 0.1 };
  rotation = { x: 0, y: 0 };
  objectRotation = { x: 0, y: 0 };

  // Hide Game Over screen
  gameOverDiv.style.opacity = "0";
  gameOverDiv.style.pointerEvents = "none";
  gameOverText.style.opacity = "0";
  restartText.style.opacity = "0";

  // Restart animation loop
  animate();
}


// Create a single cube
function createSingleCube(direction) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  const distance = 20; // Jarak spawn dari kamera
  const angle = Math.random() * Math.PI * 2; // Acak arah spawn
  cube.position.x = Math.sin(angle) * distance + activeCamera.position.x;
  cube.position.z = Math.cos(angle) * distance + activeCamera.position.z;
  cube.position.y = 1 + Math.random() * 1; // Variasi ketinggian

  // Kecepatan mendekat ke pemain
  cube.velocity = new THREE.Vector3(0, 0, 0); // Akan dihitung setiap frame

  return cube;
}

createTargetCubes();

const hitSound = new Audio("hit.mp3"); // Pastikan jalurnya benar
const gameOverSound = () => {
  const gameOver = new Audio('gameover.mp3');
  gameOver.currentTime = 0;
  gameOver.play();
}

function playHitSound() {
  // Pastikan suara diputar ulang setiap kali dipanggil
  hitSound.currentTime = 0; // Reset ke awal
  hitSound.play();
}

function playPunchSound() {
  let punchSound = new Audio("punch.mp3"); // Pastikan jalurnya benar
  punchSound.currentTime = 0;
  punchSound.play();
}

function updateCubes() {
  if (!object3D) return;

  targetCubes.forEach((cube, index) => {
    // Hitung arah menuju pemain
    const direction = new THREE.Vector3();
    direction.subVectors(object3D.position, cube.position).normalize();

    // Perbarui posisi kubus berdasarkan arah
    const speed = 0.05; // Kecepatan tetap
    cube.velocity = direction.multiplyScalar(speed);
    cube.position.add(cube.velocity);

    // Periksa tabrakan dengan peluru
    bullets.forEach((bullet, bulletIndex) => {
      if (bullet.position.distanceTo(cube.position) < 1) {
        createBulletImpact(cube.position);
        scene.remove(cube);
        scene.remove(bullet);
        targetCubes.splice(index, 1);
        bullets.splice(bulletIndex, 1);

        // Spawn kubus baru setelah dihancurkan
        const newCube = createSingleCube();
        targetCubes.push(newCube);
        scene.add(newCube);

        score += 10;
        scoreDiv.textContent = `Score: ${score}`;
      }
    });

    // Periksa tabrakan dengan pemain
    if (cube.position.distanceTo(object3D.position) < 1) {
      score = 0;
      gameOverSound();
      showGameOver();
      return;
      // scoreDiv.textContent = `Score: ${score}`;
      // scene.remove(cube);
      // targetCubes.splice(index, 1);

      // // Spawn kubus baru
      // const newCube = createSingleCube();
      // targetCubes.push(newCube);
      // scene.add(newCube);
    }

    // Jika kubus terlalu jauh, reset ke posisi awal
    const maxDistance = 50;
    if (cube.position.distanceTo(object3D.position) > maxDistance) {
      scene.remove(cube);
      targetCubes.splice(index, 1);

      // Buat kubus baru
      const newCube = createSingleCube();
      targetCubes.push(newCube);
      scene.add(newCube);
    }
  });
}

// UI setup
const scoreDiv = document.createElement("div");
scoreDiv.style.position = "absolute";
scoreDiv.style.top = "10px";
scoreDiv.style.left = "50%";
scoreDiv.style.transform = "translateX(-50%)";
scoreDiv.style.color = "white";
scoreDiv.style.fontSize = "24px";
scoreDiv.style.fontFamily = "Arial, sans-serif";
scoreDiv.textContent = "Score: 0";
document.body.appendChild(scoreDiv);

function createFloatingText(text, position) {
  const floatingText = document.createElement("div");
  floatingText.textContent = text;
  floatingText.style.position = "absolute";
  floatingText.style.color = "yellow";
  floatingText.style.fontSize = "20px";
  floatingText.style.fontWeight = "bold";
  floatingText.style.pointerEvents = "none";
  floatingText.style.transition = "transform 1s ease-out, opacity 1s ease-out";
  floatingText.style.opacity = "1";
  document.body.appendChild(floatingText);

  // Hitung posisi layar dari posisi 3D
  const vector = new THREE.Vector3(position.x, position.y, position.z);
  vector.project(activeCamera);

  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

  floatingText.style.left = `${x}px`;
  floatingText.style.top = `${y}px`;

  // Animasikan melayang ke atas
  setTimeout(() => {
    floatingText.style.transform = "translateY(-50px)";
    floatingText.style.opacity = "0";
  }, 0);

  // Hapus elemen setelah animasi selesai
  setTimeout(() => {
    document.body.removeChild(floatingText);
  }, 1000);
}

// Helper functions
function createBulletImpact(position) {
  const particleSystem = particleSystems.find((ps) => !ps.active);
  if (!particleSystem) return;

  particleSystem.active = true;
  particleSystem.life = 1.0;
  particleSystem.points.position.copy(position);
  particleSystem.points.visible = true;

  const positions = particleSystem.points.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
  }
  particleSystem.points.geometry.attributes.position.needsUpdate = true;
}

function shootBullet() {
  if (!canShoot || !object3D) return;

  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  playPunchSound();
  // If in third-person view, shoot from the front of the plane
  if (!isCamera1) {
    const frontOffset = new THREE.Vector3(0, 0, 1);
    frontOffset.applyQuaternion(object3D.quaternion);
    bullet.position.copy(object3D.position).add(frontOffset);

    // Calculate direction based on aim circle
    const direction = new THREE.Vector3();
    direction.subVectors(aimGroup.position, bullet.position).normalize();
    bullet.velocity = direction.multiplyScalar(0.5);
  } else {
    // First-person view shooting
    const direction = new THREE.Vector3();
    activeCamera.getWorldDirection(direction);

    // Spawn bullet from camera position
    bullet.position.copy(activeCamera.position);
    bullet.velocity = direction.multiplyScalar(0.5); // Bullet speed
  }

  bullet.distanceTraveled = 0;
  bullets.push(bullet);
  scene.add(bullet);
  canShoot = false;
  setTimeout(() => {
    canShoot = true;
  }, shootCooldown);
}

function checkBulletCollision(bullet) {
  targetCubes.forEach((cube, index) => {
    if (bullet.position.distanceTo(cube.position) < 1) {
      createBulletImpact(cube.position);
      playHitSound();
      scene.remove(cube);
      targetCubes.splice(index, 1);

      createFloatingText("+10", cube.position);

      score += 10;
      scoreDiv.textContent = `Score: ${score}`;

      // Tambahkan kubus baru segera setelah satu hilang
      if (targetCubes.length < 3) {
        const newCube = createSingleCube();
        scene.add(newCube);
        targetCubes.push(newCube);
      }
    }
  });
}

function toggleCamera() {
  if (isTransitioning || !object3D) return;

  isTransitioning = true;
  const startPosition = activeCamera.position.clone();
  const startRotation = activeCamera.rotation.clone();
  isCamera1 = !isCamera1;

  const endPosition = isCamera1
    ? new THREE.Vector3(
        object3D.position.x - Math.sin(rotation.y) * 5,
        5, // Move camera up in first-person view
        object3D.position.z - Math.cos(rotation.y) * 5
      )
    : new THREE.Vector3(
        object3D.position.x,
        object3D.position.y + 2, // Increase y for higher third-person view
        object3D.position.z + 3
      );
  const endRotation = isCamera1
    ? new THREE.Euler()
    : new THREE.Euler(rotation.x, rotation.y, 0);

  let elapsedTime = 0;

  function transition() {
    elapsedTime += clock.getDelta();
    const progress = Math.min(elapsedTime / 1, 1);

    activeCamera.position.lerpVectors(startPosition, endPosition, progress);
    activeCamera.rotation.set(
      THREE.MathUtils.lerp(startRotation.x, endRotation.x, progress),
      THREE.MathUtils.lerp(startRotation.y, endRotation.y, progress),
      THREE.MathUtils.lerp(startRotation.z, endRotation.z, progress)
    );

    if (progress < 1) {
      requestAnimationFrame(transition);
    } else {
      isTransitioning = false;
    }
  }

  transition();
}

// Event listeners
document.addEventListener("mousedown", () => (mouse.isDown = true));
document.addEventListener("mouseup", () => (mouse.isDown = false));
document.addEventListener("keydown", (event) => {
  if (event.key === " ") shootBullet(); // Change shooting to spacebar
  if (event.key === "v" && !isTransitioning) toggleCamera();
});

document.addEventListener("mousemove", (event) => {
  if (mouse.isDown) {
    rotation.y -= event.movementX * 0.005;
    rotation.x -= event.movementY * 0.005;
    rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x));

    if (object3D) {
      objectRotation.y -= event.movementX * 0.005;
      objectRotation.x -= event.movementY * 0.005;
      objectRotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, objectRotation.x)
      );
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "w" || event.key === "ArrowUp") velocity.z = -0.1;
  if (event.key === "s" || event.key === "ArrowDown") velocity.z = 0.1;
  if (event.key === "a" || event.key === "ArrowLeft") velocity.x = -0.1;
  if (event.key === "d" || event.key === "ArrowRight") velocity.x = 0.1;
});

document.addEventListener("keyup", (event) => {
  if (["w", "s", "ArrowUp", "ArrowDown"].includes(event.key)) velocity.z = 0;
  if (["a", "d", "ArrowLeft", "ArrowRight"].includes(event.key)) velocity.x = 0;
});

let animationId;


// Animation loop
function animate() {
  animationId = requestAnimationFrame(animate);

  if (object3D) {
    updateCubes();

    // Update object position and camera
    // Update object position and camera
    if (isCamera1) {
      object3D.position.x += velocity.x;
      object3D.position.z += velocity.z;
      object3D.rotation.y = objectRotation.y;
      object3D.rotation.x = objectRotation.x;

      activeCamera.position.set(
        object3D.position.x - Math.sin(rotation.y) * 5,
        5, // Increase the y value to move the camera up
        object3D.position.z - Math.cos(rotation.y) * 5
      );
    } else {
      const cameraOffset = new THREE.Vector3(0, 2, 3); // Move the camera higher in the third-person view
      activeCamera.position.copy(object3D.position).add(cameraOffset);
      object3D.rotation.y = rotation.y;
      object3D.rotation.x = rotation.x;
    }

    const lookAtPoint = new THREE.Vector3(
      activeCamera.position.x + Math.sin(rotation.y),
      activeCamera.position.y + Math.sin(rotation.x),
      activeCamera.position.z + Math.cos(rotation.y)
    );
    activeCamera.lookAt(lookAtPoint);

    // Update aim circle
    const aimDistance = 5;
    aimGroup.position.copy(activeCamera.position);
    aimGroup.position.add(
      new THREE.Vector3(
        Math.sin(rotation.y) * aimDistance,
        Math.sin(rotation.x) * aimDistance,
        Math.cos(rotation.y) * aimDistance
      )
    );
    aimGroup.lookAt(lookAtPoint);

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.position.add(bullet.velocity);
      bullet.distanceTraveled += bullet.velocity.length();

      checkBulletCollision(bullet); // Check for collisions with target cubes

      if (bullet.distanceTraveled > 50) {
        createBulletImpact(bullet.position);
        scene.remove(bullet);
        bullets.splice(i, 1);
      }
    }

    // Update particle systems
    particleSystems.forEach((ps) => {
      if (!ps.active) return;

      ps.life -= clock.getDelta();
      if (ps.life <= 0) {
        ps.active = false;
        ps.points.visible = false;
      } else {
        const positions = ps.points.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += ps.velocities[i].x;
          positions[i * 3 + 1] += ps.velocities[i].y;
          positions[i * 3 + 2] += ps.velocities[i].z;
        }
        ps.points.geometry.attributes.position.needsUpdate = true;
        ps.points.material.opacity = ps.life;
      }
    });

    // Update score
    scoreDiv.textContent = `Score: ${score}`;
  }

  renderer.render(scene, activeCamera);
}

animate();

// Resize handler
window.addEventListener("resize", () => {
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera2.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();
  camera2.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
