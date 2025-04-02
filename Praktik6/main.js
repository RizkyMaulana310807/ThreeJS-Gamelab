import * as THREE from "three";
import CannonDebugger from "cannon-es-debugger";
import * as CANNON from "cannon-es";
import { OrbitControls } from "OrbitControls";

document.addEventListener("DOMContentLoaded", () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  scene.background = new THREE.Color(0x2faae1);

  // Add back OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 3, 8);
  camera.rotation.set(Math.PI / 4, 0, 0); // Putar kamera 45° pada sumbu X
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  // Plane setup
  const planeGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.2,
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  // Create textures for boxes
  const textureLoader = new THREE.TextureLoader();
  let texture;
  try {
    texture = textureLoader.load(
      "./src/img/image.png",
      undefined,
      undefined,
      (error) => {
        console.error("Error loading texture:", error);
      }
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
  } catch (error) {
    console.error("Failed to load texture:", error);
    texture = null;
  }

  // Materials
  const bMat = new THREE.MeshStandardMaterial({
    roughness: 0.8,
    metalness: 0.2,
    map: texture || null,
    color: texture ? 0xffffff : 0xff0000
  });

  // Box geometry
  const bGeo = new THREE.BoxGeometry(1, 1, 1);

  // Box 1 - Controlled by keyboard
  const bMash1 = new THREE.Mesh(bGeo, bMat);
  bMash1.position.set(0, 0.5, 4);
  scene.add(bMash1);

  // Box 2 - Moves automatically
  const bMash2 = new THREE.Mesh(bGeo, bMat);
  bMash2.position.set(0, 0.5, -4);
  scene.add(bMash2);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 10, 0);
  scene.add(directionalLight);

  // Physics world
  let world = new CANNON.World();
  world.gravity.set(0, -10, 0);

  const planeBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
  });
  planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(planeBody);

  // Box physics bodies
  const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));

  const bodyBox1 = new CANNON.Body({
    mass: 5,
    shape: boxShape,
    position: new CANNON.Vec3(0, 0.5, 4),
  });
  world.addBody(bodyBox1);

  const bodyBox2 = new CANNON.Body({
    mass: 5,
    shape: boxShape,
    position: new CANNON.Vec3(0, 0.5, -4),
  });
  world.addBody(bodyBox2);

  // Projectile setup
  const projectiles = [];
  const projectileGeometry = new THREE.SphereGeometry(0.2, 32, 32);
  const projectileMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });

  // Box 2 movement variables
  let direction = 1;
  const moveSpeed = 0.05;

  // Keyboard controls
  const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
  };

  document.addEventListener("keydown", (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = true;
    }
  });

  document.addEventListener("keyup", (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = false;
    }
  });

  // Shooting function
  function shoot() {
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    projectile.position.copy(bMash1.position);
    scene.add(projectile);

    const projectileBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(0.2),
      position: new CANNON.Vec3(bodyBox1.position.x, bodyBox1.position.y, bodyBox1.position.z),
    });
    
    // Set velocity towards negative z (forward)
    projectileBody.velocity.set(0, 0, -20);
    
    // Add restitution for bouncing
    projectileBody.material = new CANNON.Material();
    projectileBody.material.restitution = 0.7;
    
    world.addBody(projectileBody);
    
    projectiles.push({
      mesh: projectile,
      body: projectileBody,
      createdAt: Date.now(),
      hasCollided: false,
      collisionTime: null
    });
  }

  const animate = () => {
    world.step(1/60);
    controls.update();

    // Update positions of boxes
    bMash1.position.copy(bodyBox1.position);
    bMash1.quaternion.copy(bodyBox1.quaternion);

    bMash2.position.copy(bodyBox2.position);
    bMash2.quaternion.copy(bodyBox2.quaternion);

    // Box 2 automatic movement (left-right only)
    bodyBox2.position.x += moveSpeed * direction;
    if (bodyBox2.position.x > 4.5 || bodyBox2.position.x < -4.5) {
      direction *= -1;
    }

    // Box 1 keyboard movement (left-right only)
    if (keys.ArrowLeft && bodyBox1.position.x > -4.5) {
      bodyBox1.position.x -= 0.1;
    }
    if (keys.ArrowRight && bodyBox1.position.x < 4.5) {
      bodyBox1.position.x += 0.1;
    }
    
    // Shooting
    if (keys.Space) {
      shoot();
      keys.Space = false; // Prevent continuous shooting
    }

    // Update projectiles
    const currentTime = Date.now();
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      projectile.mesh.position.copy(projectile.body.position);
      
      // Check collision with Box 2
      const distance = projectile.mesh.position.distanceTo(bMash2.position);
      if (distance < 1 && !projectile.hasCollided) {
        // Mark as collided and store collision time
        projectile.hasCollided = true;
        projectile.collisionTime = currentTime;
        
        // Calculate reflection vector
        const velocity = projectile.body.velocity;
        velocity.z *= -1; // Reverse z direction for bounce
        projectile.body.velocity.copy(velocity);
      }
      
      // Remove projectiles after conditions are met
      if (
        // Remove if too far
        projectile.mesh.position.z < -10 || 
        // Remove if not collided and too old
        (!projectile.hasCollided && currentTime - projectile.createdAt > 3000) ||
        // Remove if collided and 2 seconds have passed since collision
        (projectile.hasCollided && currentTime - projectile.collisionTime > 2000)
      ) {
        scene.remove(projectile.mesh);
        world.removeBody(projectile.body);
        projectiles.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
});