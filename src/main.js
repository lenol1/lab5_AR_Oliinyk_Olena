const dropdown = document.getElementById('scriptDropdown');
let currentScriptElement = null;

const params = new URLSearchParams(window.location.search);
const task = params.get('task');

if (task) {
  dropdown.value = task;
  loadUI(task);

  const script = document.createElement('script');
  script.type = 'module';
  script.src = `./src/${task}.js`;
  document.body.appendChild(script);
  currentScriptElement = script;
}

dropdown.addEventListener('change', () => {
  const selected = dropdown.value;
  if (selected) {
    window.location.href = `?task=${selected}`;
  }
});

dropdown.addEventListener('change', () => {
  const selected = dropdown.value;
  const controls = document.getElementById('controls');

  controls.innerHTML = '';

  if (currentScriptElement) {
    currentScriptElement.remove();
    currentScriptElement = null;
  }

  if (selected) {
    loadUI(selected);

    const script = document.createElement('script');
    script.type = 'module';
    script.src = `./src/${selected}.js`;
    document.body.appendChild(script);
    currentScriptElement = script;
  }
});

function loadUI(task) {
  const controls = document.getElementById('controls');

  if (task === 'task1') {
    controls.innerHTML = `
      <button id="toggleRotationBtn">Disable Rotation</button>
      <button id="togglePulseBtn">Disable Pulse/Move</button>
      <button id="toggleColorBtn">Disable Color/Emit</button>
      <button id="toggleSpeedBtn">Speed: Normal</button>
      <button id="toggleTexturesBtn">Disable Textures</button>
      <button id="toggleDirectionBtn">Direction: Forward</button>
      <button id="specialEffectBtn">Special Effect</button>
    `;
  } else if (task === 'task2') {
    controls.innerHTML = `
      <div class="controls-left">
        <label><input type="checkbox" id="rotationToggle"> Enable Rotation</label>
        <label for="axisSelect">Axis:</label>
        <select id="axisSelect">
          <option value="x">X</option>
          <option value="y">Y</option>
          <option value="z">Z</option>
        </select>
        <label for="materialToggle"><input type="checkbox" id="materialToggle" /> Material:</label>
      </div>
      <div class="controls-right">
        <label><input type="checkbox" id="sceneLightToggle"> Scene Light</label>
        <label><input type="checkbox" id="modelLightToggle"> Model Light</label>
        <label for="lightTypeSelect">Model Light Type:</label>
        <select id="lightTypeSelect">
          <option value="point">Point</option>
          <option value="spot">Spot</option>
          <option value="directional">Directional</option>
        </select>
        <label for="lightIntensity">Intensity:</label>
        <input type="range" id="lightIntensity" min="0" max="5" step="0.1" value="1" />
        <label for="lightColor">Light Color:</label>
        <input type="color" id="lightColor" value="#ffffff" />
      </div>
    `;
  } else if (task === 'task3') {
    controls.innerHTML = `
      <div class="controls-task3">
        <label for="torusColor">Change Torus Color:</label>
        <input type="color" id="torusColor" value="#ff0000">
        <label><input type="checkbox" id="torusRotationToggle"> Enable Rotation</label>
        <label for="torusSize">Change torus Size:</label>
        <input type="range" id="torusSize" min="0.1" max="2" step="0.1" value="1">
        <label><input type="checkbox" id="scaleAnimationToggle"> Toggle Scale Animation</label>
        <label for="materialSelect">Material:</label>
        <select id="materialSelect">
          <option value="standard">Standard</option>
          <option value="emissive">Emissive</option>
          <option value="transparent">Transparent</option>
        </select>
      </div>
    `;
  } else if (task === 'task4') {
    controls.innerHTML = `
      <div class="controls-task4">
        <label for="materialType">Material:</label>
        <select id="materialType">
          <option value="realistic">Realistic</option>
          <option value="gold">Gold</option>
          <option value="glass">Glass</option>
          <option value="chrome">Chrome</option>
          <option value="glow">Glow</option>
        </select>
        <label><input type="checkbox" id="dirLightToggle"> Directional Light</label>
        <label for="lightIntensityControl">Light Intensity:</label>
        <input type="range" id="lightIntensityControl" min="0" max="5" step="0.1" value="1">
        <label for="lightColorControl">Light Color:</label>
        <input type="color" id="lightColorControl" value="#ffffff">
        <label><input type="checkbox" id="jumpToggle"> Jump</label>
        <label><input type="checkbox" id="rotationToggleModel"> Rotation</label>
      </div>
    `;
  }
}
function clearScene(scene) {
  scene.traverse((object) => {
    if (object.isMesh) {
      object.geometry.dispose();
      if (object.material.map) object.material.map.dispose();
      object.material.dispose();
      scene.remove(object);
    }
  });
}
