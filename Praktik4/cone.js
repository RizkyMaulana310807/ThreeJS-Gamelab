import * as THREE from "./node_modules/three/build/three.module.js";
const textureLoader = new THREE.TextureLoader();
const coneTexture = textureLoader.load('image.png'); // Pastikan path benar



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.3
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

scene.background = new THREE.Color(0xffc809);
const canvas = document.getElementById("Scene");
canvas.appendChild(renderer.domElement);

const radius = 2;
const height = 4;
const radialSegments = 32;
const heightSegments = 1;
const openEnded = false;
const thetaStart = 0;
const thetaLength = Math.PI * 2;
const coneGeo = new THREE.ConeGeometry(
  radius,
  height,
  radialSegments,
  heightSegments,
  openEnded,
  thetaStart,
  thetaLength
);

const coneMaterial = new THREE.MeshBasicMaterial({
  map: coneTexture
});

const coneMesh = new THREE.Mesh(coneGeo, coneMaterial);
coneMesh.scale.set(0.5, 0.5, 0.5);

scene.add(coneMesh);

const gui = new dat.GUI();

function setRotation(x, y, z) {
  coneMesh.rotation.x = x;
  coneMesh.rotation.y = y;
  coneMesh.rotation.z = z;
}

const rotationParams = {
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
};

const folderRotation = gui.addFolder("Rotation");
folderRotation
  .add(rotationParams, "rotationX", 0, Math.PI * 2)
  .onChange((value) =>
    setRotation(value, rotationParams.rotationY, rotationParams.rotationZ)
  );
folderRotation
  .add(rotationParams, "rotationY", 0, Math.PI * 2)
  .onChange((value) =>
    setRotation(rotationParams.rotationX, value, rotationParams.rotationZ)
  );
folderRotation
  .add(rotationParams, "rotationZ", 0, Math.PI * 2)
  .onChange((value) =>
    setRotation(rotationParams.rotationX, rotationParams.rotationY, value)
  );

function setScale(x, y, z) {
  coneMesh.scale.set(x, y, z);
}
const scaleParams = {
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
};

const folderScale = gui.addFolder("Scale");
folderScale
  .add(scaleParams, "scaleX", 0.1, 2)
  .onChange((value) => setScale(value, scaleParams.scaleY, scaleParams.scaleZ));
folderScale
  .add(scaleParams, "scaleY", 0.1, 2)
  .onChange((value) => setScale(scaleParams.scaleX, value, scaleParams.scaleZ));
folderScale
  .add(scaleParams, "scaleZ", 0.1, 2)
  .onChange((value) => setScale(scaleParams.scaleX, scaleParams.scaleY, value));

function updateCameraPosition() {
  camera.position.set(
    cameraParams.cameraPosition.x,
    cameraParams.cameraPosition.y,
    cameraParams.cameraPosition.z
  );
}

const cameraParams = {
  cameraPosition: { x: 0, y: 0, z: 5 },
};

const folderCamera = gui.addFolder("Camera");
folderCamera
  .add(cameraParams.cameraPosition, "x", -10, 10)
  .onChange(updateCameraPosition);
folderCamera
  .add(cameraParams.cameraPosition, "y", -10, 10)
  .onChange(updateCameraPosition);
folderCamera
  .add(cameraParams.cameraPosition, "z", 0, 20)
  .onChange(updateCameraPosition);

function render() {
  renderer.render(scene, camera);

  // coneMesh.rotation.x += 0.03;
  coneMesh.rotation.y += 0.03;
  requestAnimationFrame(render);
}
render();
