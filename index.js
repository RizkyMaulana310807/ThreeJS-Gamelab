import * as THREE from "three";
// import * as CANNON from 'canon';
import CannonDebugger from "cannon-es-debugger";
import * as CANNON from "cannon-es";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PCFSoftShadowMap } from "three";

document.addEventListener("DOMContentLoaded", () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  scene.background = new THREE.Color(0x2faae1);

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  camera.position.z = 10;

  const planeGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.2,
    map: new THREE.TextureLoader().load("src/img/texture.png"),
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  let bGeo = new THREE.BoxGeometry(1, 1, 1);
  const texture = new THREE.TextureLoader().load("src/img/gawrgura.jpeg");
  texture.wrapS = THREE.RepeatWrapping; // Pengulangan pada sumbu horizontal
  texture.wrapT = THREE.RepeatWrapping; // Pengulangan pada sumbu vertikal
  texture.repeat.set(1, 1); // Ulangi dua kali di setiap arah (ubah nilai sesuai kebutuhan)
  let bMat = new THREE.MeshStandardMaterial({
    roughness: 0.8,
    metalness: 0.2,
    map: texture,
  });

  let bMash = new THREE.Mesh(bGeo, bMat);
  bMash.position.set(0, 2, 0);
  scene.add(bMash);

  let bMash2 = new THREE.Mesh(bGeo, bMat);
  bMash.position.set(0, 5, 0);
  scene.add(bMash2);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  let light = new THREE.DirectionalLight(0xffffff, 3, 0);
  light.position.set(0, 300, -300);
  light.target.position.set(0, 0, 0);

  light.castShadow = true;
  light.shadow.bias = -0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 500.0;
  light.shadow.camera.left = 100;
  light.shadow.camera.right = -100;
  light.shadow.camera.top = 100;
  light.shadow.camera.bottom = -100;

  scene.add(light);
  light = new THREE.AmbientLight(0x101010);
  scene.add(light);

  let world = new CANNON.World();
  world.gravity.set(0, -10, 0);
  world.boardphase = new CANNON.NaiveBroadphase();
  let timeStamp = 1.0 / 60.0;
  let plane2 = new CANNON.Plane();
  let plane2body = new CANNON.Body({ shape: plane2, mass: 0 });
  plane2body.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    -Math.PI / 2
  );
  world.addBody(plane2body);

  let box = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  let bodyBox = new CANNON.Body({ shape: box, mass: 5 });
  bodyBox.position.set(0, 0, 0);
  world.addBody(bodyBox);


  let box2 = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  let bodyBox2 = new CANNON.Body({ shape: box, mass: 5 });
  bodyBox2.position.set(0, 25, 0);
  world.addBody(bodyBox2);
  
  
  const debugRenderer = CannonDebugger(scene, world);

  const animate = () => {
    controls.update();

    world.step(timeStamp);
    bMash.position.copy(bodyBox.position);
    bMash2.position.copy(bodyBox2.position);
    bMash2.rotation.copy(bodyBox2);

    if(bMash2.position.distanceTo(bMash.position) < 1){
        scene.remove(bMash2);
    }
    

    
    
    
    debugRenderer.update();


    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
});
