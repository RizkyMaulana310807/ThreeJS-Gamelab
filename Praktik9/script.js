import * as THREE from "three";
import { OrbitControls } from "./node_modules/three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
const particleCount = 1000;

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const vsSource = `
varying vec2 vUv;
varying vec3 vNormal;

void main(){
vUv = uv;
vNormal = normal;
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const faSource = `
varying vec2 vUv;
uniform float time;
varying vec3 vNormal;

void main(){
vec3 color = vec3(0.5 + 0.5 * sin(time), 0.5 + 0.5 * cos(time), 0.5);
float pattern = mod(vUv.x + vUv.y + sin(time), 1.0);
color *= smoothstep(0.45, 0.55, pattern);




gl_FragColor = vec4(color, 1.0);
}

`

// untuk faSource light source

// vec3 ambientLight = vec3(0.3, 0.3, 0.3);
// vec3 lightDirection = normalize(vec3(0.3, 0.3, 0.3));
// float lambertian = max(dot(vNormal, lightDirection), 0.0);
// color += ambientLight + lambertian;



// untuk pattern faSource
// float stripePattern = mod(vUv.y * 10.0, 1.0);
// color *= smoothstep(0.45, 0.55, stripePattern);




const boxMaterial = new THREE.ShaderMaterial({
    vertexShader: vsSource,
    fragmentShader: faSource,
    uniforms: THREE.UniformsUtils.merge([
        THREE.ShaderLib.phong.uniforms,
        { time: { value: 0.0 } }
    ]),
    lights: true,
});

const boxGeometry = new THREE.BoxGeometry();

for (let i = 0; i < particleCount / 2; i++) {
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.position.set(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  );
  scene.add(box);
}


const particleMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: 0xFFFFFF,
    opacity: 0.7,
    transparent: true,
    blending: THREE.AdditiveBlending,
});

const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const opacities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++){
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    opacities[i] = Math.random();
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));


const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);



const animate = () => {
  requestAnimationFrame(animate);
  controls.update();

  const positions = particleGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3){
    positions[i] += 0.1 * (Math.random() - 0.5);
    positions[i + 1] += 0.1 * (Math.random() - 0.5);
    positions[i + 2] += 0.1 * (Math.random() - 0.5);
  }
  particleGeometry.attributes.position.needsUpdate = true;


  particleMaterial.opacity = Math.abs(Math.sin(Date.now() * 0.001));
  const opacities = particleGeometry.attributes.opacity.array;
  for (let i = 0; i < opacities.length; i++){
    opacities[i] = Math.random();
  }
  particleGeometry.attributes.opacity.needsUpdate = true;
  

  boxMaterial.uniforms.time.value += 0.01;
  renderer.render(scene, camera);
};

animate();
