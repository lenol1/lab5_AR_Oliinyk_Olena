import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let camera, scene, renderer;
let cylinderMesh, octahedronMesh, torusMesh;
let controls;
let particles;
let hue = 0;

let rotationEnabled = true;
let pulseMoveEnabled = true;
let colorEmitEnabled = true;
let speedMode = "normal";
let texturesEnabled = true;
let rotationDirection = 1;
let specialEffectActive = false;
let specialEffectTimer = 0;

let emissiveMaterial, emissiveMaterialNoTexture;
let pinkMaterial, pinkMaterialNoTexture;
let greenMaterial, greenMaterialNoTexture;

init();
animate();

function init() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.01, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
    directionalLight.position.set(3, 3, 3);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 10, 10);
    pointLight.position.set(-2, 2, 2);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const torusGeometry = new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16);
    emissiveMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e90ff,
        emissive: 0xff4500,
        emissiveIntensity: 3,
        metalness: 0.5,
        roughness: 0.2,
    });
    emissiveMaterialNoTexture = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        transparent: true,
        emissiveIntensity: 3,
        metalness: 0.5,
        roughness: 0.2,
    });
    torusMesh = new THREE.Mesh(torusGeometry, emissiveMaterial);
    scene.add(torusMesh);

    const cylinderGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 32);
    pinkMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff69b4,
        emissive: 0xff4500,
        emissiveIntensity: 3,
        transparent: true,
        opacity: 0.5,
        roughness: 0.4,
        metalness: 0.8,
        reflectivity: 1.0,
        transmission: 0.8,
    });
    pinkMaterialNoTexture = new THREE.MeshPhysicalMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5,
        roughness: 0.4,
        metalness: 0.8,
        reflectivity: 1.0,
        transmission: 0.8,
    });
    cylinderMesh = new THREE.Mesh(cylinderGeometry, pinkMaterial);
    cylinderMesh.position.x = -1.5;
    scene.add(cylinderMesh);

    const octahedronGeometry = new THREE.OctahedronGeometry(0.6, 0);
    greenMaterial = new THREE.MeshStandardMaterial({
        color: 0x32cd32,
        emissive: 0xff4500,
        emissiveIntensity: 3,
        metalness: 1,
        roughness: 0.3,
    });
    greenMaterialNoTexture = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        metalness: 1,
        roughness: 0.3,
    });
    octahedronMesh = new THREE.Mesh(octahedronGeometry, greenMaterial);
    octahedronMesh.position.x = 1.5;
    scene.add(octahedronMesh);

    createParticles();

    camera.position.z = 3;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const button = ARButton.createButton(renderer, {
        onSessionStarted: () => {
            renderer.domElement.style.background = "transparent";
            document.getElementById("controls").style.display = "flex";
        },
        onSessionEnded: () => {
            document.getElementById("controls").style.display = "flex";
        },
    });
    document.body.appendChild(button);
    renderer.domElement.style.display = "block";

    document
        .getElementById("toggleRotationBtn")
        .addEventListener("click", toggleRotation);
    document
        .getElementById("togglePulseBtn")
        .addEventListener("click", togglePulseMove);
    document
        .getElementById("toggleColorBtn")
        .addEventListener("click", toggleColorEmit);
    document
        .getElementById("toggleSpeedBtn")
        .addEventListener("click", toggleSpeed);
    document
        .getElementById("toggleTexturesBtn")
        .addEventListener("click", toggleTextures);
    document
        .getElementById("toggleDirectionBtn")
        .addEventListener("click", toggleDirection);
    document
        .getElementById("specialEffectBtn")
        .addEventListener("click", triggerSpecialEffect);

    window.addEventListener("resize", onWindowResize, false);
}

function createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 8;

        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
    }

    particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0,
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

function toggleRotation() {
    rotationEnabled = !rotationEnabled;
    document.getElementById("toggleRotationBtn").textContent = rotationEnabled
        ? "Disable Rotation"
        : "Enable Rotation";
}

function togglePulseMove() {
    pulseMoveEnabled = !pulseMoveEnabled;
    document.getElementById("togglePulseBtn").textContent = pulseMoveEnabled
        ? "Disable Pulse/Move"
        : "Enable Pulse/Move";
}

function toggleColorEmit() {
    colorEmitEnabled = !colorEmitEnabled;
    document.getElementById("toggleColorBtn").textContent = colorEmitEnabled
        ? "Disable Color/Emit"
        : "Enable Color/Emit";
}

function toggleSpeed() {
    speedMode = speedMode === "normal" ? "fast" : "normal";
    document.getElementById("toggleSpeedBtn").textContent = `Speed: ${speedMode.charAt(0).toUpperCase() + speedMode.slice(1)
        }`;
}

function toggleTextures() {
    texturesEnabled = !texturesEnabled;
    document.getElementById("toggleTexturesBtn").textContent = texturesEnabled
        ? "Disable Textures"
        : "Enable Textures";

    torusMesh.material = texturesEnabled
        ? emissiveMaterial
        : emissiveMaterialNoTexture;
    cylinderMesh.material = texturesEnabled ? pinkMaterial : pinkMaterialNoTexture;
    octahedronMesh.material = texturesEnabled
        ? greenMaterial
        : greenMaterialNoTexture;

    torusMesh.material.needsUpdate = true;
    cylinderMesh.material.needsUpdate = true;
    octahedronMesh.material.needsUpdate = true;
}

function toggleDirection() {
    rotationDirection *= -1;
    document.getElementById("toggleDirectionBtn").textContent =
        rotationDirection === 1 ? "Direction: Forward" : "Direction: Backward";
}

function triggerSpecialEffect() {
    specialEffectActive = true;
    specialEffectTimer = 0;
    particles.material.opacity = 1;
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

function render(timestamp) {
    animateObjects(timestamp);
    renderer.render(scene, camera);
}

function animateObjects(timestamp) {
    const speed = speedMode === "normal" ? 1 : 2;
    const specialSpeed = specialEffectActive ? 3 : 1;

    if (rotationEnabled) {
        cylinderMesh.rotation.z -=
            0.01 * speed * rotationDirection * specialSpeed;
    }
    if (pulseMoveEnabled) {
        const scale = 1 + 0.2 * Math.sin(timestamp * 0.002 * speed * specialSpeed);
        cylinderMesh.scale.set(scale, scale, scale);
        cylinderMesh.position.y =
            0.5 * Math.sin(timestamp * 0.002 * speed * specialSpeed);
        cylinderMesh.material.opacity =
            0.5 + 0.2 * Math.sin(timestamp * 0.003 * speed * specialSpeed);
    }

    if (rotationEnabled) {
        torusMesh.rotation.x -= 0.01 * speed * rotationDirection * specialSpeed;
    }
    if (pulseMoveEnabled) {
        const scale = 1 + 0.1 * Math.sin(timestamp * 0.002 * speed * specialSpeed);
        torusMesh.scale.set(scale, scale, scale);
    }
    if (colorEmitEnabled) {
        hue += 0.005 * speed * specialSpeed;
        if (hue > 1) hue = 0;
        torusMesh.material.color.setHSL(hue, 1, 0.5);
    }

    if (rotationEnabled) {
        octahedronMesh.rotation.x -=
            0.01 * speed * rotationDirection * specialSpeed;
        octahedronMesh.rotation.y -=
            0.01 * speed * rotationDirection * specialSpeed;
    }
    if (pulseMoveEnabled) {
        const jump =
            Math.abs(Math.sin(timestamp * 0.005 * speed * specialSpeed)) * 0.5;
        octahedronMesh.position.y = jump;
    }
    if (colorEmitEnabled) {
        octahedronMesh.material.emissiveIntensity =
            1.5 + Math.sin(timestamp * 0.003 * speed * specialSpeed);
    }

    if (specialEffectActive) {
        specialEffectTimer += 0.1 * speed * specialSpeed;
        particles.material.opacity = Math.max(0, 1 - specialEffectTimer / 5);
        if (specialEffectTimer >= 5) {
            specialEffectActive = false;
            particles.material.opacity = 0;
        }
    }
}