import './style.css'

import * as THREE from "three"
import { ARButton } from "three/addons/webxr/ARButton.js"

let container;
let camera, scene, renderer;
let reticle;
let controller;
let enableRotation = false;
let scalePulse = false;
let torusColor = "#ff0000";
let torusScale = 1;
let materialType = "standard";
const animatedObjects = [];

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
    renderer.shadowMap.enabled = true;

    var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);
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
    document.getElementById("torusColor").addEventListener("input", (e) => {
        torusColor = e.target.value;
    });

    document.getElementById("torusRotationToggle").addEventListener("change", (e) => {
        enableRotation = e.target.checked;
    });

    document.getElementById("torusSize").addEventListener("input", (e) => {
        torusScale = parseFloat(e.target.value);
    });

    document.getElementById("scaleAnimationToggle").addEventListener("change", (e) => {
        scalePulse = e.target.checked;
    });

    document.getElementById("materialSelect").addEventListener("change", (e) => {
        materialType = e.target.value;
    });
}

function addReticleToScene() {
    const geometry = new THREE.TorusGeometry(0.05, 0.02, 16, 32).rotateX(
        -Math.PI / 2
    );
    const material = new THREE.MeshBasicMaterial();

    reticle = new THREE.Mesh(geometry, material);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
    reticle.add(new THREE.AxesHelper(1));
}

function onSelect() {
    if (reticle.visible) {
        const geometry = new THREE.TorusGeometry(0.05, 0.02, 16, 32);
        const material = createMaterial(materialType, torusColor);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.setFromMatrixPosition(reticle.matrix);
        mesh.quaternion.setFromRotationMatrix(reticle.matrix);
        mesh.scale.setScalar(torusScale);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.userData = {
            rotationEnabled: enableRotation,
            scalePulseEnabled: scalePulse,
            originalScale: torusScale,
            scaleDirection: 1,
        };

        scene.add(mesh);
        animatedObjects.push(mesh);
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

function createMaterial(type, color) {
    switch (type) {
        case "emissive":
            return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 });
        case "transparent":
            return new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.5 });
        default:
            return new THREE.MeshStandardMaterial({ color });
    }
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
        animatedObjects.forEach((obj) => {
            if (obj.userData.rotationEnabled) {
                obj.rotation.y += 0.01;
            }
            if (obj.userData.scalePulseEnabled) {
                const scale = obj.scale.x + obj.userData.scaleDirection * 0.01;
                if (scale > obj.userData.originalScale * 1.2 || scale < obj.userData.originalScale * 0.8) {
                    obj.userData.scaleDirection *= -1;
                }
                obj.scale.setScalar(scale);
            }
        });

        renderer.render(scene, camera);
    }
}