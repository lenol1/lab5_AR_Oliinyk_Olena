import './style.css'

import * as THREE from "three"
import { ARButton } from "three/addons/webxr/ARButton.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let camera, scene, renderer;
let torusMesh, octahedronMesh, cylinderMesh;
let controls;

init();
animate();

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  // Сцена
  scene = new THREE.Scene();

  // Камера
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

  // Об'єкт рендерингу
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.xr.enabled = true; // Життєво важливий рядок коду для вашого застосунку!
  container.appendChild(renderer.domElement);

  // Світло
  const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
  directionalLight.position.set(3, 3, 3);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 10, 10);
  pointLight.position.set(-2, 2, 2);
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  // 1. Створюємо об'єкт Torus Knot
  const torusGeometry = new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16);
  // Матеріал для другого
  const emissiveMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e90ff,
    emissive: 0xff4500,
    emissiveIntensity: 3,
    metalness: 0.5,
    roughness: 0.2,
  });
  // Створюємо наступний меш
  torusMesh = new THREE.Mesh(torusGeometry, emissiveMaterial);
  scene.add(torusMesh);

  // 2. Створюємо об'єкт циліндра
  const cylinderGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 32);
  // Матеріал для першого об'єкту 
  const pinkMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff69b4,
    transparent: true,
    opacity: 0.5,
    roughness: 0.4,
    metalness: 0.8,
    reflectivity: 1.0,
    transmission: 0.8,
  });
  // Створюємо меш
  cylinderMesh = new THREE.Mesh(cylinderGeometry, pinkMaterial);
  cylinderMesh.position.x = -1.5;
  scene.add(cylinderMesh);

  // 3. Створюємо об'єкт Octahedron
  const octahedronGeometry = new THREE.OctahedronGeometry(0.6, 0);
  // Матеріал для третього
  const greenMaterial = new THREE.MeshStandardMaterial({
    color: 0x32cd32,
    metalness: 1,
    roughness: 0.3,
  });
  // Створюємо наступний меш
  octahedronMesh = new THREE.Mesh(octahedronGeometry, greenMaterial);
  octahedronMesh.position.x = 1.5;
  scene.add(octahedronMesh);

  // Позиція для камери
  camera.position.z = 3;

  // Контролери для 360 огляду на вебсторінці, але не під час AR-сеансу
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  document.body.appendChild(ARButton.createButton(renderer));

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
  controls.update();
}

function render() {
  rotateObjects();
  renderer.render(scene, camera);
}

function rotateObjects() {
  torusMesh.rotation.x += 0.01;
  torusMesh.rotation.y += 0.005;

  cylinderMesh.rotation.z += 0.01;

  octahedronMesh.rotation.y += 0.01;
  octahedronMesh.rotation.x += 0.005;
}