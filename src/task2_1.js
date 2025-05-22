import './style.css';

import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer;
let model = null;
const clock = new THREE.Clock();

init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0, 0, 700);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // Освітлення
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Завантаження моделі
    loadModel('https://universitylpnubucket.s3.eu-north-1.amazonaws.com/scene.gltf');

    // AR Button
    document.body.appendChild(ARButton.createButton(renderer));

    // Resize
    window.addEventListener('resize', onWindowResize);
}

function loadModel(url) {
    const loader = new GLTFLoader();
    loader.load(
        url,
        function (gltf) {
            try {
                model = gltf.scene;
                centerModel(model);
                scene.add(model);
                console.log('Model added to scene');
            } catch (e) {
                console.error('Error processing loaded model:', e);
            }
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100).toFixed(2) + '% loaded');
        },
        function (error) {
            console.error('GLTF load error:', error);
        }
    );
}

function centerModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function swayModel() {
    if (model) {
        const time = clock.getElapsedTime();
        const swayAmount = 0.05;
        model.rotation.z = Math.sin(time * 0.5) * swayAmount;
    }
}

function render() {
    swayModel();
    renderer.render(scene, camera);
}