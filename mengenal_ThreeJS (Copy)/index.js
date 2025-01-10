//baca README.md sebelum menjalankan

import * as THREE from 'three';

var scene = new THREE.Scene();
var cam = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ antialias: true });


renderer.setSize(500, 500);
scene.background = new THREE.Color(0xffff00);


document.body.appendChild(renderer.domElement);


renderer.domElement.style.position = 'absolute';
renderer.domElement.style.left = '50%';
renderer.domElement.style.top = '50%';
renderer.domElement.style.transform = 'translate(-50%, -50%)';


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, cam);
}
animate();


window.addEventListener('resize', function() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8; // Ukuran responsif (80% dari ukuran terkecil)
    renderer.setSize(size, size);
    cam.aspect = 1; // Tetap menggunakan aspek rasio 1:1
    cam.updateProjectionMatrix();
});
