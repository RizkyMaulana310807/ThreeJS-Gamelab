import * as THREE from "three";
import { OrbitControls } from "./node_modules/three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-1, 1, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let hemi = new THREE.HemisphereLight(0xffeeb1, 0x080802, 4);
scene.add(hemi);

let light = new THREE.SpotLight(0xffa95c, 4);
light.castShadow = true;
light.position.set(-50, 50, 50);
scene.add(light);

const planeGeometry = new THREE.PlaneGeometry(500, 500, 500);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x2d4356,
  roughness: 0.1,
  metalness: 0.1,
  emissive: 0x2d4356,
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

function addBoxs() {
  for (let i = 0; i < 15; i++) {
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      roughness: 0.5,
      metalness: 0.8,
      map: new THREE.TextureLoader().load("gate_diffuse.jpg"),
    });

    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    const randomX = (Math.random() - 0.5) * 8;
    const randomY = (Math.random() - 0.5) * 8;

    boxMaterial.originalColor = new THREE.Color();
    boxMaterial.originalColor.copy(boxMaterial.color);

    boxMesh.isDraggable = true;
    boxMesh.addEventListener("click", () => {
      if (!boxMesh.isSelected) {
        boxMaterial.originalColor.copy(boxMaterial.color);
        boxMaterial.color.multiplyScalar(1.2);
        boxMesh.isSelected(true);
      } else {
        boxMaterial.color.copy(boxMaterial.originalColor);
        boxMesh.isSelected = false;
      }
    });

    boxMesh.position.set(randomX, 0.5, randomY);
    boxMesh.scale.set(
      Math.random() + 0.5,
      Math.random() + 0.5,
      Math.random() + 0.5
    );

    scene.add(boxMesh);
  }
}

addBoxs();

let controls;
let cekHover = true;
let cekDrag = false;
let cekRotate = false;
let isDragging = false;
let selectedObject = null;

console.log("Item di pilih = " + document.getElementById("interaction").value);
console.log("Cek Hover : " + cekHover);
document.addEventListener("mousemove", onHover);

document.getElementById("interaction").addEventListener("change", () => {
  const selectedOption = document.getElementById("interaction").value;
  console.log(
    "Item di pilih = " + document.getElementById("interaction").value
  );

  if (controls) {
    controls.dispose();
    controls = null;
  }
  switch (selectedOption) {
    case "hover":
      console.log("Hover terdeteksi");
      cekHover = true;
      cekDrag = false;
      cekRotate = false;
      document.addEventListener("mousemove", onHover);
      break;
    case "drag":
      console.log("Drag terdeteksi");
      cekDrag = true;
      cekHover = false;
      cekRotate = false;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mouseup", onMouseUp);
      break;
    case "rotate":
      cekRotate = true;
      cekHover = false;
      cekDrag = false;
      document.addEventListener("click", onRotate);
      break;
    default:
      break;
  }
});

function onHover(event) {
  if (cekHover == true) {
    const rayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    rayCaster.setFromCamera(mouse, camera);

    const intersects = rayCaster.intersectObjects(scene.children);

    scene.children.forEach((obj) => {
      if (obj.isMesh && obj !== plane) {
        obj.material.color.set(obj.material.originalColor);
      }
    });

    if (intersects.length > 0) {
      const selected = intersects[0].object;

      if (selected !== plane) {
        if (!selected.material.originalColor) {
          selected.material.originalColor = new THREE.Color(0xffffff);
          selected.material.originalColor.copy(selected.material.color);
        }
        selected.material.color.set(
          selected.material.originalColor.clone().multiplyScalar(5)
        );
      }
    }
  }
}

function onMouseDown(event) {
  if (cekDrag == true) {
    console.log("Click");
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      const selected = intersects[0].object;
      if (selected.isDraggable) {
        isDragging = true;
        selectedObject = selected;
      }
    }
  }
}

function onMouseMove(event) {
  if (isDragging && selectedObject) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([plane]);

    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point;
      selectedObject.position.y = 0.5;

      selectedObject.position.x = intersectionPoint.x;
      selectedObject.position.z = intersectionPoint.z;
    }
  }
}

function onMouseUp(event) {
  isDragging = false;
  selectedObject = null;
}

function onRotate(event) {
  if (cekRotate === true) {
    if (!controls) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 0.8;
      controls.minDistance = 1;
      controls.maxDistance = 1000;
      controls.maxPolarAngle = Math.PI / 2.5;
    }
    controls.update();
    console.log(camera.position);
  }
}

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
