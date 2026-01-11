import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// === DOM Elements ===
const container = document.getElementById('canvas-container');
const focalLengthInput = document.getElementById('focalLength');
const diameterInput = document.getElementById('diameter');
const circlesInput = document.getElementById('circles');
const ribsInput = document.getElementById('ribs');

const focalLengthValue = document.getElementById('focalLengthValue');
const diameterValue = document.getElementById('diameterValue');
const circlesValue = document.getElementById('circlesValue');
const ribsValue = document.getElementById('ribsValue');

const ribLengthDisplay = document.getElementById('ribLength');
const dishDepthDisplay = document.getElementById('dishDepth');
const fdRatioDisplay = document.getElementById('fdRatio');
const circleListDisplay = document.getElementById('circleList');
const ribSegmentListDisplay = document.getElementById('ribSegmentList');

// === Three.js Setup ===
let scene, camera, renderer, controls;
let dishGroup;

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(6, 4, 6);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 30;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x303050, 0x202035);
    scene.add(gridHelper);

    // Axis helper
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    // Dish group
    dishGroup = new THREE.Group();
    scene.add(dishGroup);

    // Initial generation
    generateDish();

    // Event listeners
    focalLengthInput.addEventListener('input', onParameterChange);
    diameterInput.addEventListener('input', onParameterChange);
    circlesInput.addEventListener('input', onParameterChange);
    ribsInput.addEventListener('input', onParameterChange);

    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

function onParameterChange() {
    // Update value displays
    focalLengthValue.textContent = parseFloat(focalLengthInput.value).toFixed(1) + ' m';
    diameterValue.textContent = parseFloat(diameterInput.value).toFixed(1) + ' m';
    circlesValue.textContent = circlesInput.value;
    ribsValue.textContent = ribsInput.value;

    generateDish();
}

function getParabolicHeight(radius, focalLength) {
    // z = r² / (4f)
    return (radius * radius) / (4 * focalLength);
}

function calculateArcLength(radius, focalLength, segments = 100) {
    // Numerical integration of arc length
    // L = ∫₀ᴿ √(1 + (dz/dr)²) dr where dz/dr = r / (2f)
    let length = 0;
    const dr = radius / segments;

    for (let i = 0; i < segments; i++) {
        const r = (i + 0.5) * dr;
        const dzdr = r / (2 * focalLength);
        const ds = Math.sqrt(1 + dzdr * dzdr) * dr;
        length += ds;
    }

    return length;
}

function generateDish() {
    // Clear previous geometry
    while (dishGroup.children.length > 0) {
        const child = dishGroup.children[0];
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
        dishGroup.remove(child);
    }

    const focalLength = parseFloat(focalLengthInput.value);
    const diameter = parseFloat(diameterInput.value);
    const numCircles = parseInt(circlesInput.value);
    const numRibs = parseInt(ribsInput.value);
    const radius = diameter / 2;

    // Materials
    const circleMaterial = new THREE.LineBasicMaterial({
        color: 0x60a5fa,
        linewidth: 2
    });
    const ribMaterial = new THREE.LineBasicMaterial({
        color: 0xa78bfa,
        linewidth: 2
    });
    const focusMaterial = new THREE.MeshBasicMaterial({
        color: 0xf59e0b
    });

    // Generate concentric circles
    const circleData = [];
    for (let i = 1; i <= numCircles; i++) {
        const circleRadius = (radius / numCircles) * i;
        const height = getParabolicHeight(circleRadius, focalLength);
        const circumference = 2 * Math.PI * circleRadius;
        const arcLength = calculateArcLength(circleRadius, focalLength);

        circleData.push({
            index: i,
            radius: circleRadius,
            height: height,
            circumference: circumference,
            arcLength: arcLength
        });

        // Create circle geometry
        const circlePoints = [];
        const segments = 64;
        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            const x = circleRadius * Math.cos(angle);
            const z = circleRadius * Math.sin(angle);
            circlePoints.push(new THREE.Vector3(x, height, z));
        }

        const circleGeometry = new THREE.BufferGeometry().setFromPoints(circlePoints);
        const circle = new THREE.Line(circleGeometry, circleMaterial);
        dishGroup.add(circle);
    }

    // Generate ribs
    const ribSegments = 50;
    for (let i = 0; i < numRibs; i++) {
        const angle = (i / numRibs) * Math.PI * 2;
        const ribPoints = [];

        for (let j = 0; j <= ribSegments; j++) {
            const r = (j / ribSegments) * radius;
            const height = getParabolicHeight(r, focalLength);
            const x = r * Math.cos(angle);
            const z = r * Math.sin(angle);
            ribPoints.push(new THREE.Vector3(x, height, z));
        }

        const ribGeometry = new THREE.BufferGeometry().setFromPoints(ribPoints);
        const rib = new THREE.Line(ribGeometry, ribMaterial);
        dishGroup.add(rib);
    }

    // Focus point marker
    const focusGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const focusSphere = new THREE.Mesh(focusGeometry, focusMaterial);
    focusSphere.position.set(0, focalLength, 0);
    dishGroup.add(focusSphere);

    // Focus point line (from center to focus)
    const focusLinePoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, focalLength, 0)
    ];
    const focusLineGeometry = new THREE.BufferGeometry().setFromPoints(focusLinePoints);
    const focusLineMaterial = new THREE.LineDashedMaterial({
        color: 0xf59e0b,
        dashSize: 0.1,
        gapSize: 0.05
    });
    const focusLine = new THREE.Line(focusLineGeometry, focusLineMaterial);
    focusLine.computeLineDistances();
    dishGroup.add(focusLine);

    // Update measurements display
    const arcLength = calculateArcLength(radius, focalLength);
    const dishDepth = getParabolicHeight(radius, focalLength);
    const fdRatio = focalLength / diameter;

    ribLengthDisplay.textContent = arcLength.toFixed(3) + ' m';
    dishDepthDisplay.textContent = dishDepth.toFixed(3) + ' m';
    fdRatioDisplay.textContent = fdRatio.toFixed(3);

    // Update circle circumferences list
    circleListDisplay.innerHTML = circleData.map((c, idx) => `
        <div class="circle-item">
            <span class="circle-label">Circle ${c.index} (r=${c.radius.toFixed(2)}m):</span>
            <span class="circle-value">${c.circumference.toFixed(3)} m</span>
        </div>
    `).join('');

    // Update rib segment lengths list (arc length from center to each circle)
    ribSegmentListDisplay.innerHTML = circleData.map((c, idx) => `
        <div class="circle-item">
            <span class="circle-label">Center → Circle ${c.index}:</span>
            <span class="circle-value">${c.arcLength.toFixed(3)} m</span>
        </div>
    `).join('');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize on load
init();
