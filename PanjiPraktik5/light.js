import * as THREE from "three";
import { OrbitControls } from "OrbitControls";

class BasicWorldDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });

    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;

    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    var canvas = document.getElementById("Scene");
    canvas.appendChild(this._threejs.domElement);
    window.addEventListener(
      "resize",
      () => {
        this._onWindowResize();
      },
      false
    );

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(75, 20, 0);

    this._scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xffffff, 3.0);
    light.position.set(0, 300, -300);
    light.target.position.set(0, 0, 0);

    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;

    this._scene.add(light);

    light = new THREE.AmbientLight(0x101010);
    this._scene.add(light);

    const controls = new OrbitControls(this._camera, this._threejs.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
      })
    );

    plane.castShadow = false;
    plane.receiveShadow = true;

    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);

    this._box = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({
        color: 0x2daaee1,
      })
    );

    this._box.position.set(Math.random() * 5, 10, Math.random() * 5);

    this._box.castShadow = true;
    this._box.receiveShadow = true;

    this._box.scale.set(2, 2, 2);
    this._scene.add(this._box);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
    });
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.position.copy(this._box.position);
    this._scene.add(particles);

    this._time = 0; // Variable waktu untuk animasi

    this._RAF();
  }

  _onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame(() => {
      this._time += 0.05; // Perubahan waktu untuk osilasi

      const scale = 1 + Math.abs(Math.sin(this._time * 3)); // Skala berosilasi antara 1 dan 2
      this._box.scale.set(scale, scale, scale);

      this._threejs.render(this._scene, this._camera);
      this._RAF();
    });
  }
}

let _APP = null;

window.addEventListener("DOMContentLoaded", () => {
  _APP = new BasicWorldDemo();
});
