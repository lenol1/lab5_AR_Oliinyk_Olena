import './style.css'

import * as THREE from "three"
import { ARButton } from "three/addons/webxr/ARButton.js"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let container;
let camera, scene, renderer;
let reticle;
let controller;
let model = null;
let selectedMaterial = 'realistic';
let lightEnabled = true;
let lightColor = '#ffffff';
let lightIntensity = 2;
let enableJump = false;
let enableModelRotation = false;
let directionalLight;

const clock = new THREE.Clock();

init();
animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    directionalLight = new THREE.DirectionalLight(lightColor, lightIntensity);
    directionalLight.position.set(5, 5, 5);
    directionalLight.visible = lightEnabled;
    scene.add(directionalLight);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    addReticleToScene();

    const button = ARButton.createButton(renderer, {
        requiredFeatures: ["hit-test"]
    });
    document.body.appendChild(button);
    renderer.domElement.style.display = "none";

    window.addEventListener("resize", onWindowResize, false);
    document.getElementById("materialType").addEventListener("change", (e) => {
        selectedMaterial = e.target.value;
    });

    document.getElementById("lightColorControl").addEventListener("input", (e) => {
        lightColor = e.target.value;
        if (directionalLight) directionalLight.color.set(lightColor);
    });

    document.getElementById("lightIntensityControl").addEventListener("input", (e) => {
        lightIntensity = parseFloat(e.target.value);
        if (directionalLight) directionalLight.intensity = lightIntensity;
    });

    document.getElementById("dirLightToggle").addEventListener("change", (e) => {
        lightEnabled = e.target.checked;
        if (directionalLight) directionalLight.visible = lightEnabled;
    });

    document.getElementById("jumpToggle").addEventListener("change", (e) => {
        enableJump = e.target.checked;
    });

    document.getElementById("rotationToggleModel").addEventListener("change", (e) => {
        enableModelRotation = e.target.checked;
    });
}

function addReticleToScene() {
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32);
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    const material = new THREE.MeshBasicMaterial();

    reticle = new THREE.Mesh(geometry, material);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
    reticle.add(new THREE.AxesHelper(1));
}

function applyMaterial(model, type) {
    model.traverse((child) => {
        if (child.isMesh) {
            let newMaterial;

            switch (type) {
                case 'gold':
                    newMaterial = new THREE.MeshStandardMaterial({
                        color: 0xffd700,
                        metalness: 1,
                        roughness: 0.2,
                    });
                    break;
                case 'glass':
                    newMaterial = new THREE.MeshPhysicalMaterial({
                        color: 0x99ccff,
                        metalness: 0,
                        roughness: 0,
                        transmission: 1,
                        transparent: true,
                        opacity: 0.4,
                    });
                    break;
                case 'chrome':
                    newMaterial = new THREE.MeshStandardMaterial({
                        color: 0xcccccc,
                        metalness: 1,
                        roughness: 0,
                    });
                    break;
                case 'glow':
                    newMaterial = new THREE.MeshStandardMaterial({
                        color: 0xff00ff,
                        emissive: 0xff00ff,
                        emissiveIntensity: 1,
                    });
                    break;
                case 'realistic':
                default:
                    return;
            }

            child.material.dispose();
            child.material = newMaterial;
        }
    });
}

function onSelect() {
    if (reticle.visible) {
        const modelUrl = 'https://universitylpnubucket.s3.eu-north-1.amazonaws.com/task4/scene.gltf';
        const loader = new GLTFLoader();

        if (model) {
            scene.remove(model);
            model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            model = null;
        }

        loader.load(modelUrl, (gltf) => {
            model = gltf.scene;

            const pos = new THREE.Vector3();
            const quat = new THREE.Quaternion();
            reticle.getWorldPosition(pos);
            reticle.getWorldQuaternion(quat);

            model.position.copy(pos);
            model.quaternion.copy(quat);
            model.scale.set(0.5, 0.5, 0.5);

            applyMaterial(model, selectedMaterial);

            scene.add(model);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
        });
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

let hitTestSource = null;
let localSpace = null;
let hitTestSourceInitialized = false;

async function initializeHitTestSource() {
    const session = renderer.xr.getSession();

    const viewerSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

    localSpace = await session.requestReferenceSpace("local");

    hitTestSourceInitialized = true;

    session.addEventListener("end", () => {
        hitTestSourceInitialized = false;
        hitTestSource = null;
    });
}

function render(timestamp, frame) {
    if (frame) {
        if (!hitTestSourceInitialized) {
            initializeHitTestSource();
        }

        if (hitTestSourceInitialized) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(localSpace);

                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
            } else {
                reticle.visible = false;
            }
        }
        if (model) {
            if (enableModelRotation) {
                model.rotation.y += 0.01;
            }

            if (enableJump) {
                const t = clock.getElapsedTime();
                model.position.y += Math.sin(t * 3) * 0.005;
            }
        }

        renderer.render(scene, camera);
    }
}