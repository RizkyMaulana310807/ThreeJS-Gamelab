import * as THREE from './node_modules/three/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.3);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

scene.background = new THREE.Color(0xFFC809);
const canvas = document.getElementById("Scene");
canvas.appendChild(renderer.domElement);

const radiusTop = 1;
const radiusBottom = 1;
const height = 2;
const radialSegments = 32;
const heightSegments = 1;
const openEnded = false;
const cylinderGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);

const cilinderMaterial = new THREE.MeshBasicMaterial({ color: 0x2DAAE1, wireframe: true });
const cylinderMesh = new THREE.Mesh(cylinderGeo, cilinderMaterial);

scene.add(cylinderMesh);

function render(){
    renderer.render(scene, camera);
    cylinderMesh.rotation.x += 0.03;
    cylinderMesh.rotation.y += 0.03;
    requestAnimationFrame(render);
}

render();