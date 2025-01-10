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
const tubeRadius = 0.6;
const radialSegments = 25;
const tubularSegments = 50;
const torusGeo = new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments);

const torusMaterial = new THREE.MeshBasicMaterial({ color: 0x2DDAE1, wireframe: true });

const torusMesh = new THREE.Mesh(torusGeo, torusMaterial);


scene.add(torusMesh);

function render(){
    renderer.render(scene, camera);

    torusMesh.rotation.x += 0.03;
    torusMesh.rotation.y += 0.03;
    requestAnimationFrame(render);
}
render();