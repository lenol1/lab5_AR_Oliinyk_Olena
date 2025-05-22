import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

// Глобальні змінні
let scene, camera, renderer, clock;
let model, mixer;
let modelLight;
let rotate = false, axis = 'y';
let modelLightEnabled = false;
let modelLightType = 'point';
let modelLightIntensity = 1;
let modelLightColor = '#ffffff';
let defaultMaterial, altMaterial;
let sceneLight;

// Ініціалізація сцени
init();
setupUI();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 20);

    sceneLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(sceneLight);

    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);
    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

    // Завантаження моделі
    const loader = new GLTFLoader();
    loader.load(
        'https://universitylpnubucket.s3.eu-north-1.amazonaws.com/scene.gltf',
        (gltf) => {
            model = gltf.scene;
            model.scale.set(1, 1, 1);
            model.position.set(0, -0.3, -1);
            scene.add(model);

            model.traverse((child) => {
                if (child.isMesh) {
                    defaultMaterial = child.material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            altMaterial = new THREE.MeshStandardMaterial({
                color: 0xffd700, 
                metalness: 1,
                roughness: 0.3,
                transparent: true,
                opacity: 0.4
            });

            if (gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
            }

            updateModelLight();
        }
    );

    window.addEventListener('resize', onWindowResize);
}

function animate() {
    renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);

        if (model && rotate) {
            model.rotation[axis] += 0.01;
        }

        if (model && modelLight) {
            const position = new THREE.Vector3();
            model.getWorldPosition(position);
            modelLight.position.copy(position).add(new THREE.Vector3(0, 1, 2));
            modelLight.lookAt(position);
        }

        renderer.render(scene, camera);
    });
}

function setupUI() {
    document.getElementById('rotationToggle').addEventListener('change', e => {
        rotate = e.target.checked;
    });

    document.getElementById('axisSelect').addEventListener('change', e => {
        axis = e.target.value;
    });

    document.getElementById('materialToggle').addEventListener('change', e => {
        if (model) {
            model.traverse(child => {
                if (child.isMesh) {
                    child.material = e.target.checked ? altMaterial : defaultMaterial.clone();
                }
            });
        }
    });

    document.getElementById('sceneLightToggle').addEventListener('change', e => {
        sceneLight.visible = e.target.checked;
    });

    document.getElementById('modelLightToggle').addEventListener('change', e => {
        modelLightEnabled = e.target.checked;
        updateModelLight();
    });

    document.getElementById('lightTypeSelect').addEventListener('change', e => {
        modelLightType = e.target.value;
        updateModelLight();
    });

    document.getElementById('lightIntensity').addEventListener('input', e => {
        modelLightIntensity = parseFloat(e.target.value);
        if (modelLight) modelLight.intensity = modelLightIntensity;
    });

    document.getElementById('lightColor').addEventListener('input', e => {
        modelLightColor = e.target.value;
        if (modelLight) modelLight.color.set(modelLightColor);
    });
}

function updateModelLight() {
    if (!model) return;

    if (modelLight) {
        scene.remove(modelLight);
        modelLight = null;
    }

    if (!modelLightEnabled) return;

    const modelPos = new THREE.Vector3();
    model.getWorldPosition(modelPos);

    switch (modelLightType) {
        case 'point':
            modelLight = new THREE.PointLight(modelLightColor, modelLightIntensity, 10, 2.5); 
            break;

        case 'spot':
            modelLight = new THREE.SpotLight(modelLightColor, modelLightIntensity, 10, Math.PI / 2, 0.5);
            modelLight.target.position.copy(modelPos);
            scene.add(modelLight.target);
            break;

        case 'directional':
            modelLight = new THREE.DirectionalLight(modelLightColor, modelLightIntensity);
            modelLight.target.position.copy(modelPos);
            scene.add(modelLight.target);
            break;
    }

    modelLight.castShadow = true;
    modelLight.shadow.bias = -0.0001;
    modelLight.lookAt(modelPos);
    scene.add(modelLight);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}