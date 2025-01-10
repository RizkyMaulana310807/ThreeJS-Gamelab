import * as THREE from "./node_modules/three/build/three.module.js";
import { TextGeometry } from "./node_modules/three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "./node_modules/three/examples/jsm/loaders/FontLoader.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.3,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 5, 20);
document.body.appendChild(renderer.domElement);

// Background
scene.background = new THREE.Color(0xffc809);

// Teks
let textMesh;
const loader = new FontLoader();
const textureLoader = new THREE.TextureLoader();

// Muat tekstur
const textTexture = textureLoader.load("image.png"); // Ganti dengan path tekstur Anda

loader.load(
  "./node_modules/three/examples/fonts/droid/droid_sans_bold.typeface.json",
  function (font) {
    const texGeo = new TextGeometry("Hello world, from Rizky Maulana", {
      font: font,
      size: 1,
      height: 0.5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 3,
    });

    const textMaterial = new THREE.MeshStandardMaterial({
      map: textTexture, // Tambahkan tekstur ke material
    });

    textMesh = new THREE.Mesh(texGeo, textMaterial);

    // Pusatkan teks
    texGeo.computeBoundingBox();
    const textBoundingBox = texGeo.boundingBox;
    const textWidth = textBoundingBox.max.x - textBoundingBox.min.x;

    textMesh.position.x = -textWidth / 2;
    textMesh.position.y = 0;
    textMesh.position.z = 0;

    scene.add(textMesh);

    // Tambahkan kontrol rotasi ke GUI setelah teks dibuat
    gui.add(textRotation, "rotationX", 0, Math.PI * 2).name("Text Rotate X");
    gui.add(textRotation, "rotationY", 0, Math.PI * 2).name("Text Rotate Y");
    gui.add(textRotation, "rotationZ", 0, Math.PI * 2).name("Text Rotate Z");
  }
);

// Pencahayaan
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); // Cahaya ambient
scene.add(ambientLight);

// Kontrol kamera
const Controls = new OrbitControls(camera, renderer.domElement);
Controls.update();

// Setup dat.GUI untuk rotasi teks
const gui = new dat.GUI();
const textRotation = {
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
};

// Event resize untuk memperbarui ukuran tampilan
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function render() {
  // Rotasi teks sesuai kontrol GUI
  if (textMesh) {
    textMesh.rotation.x = textRotation.rotationX;
    textMesh.rotation.y = textRotation.rotationY;
    textMesh.rotation.z = textRotation.rotationZ;
  }

  Controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
