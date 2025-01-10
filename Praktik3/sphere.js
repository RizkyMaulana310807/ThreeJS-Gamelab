import * as THREE from './node_modules/three/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.3);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

scene.background = new THREE.Color(0xFFC809);
const canvas = document.getElementById("Scene");
canvas.appendChild(renderer.domElement);

const radius = 1;
const widthSegments = 32;
const heightSegments = 32;
const sphereGeo = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x2DDAE1, wireframe: true, });
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMaterial);

scene.add(sphereMesh);

function render(){
    renderer.render(scene, camera);
    sphereMesh.rotation.x += 0.03;
    sphereMesh.rotation.y += 0.03;
    requestAnimationFrame(render);
}

render();