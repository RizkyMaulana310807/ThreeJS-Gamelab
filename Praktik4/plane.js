import * as THREE from './node_modules/three/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.3);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

scene.background = new THREE.Color(0xFFC809);
const canvas = document.getElementById("Scene");
canvas.appendChild(renderer.domElement);

const width = 1.5;
const height = 1.5;
const widthSegments = 32;
const heightSegments = 32;
const planeGeo = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x2DDAE1, wireframe: true });

const planeMesh = new THREE.Mesh(planeGeo, planeMaterial);


scene.add(planeMesh);

function render(){
    renderer.render(scene, camera);

    planeMesh.rotation.x += 0.03;
    planeMesh.rotation.y += 0.03;
    requestAnimationFrame(render);
}
render();