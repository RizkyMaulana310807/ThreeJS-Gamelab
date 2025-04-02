import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { EffectComposer } from "EffectComposer";
import { RenderPass } from "RenderPass";
import { UnrealBloomPass } from "UnrealBloomPass";


const bgm = new Audio("playsound.mp3").play();


// Game state
const gameState = {
  score: 0,
  isGameOver: false,
  isLoading: true,
  isPlaying: false,
  loadedModels: {
    player: false,
    ufo: false,
  },
};
let cameraHeight = 10; // Ketinggian awal kamera
const cameraSpeed = 0.5; // Kecepatan naik/turun

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    cameraHeight += cameraSpeed; // Naikkan kamera
  } else if (event.key === "ArrowDown") {
    cameraHeight -= cameraSpeed; // Turunkan kamera
  }
});
// Tambahkan di bagian control sebelumnya
document.addEventListener("keydown", (event) => {
  if (gameState.isGameOver) return;

  // Gerak kiri-kanan
  if (event.key === "ArrowLeft") {
    controls.velocity.x = -0.5; // Bergerak ke kiri
  } else if (event.key === "ArrowRight") {
    controls.velocity.x = 0.5; // Bergerak ke kanan
  }
});

// Tambahkan event listener untuk menghentikan gerakan saat tombol dilepas
document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    controls.velocity.x = 0; // Hentikan gerakan horizontal
  }
});

// Setup scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Aktifkan shadow map
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Jenis shadow map (opsional, untuk bayangan lebih lembut)
document.body.appendChild(renderer.domElement);

// Tambahkan pada bagian atas file, setelah inisialisasi THREE
const explosionParticles = [];
const explosionGeometry = new THREE.BufferGeometry();
const explosionMaterial = new THREE.PointsMaterial({
  color: 0xff6600, // Warna oranye kemerahan
  size: 0.3,
  transparent: true,
  blending: THREE.AdditiveBlending,
  opacity: 1,
});

function createExplosion(position) {
  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Posisi awal partikel di sekitar posisi ledakan
    positions[i3] = position.x + (Math.random() - 0.5) * 2;
    positions[i3 + 1] = position.y + (Math.random() - 0.5) * 2;
    positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;

    // Kecepatan partikel acak
    velocities[i3] = (Math.random() - 0.5) * 0.5;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.5;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = explosionMaterial.clone();
  material.opacity = 1;

  const explosion = new THREE.Points(geometry, material);
  explosion.velocities = velocities;
  explosion.createdAt = Date.now();

  explosionParticles.push(explosion);
  scene.add(explosion);
}

// 1. Tambahkan directional light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
light.castShadow = true; // Aktifkan pemancaran bayangan
light.shadow.mapSize.width = 1024; // default
light.shadow.mapSize.height = 1024; // default
light.shadow.camera.near = 1; // default
light.shadow.camera.far = 50; // default
scene.add(light);

// const helper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(helper);

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
composer.addPass(bloomPass);

// Controls
const controls = {
  velocity: { x: 0, z: 0 },
  rotation: { x: 0, y: 0 },
  mouse: { x: 0, y: 0, isDown: false },
};

function checkAllModelsLoaded() {
  return gameState.loadedModels.player && gameState.loadedModels.ufo;
}

function updateLoadingScreen() {
  if (checkAllModelsLoaded()) {
    gameState.isLoading = false;
    loadingScreen.style.display = "none";
    // Start spawning UFOs immediately after models are loaded
    // Jalankan loop untuk spawn UFO setiap 3 detik
    setInterval(() => {
      if (!gameState.isGameOver) {
        spawnUfo();
      }
    }, 500);
  }
}

// Create loading screen
const loadingScreen = document.createElement("div");
loadingScreen.style.position = "absolute";
loadingScreen.style.width = "100%";
loadingScreen.style.height = "100%";
loadingScreen.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
loadingScreen.style.color = "white";
loadingScreen.style.display = "flex";
loadingScreen.style.justifyContent = "center";
loadingScreen.style.alignItems = "center";
loadingScreen.style.fontSize = "2em";
loadingScreen.innerHTML = "Loading Models...";
document.body.appendChild(loadingScreen);

// Create score display
const scoreDisplay = document.createElement("div");
scoreDisplay.style.position = "absolute";
scoreDisplay.style.top = "20px";
scoreDisplay.style.left = "20px";
scoreDisplay.style.color = "white";
scoreDisplay.style.fontSize = "24px";
document.body.appendChild(scoreDisplay);

// Create game over screen
const gameOverScreen = document.createElement("div");
gameOverScreen.style.position = "absolute";
gameOverScreen.style.width = "100%";
gameOverScreen.style.height = "100%";
gameOverScreen.style.backgroundColor = "rgba(0, 0, 0, 1)";
gameOverScreen.style.flexDirection = "column";
gameOverScreen.style.color = "white";
gameOverScreen.style.display = "flex";
gameOverScreen.style.justifyContent = "center";
gameOverScreen.style.alignItems = "center";
gameOverScreen.style.fontSize = "3em";
gameOverScreen.innerHTML = `<div style="color: white;">GAME OVER</div><div style="font-size: 0.5em; margin-top: 20px;">Press SPACE to Restart</div>`;
document.body.appendChild(gameOverScreen);

// Setup plane
const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x010101 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

let playerLight = new THREE.PointLight(0xffffff, 2, 20);
scene.add(playerLight);

// Create star particles
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starPositions = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  starPositions[i3] = (Math.random() - 0.5) * 2000;
  starPositions[i3 + 1] = Math.random() * 1000;
  starPositions[i3 + 2] = (Math.random() - 0.5) * 2000;
  starSizes[i] = Math.random();
}

starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3)
);
starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 2,
  transparent: true,
  blending: THREE.AdditiveBlending,
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Projectile management
const bullets = [];
const bulletGeometry = new THREE.SphereGeometry(0.2);
const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

function shoot() {
  if (!playerModel || gameState.isGameOver) return;
  const sfx = new Audio("laser.mp3").play();
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bullet.position.copy(playerModel.position);
  bullet.boundingBox = new THREE.Box3().setFromObject(bullet);

  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(playerModel.quaternion);
  bullet.velocity = direction.multiplyScalar(-1);

  bullets.push(bullet);
  scene.add(bullet);
}

// Player model
let playerModel;
const loader = new GLTFLoader();
loader.load(
  "PesawatBabe.glb",
  (gltf) => {
    playerModel = gltf.scene;
    playerModel.scale.set(1, 1, 1);
    playerModel.rotation.y = Math.PI;
    playerModel.castShadow = true; // Aktifkan bayangan
    scene.add(playerModel);

    gameState.loadedModels.player = true;
    updateLoadingScreen();
  },
  undefined,
  (error) => {
    console.error("Error loading player model:", error);
  }
);

function resetGame() {
  gameState.score = 0;
  gameState.isGameOver = false;
  gameOverScreen.style.display = "none";

  // Hapus semua UFO
  for (let i = ufos.length - 1; i >= 0; i--) {
    scene.remove(ufos[i]);
  }
  ufos.length = 0;

  // Hapus semua peluru
  for (let i = bullets.length - 1; i >= 0; i--) {
    scene.remove(bullets[i]);
  }
  bullets.length = 0;

  // Reset posisi player
  if (playerModel) {
    playerModel.position.set(0, 0, 0);
    controls.rotation.y = 0;
    playerModel.rotation.y = Math.PI;
  }

  // Spawn UFO lagi setelah restart
  setTimeout(() => spawnUfo(), 1000);
}

document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    if (gameState.isGameOver) {
      resetGame();
    } else {
      shoot();
    }
  }
});

// UFO management
const ufos = [];
const maxUfos = 6;
let ufoPrototype = null;

function createUfoPrototype() {
  return new Promise((resolve) => {
    loader.load(
      "ufo.glb",
      (gltf) => {
        ufoPrototype = gltf.scene;
        ufoPrototype.visible = false;
        ufoPrototype.castShadow = true;

        // Create a larger bounding box by expanding it by 4 units (previously was 2)
        ufoPrototype.boundingBox = new THREE.Box3().setFromObject(ufoPrototype);
        ufoPrototype.boundingBox.expandByScalar(4);
        // Contoh untuk UFO
        scene.add(ufoPrototype);

        gameState.loadedModels.ufo = true;
        updateLoadingScreen();
        resolve();
      },
      undefined,
      (error) => {
        console.error("Error loading UFO model:", error);
      }
    );
  });
}

function checkCollisions() {
  // Bullet-UFO collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    for (let j = ufos.length - 1; j >= 0; j--) {
      const ufo = ufos[j];
      // Increased collision distance from 1 to 2 for easier hits
      if (bullet.position.distanceTo(ufo.position) < 2) {
        const sfx = new Audio("explosion.mp3").play();

        // Tambahkan efek ledakan
        createExplosion(ufo.position);

        scene.remove(bullet);
        bullets.splice(i, 1);
        scene.remove(ufo);
        ufos.splice(j, 1);

        gameState.score += 10;
        break;
      }
    }
  }

  // Player-UFO collisions
  for (let i = ufos.length - 1; i >= 0; i--) {
    const ufo = ufos[i];
    // Keeping player collision distance at 2 for fair gameplay
    if (playerModel.position.distanceTo(ufo.position) < 2) {
      gameState.isGameOver = true;
      window.location.href = `gameover.html?score=${gameState.score}`;
    }
  }
}

// function cloneUfo() {
//   if (!ufoPrototype) return null;

//   const ufoClone = ufoPrototype.clone();
//   ufoClone.visible = true;
//   ufoClone.boundingBox = new THREE.Box3().setFromObject(ufoClone); // ✅ Initialize bounding box
//   return ufoClone;
// }

function spawnUfo() {
  if (!ufoPrototype || ufos.length >= maxUfos || gameState.isGameOver) return;

  const ufo = ufoPrototype.clone();
  ufo.visible = true;
  ufo.boundingBox = new THREE.Box3().setFromObject(ufo);

  // Area spawn lebih lebar saat skor > 1000
  const spawnRange = gameState.score > 500 ? 50 : 30;

  ufo.position.set(
    playerModel.position.x + (Math.random() - 0.5) * spawnRange,
    1,
    playerModel.position.z - 50
  );
  ufo.rotation.set(5, 0, 0);

  // UFO mengejar pemain jika skor > 1000
  ufo.updateVelocity = function () {
    if (gameState.score > 1000) {
      let direction = new THREE.Vector3().subVectors(
        playerModel.position,
        ufo.position
      );
      direction.normalize();
      ufo.velocity = direction.multiplyScalar(0.5);
    } else {
      ufo.velocity = new THREE.Vector3(0, 0, 0.3);
    }
  };

  ufo.updateVelocity();
  ufos.push(ufo);
  scene.add(ufo);
}

// Event listeners
document.addEventListener("mousedown", () => (controls.mouse.isDown = true));
document.addEventListener("mouseup", () => (controls.mouse.isDown = false));
document.addEventListener("mousemove", (event) => {
  if (controls.mouse.isDown && playerModel && !gameState.isGameOver) {
    controls.rotation.y -= event.movementX * 0.01;
    playerModel.rotation.y = controls.rotation.y + Math.PI;
  }
});

document.addEventListener("keydown", (event) => {
  if (gameState.isGameOver) return;

  if (event.key === " ") shoot();
});

// Camera setup
camera.position.set(0, 0, 0);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (gameState.isLoading) return;

  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    const explosion = explosionParticles[i];
    const positions = explosion.geometry.attributes.position.array;
    const velocities = explosion.velocities;

    // Pergerakan partikel
    for (let j = 0; j < positions.length; j++) {
      positions[j] += velocities[j];
    }
    explosion.geometry.attributes.position.needsUpdate = true;

    // Fade out effect
    const age = Date.now() - explosion.createdAt;
    explosion.material.opacity = Math.max(0, 1 - age / 500);

    // Hapus partikel setelah beberapa saat
    if (age > 500) {
      scene.remove(explosion);
      explosionParticles.splice(i, 1);
    }
  }

  scoreDisplay.textContent = `Score: ${gameState.score}`;

  // Pastikan kamera tetap pada ketinggian yang diperbarui
  camera.position.set(
    playerModel.position.x,
    cameraHeight,
    playerModel.position.z + 25
  );
  camera.lookAt(playerModel.position);

  if (playerModel && !gameState.isGameOver) {
    playerModel.position.x += controls.velocity.x;
    playerModel.position.z += controls.velocity.z;

    playerLight.position.copy(playerModel.position);

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.position.add(bullet.velocity);

      if (bullet.position.length() > 100) {
        scene.remove(bullet);
        bullets.splice(i, 1);
      }
    }

    for (const ufo of ufos) {
      ufo.rotation.z += 0.05; // Sesuaikan kecepatan rotasi sesuai keinginan

      ufo.boundingBox.setFromObject(ufo);

      // Perbarui kecepatan jika UFO sedang mengejar pemain
      if (gameState.score > 1000) {
        let direction = new THREE.Vector3().subVectors(
          playerModel.position,
          ufo.position
        );
        direction.normalize();
        ufo.velocity = direction.multiplyScalar(0.6); // Kecepatan lebih tinggi saat mengejar
      }

      ufo.position.add(ufo.velocity);

      if (ufo.position.z > playerModel.position.z + 10) {
        scene.remove(ufo);
        gameState.score -= 10;
        ufos.splice(ufos.indexOf(ufo), 1);
      }
    }

    checkCollisions();
  }

  composer.render(); // Gunakan composer untuk rendering
}

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight); // Update composer size
});

// Initialize UFO prototype before starting the game
createUfoPrototype().then(() => {
  // Spawn a UFO immediately after loading
  spawnUfo();
});

animate();
