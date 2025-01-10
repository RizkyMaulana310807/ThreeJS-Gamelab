import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { OBJLoader } from "./node_modules/three/examples/jsm/loaders/OBJLoader.js";
import { EffectComposer } from "./node_modules/three/examples/jsm/Addons.js";
import { RenderPass } from "./node_modules/three/examples/jsm/Addons.js";
import { UnrealBloomPass } from "./node_modules/three/examples/jsm/Addons.js";
import { DotScreenPass } from "./node_modules/three/examples/jsm/Addons.js";
import { BokehPass } from "./node_modules/three/examples/jsm/Addons.js";
import { ShaderPass } from "./node_modules/three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
const clock = new THREE.Clock();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.append(renderer.domElement);

camera.position.z = Math.PI / 2;
camera.position.y = 300;

let mixer, model, animation;

const loadingManager = new THREE.LoadingManager();

// Hubungkan dengan event handlers
loadingManager.onLoad = () => {
  console.log("semua sumber daya telah di muat. memulai animasi");
  animate();
};

loadingManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) => {
  console.log(`Memuat: ${itemUrl} | ${itemsLoaded} dari ${itemsTotal} selesai`);
};

loadingManager.onError = (url) => {
  console.error(`Gagal memuat: ${url}`);
};

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 0);
light.castShadow = true;
scene.add(light);

const objek = new THREE.BoxGeometry(155, 10, 155);
const material = new THREE.MeshStandardMaterial({
  color: 0x808080,
  roughness: 0.5,
  metalness: 0.5,
});
const mesh_plane = new THREE.Mesh(objek, material);
const mesh_kubus1 = new THREE.Mesh(objek, material);
const mesh_kubus2 = new THREE.Mesh(objek, material);
const mesh_kubus3 = new THREE.Mesh(objek, material);

mesh_kubus1.scale.set(0.4, 0.4, 0.4);
mesh_kubus2.scale.set(0.3, 9, 0.3);
mesh_kubus3.scale.set(0.35, 0.35, 0.35);
mesh_kubus1.position.y = -2;
mesh_plane.position.y = -9;
mesh_kubus2.position.y = 30;
mesh_kubus3.position.y = 70;

scene.add(mesh_plane);
scene.add(mesh_kubus1);
scene.add(mesh_kubus2);
scene.add(mesh_kubus3);

const animate = () => {
  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(clock.getDelta());
  }

  controls.update();
  renderer.render(scene, camera);
};

// animate();

const loaderObj = new OBJLoader(loadingManager);
const loaderGlb = new GLTFLoader(loadingManager);

const fenceMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.5,
  metalness: 0.5,
  map: new THREE.TextureLoader(loadingManager).load("gate_diffuse.jpg"),
});

createObj(
  "gate_obj.obj",
  new THREE.Vector3(0, -5, 60),
  new THREE.Euler(0, 0, 0),
  fenceMaterial
);
createObj(
  "gate_obj.obj",
  new THREE.Vector3(60, -5, 0),
  new THREE.Euler(0, -Math.PI / 2, 0),
  fenceMaterial
);
createObj(
  "gate_obj.obj",
  new THREE.Vector3(-60, -5, 0),
  new THREE.Euler(0, -Math.PI / 2, 0),
  fenceMaterial
);
createObj(
  "gate_obj.obj",
  new THREE.Vector3(0, -5, -60),
  new THREE.Euler(0, 0, 0),
  fenceMaterial
);
createGlb(
  "Wolf-Blender-2.82a.glb",
  new THREE.Vector3(0, 80, 0),
  new THREE.Vector3(25, 25, 25),
  0
);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
composer.addPass(bloomPass);

const DotScreen = new DotScreenPass(camera, scene);
composer.addPass(DotScreen);

const bokehPass = new BokehPass(scene, camera, {
  focus: 1.0,
  aperture: 0.025,
  maxblur: 0.01,
  width: window.innerWidth,
  height: window.innerHeight,
});
composer.addPass(bokehPass);

const Shaderpass = new ShaderPass();
composer.addPass(Shaderpass);

function createObj(path, position, rotation, material) {
  loaderObj.load(
    path,
    (objek) => {
      objek.position.copy(position);
      objek.rotation.copy(rotation);
      objek.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
        }
      });
      scene.add(objek);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("Error loading object:", error);
    }
  );
}

function createGlb(path, position, scale, anim) {
  loaderGlb.load(
    path,
    (model1) => {
      model = model1.scene;
      model = model1.scene.children[0];
      model.scale.copy(scale);
      model.position.copy(position);
      console.log("Model loaded:", model1);

      animation = model1.animations;
      mixer = new THREE.AnimationMixer(model1.scene);

      let action = mixer.clipAction(animation[anim]);
      action.play();
      scene.add(model1.scene);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("Error loading GLB:", error);
    }
  );
}

window.addEventListener("resize", () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
});
