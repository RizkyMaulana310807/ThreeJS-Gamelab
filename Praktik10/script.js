import * as THREE from "three";
import { OrbitControls } from "./node_modules/three/examples/jsm/Addons.js";
import { OBJLoader } from "./node_modules/three/examples/jsm/Addons.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/Addons.js";
import { EffectComposer } from "./node_modules/three/examples/jsm/Addons.js";
import { RenderPass } from "./node_modules/three/examples/jsm/Addons.js";
import { UnrealBloomPass } from "./node_modules/three/examples/jsm/Addons.js";
import { DotScreenPass } from "./node_modules/three/examples/jsm/Addons.js";
import { BokehPass } from "./node_modules/three/examples/jsm/Addons.js";
import { ShaderPass } from "./node_modules/three/examples/jsm/Addons.js";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
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

const Shaderpass = new Shaderpass();
composer.addPass(Shaderpass);

const loadingManager = new THREE.LoadingManager();

loadingManager.onLoad = () => {
    console.log('semua sumber daya telah di muat. memulai animasi');
    animate();
};

loadingManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) => {
    console.log(`Memuat: ${itemUrl} | ${itemsLoaded} dari ${itemsTotal} selesai`);
};

loadingManager.onError = (url) => {
    console.log(`Gagal memuat: ${url}`);
}

const loaderObj = new OBJLoader(loadingManager);
const loaderGlb = new GLTFLoader(loadingManager);

