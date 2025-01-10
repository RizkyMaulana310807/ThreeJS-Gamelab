import * as THREE from './node_modules/three/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.3);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

scene.background = new THREE.Color(0xFFC809);
const canvas = document.getElementById("Scene");
canvas.appendChild(renderer.domElement);

const kubus_gamelab = new THREE.BoxGeometry(1, 1, 1);

const mat_kubus = new THREE.MeshBasicMaterial({ color: 0x2DAAE1 });

const mesh_kubus = new THREE.Mesh(kubus_gamelab, mat_kubus);

scene.add(mesh_kubus);

function render() {
    renderer.render(scene, camera);
    mesh_kubus.rotation.x += 0.03;
    mesh_kubus.rotation.y += 0.03;
    requestAnimationFrame(render);
}

render();