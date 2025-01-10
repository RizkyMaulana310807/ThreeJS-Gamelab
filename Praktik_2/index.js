//baca README.md sebelum menjalankan

import * as THREE from 'three';
// import { MeshSurfaceSampler } from 'three/examples/jsm/Addons.js';

var scene = new THREE.Scene();
var cam = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ antialias: true });


renderer.setSize(500, 500);
scene.background = new THREE.Color(0xffff00);


renderer.setSize(window.innerWidth, window.innerHeight);
cam.position.z = 5;

scene.background = new THREE.Color(0xFFC809);
var canvas = document.getElementById('Scene');

canvas.appendChild(renderer.domElement);

var kubus_gamelab = new THREE.BoxGeometry(1, 1, 1,);
var mat_kubus = new THREE.MeshBasicMaterial({
    color :  0x2DAAE1,
    // wireframe: true
});

var kubus_gamelab1 = new THREE.BoxGeometry(1, 1, 1,);
var mat_kubus1 = new THREE.MeshBasicMaterial({
    color :  0x2DAAE1,
    // wireframe: true
});



var mesh_kubus = new THREE.Mesh(kubus_gamelab, mat_kubus);
scene.add(mesh_kubus);
mesh_kubus.position.set(0.3, 0);
mesh_kubus.scale.set(0.2, 0.2, 0.2);
var mesh_kubus1 = new THREE.Mesh(kubus_gamelab1, mat_kubus1);
mesh_kubus1.scale.set(0.2, 0.2, 0.2);
mesh_kubus1.position.set(-0.3, 0);
scene.add(mesh_kubus1);



const startPosition = new THREE.Vector3(-1, 1, 0);
const targetPosition = new THREE.Vector3(1, 0, 0);
const bounceHeight = 1;

const duration = 2000;
let startTime = null;
let direction = -1;

function animate(){
    if(startTime === null){
        startTime = performance.now();
    }
    const elapsedTime = performance.now() - startTime;
    let progress = Math.min(elapsedTime / duration, 1);
    const interpolatedPosition = startPosition.clone().lerp(targetPosition, progress);


    if(progress < 0.5){
        const bounceProgress = progress / 0.5;
        const bounceOffset = Math.sin(bounceProgress * Math.PI) * bounceHeight;
        interpolatedPosition.y += bounceOffset;
    } else {
        const bounceProgress = (1 - progress) / 0.5;
        const bounceOffset = Math.sin(bounceProgress * Math.PI) * bounceHeight;
        interpolatedPosition.y -= bounceOffset;
    }

    if(progress === 1){
        direction *= -1;
        startTime = performance.now();
    }
    if(direction === -1){
        const temp = startPosition.clone();
        startPosition.copy(targetPosition);
        targetPosition.copy(temp);
    }
    mesh_kubus.position.copy(interpolatedPosition);
    requestAnimationFrame(animate);
    
}

const startPosition1 = new THREE.Vector3(1, 0, 0);
const targetPosition1 = new THREE.Vector3(-1, 1, 0);
const bounceHeight1 = 1;

const duration1 = 2000;
let startTime1 = null;
let direction1 = -1;

function animate1(){
    if(startTime1 === null){
        startTime1 = performance.now();
    }
    const elapsedTime = performance.now() - startTime1;
    let progress = Math.min(elapsedTime / duration1, 1);
    const interpolatedPosition = startPosition1.clone().lerp(targetPosition1, progress);


    if(progress < 0.5){
        const bounceProgress = progress / 0.5;
        const bounceOffset = Math.sin(bounceProgress * Math.PI) * bounceHeight1;
        interpolatedPosition.y += bounceOffset;
    } else {
        const bounceProgress = (1 - progress) / 0.5;
        const bounceOffset = Math.sin(bounceProgress * Math.PI) * bounceHeight1;
        interpolatedPosition.y -= bounceOffset;
    }

    if(progress === 1){
        direction1 *= -1;
        startTime1 = performance.now();
    }
    if(direction1 === -1){
        const temp = startPosition1.clone();
        startPosition1.copy(targetPosition1);
        targetPosition1.copy(temp);
    }
    mesh_kubus1.position.copy(interpolatedPosition);
    requestAnimationFrame(animate1);
    
}


const fullscreenButton = document.getElementById('fullscreenButton');
fullscreenButton.addEventListener('click', toggleFullscreen);

function toggleFullscreen(){
    if(!document.fullscreenElement){
        document.documentElement.requestFullscreen();
    } else{
        if(document.exitFullscreen){
            document.exitFullscreen();
        }
    }
}



function render(){
    renderer.render(scene, cam);
    mesh_kubus.rotation.x += 0.03;
    mesh_kubus.rotation.y += 0.03;
    mesh_kubus1.rotation.x += 0.03;
    mesh_kubus1.rotation.y += 0.03;
    requestAnimationFrame(render);
}
animate();
animate1();
render();