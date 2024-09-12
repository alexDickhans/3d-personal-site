import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { mx_bilerp_1 } from "three/src/nodes/materialx/lib/mx_noise.js";
import { PI, RGBA_ASTC_5x4_Format, Vector3 } from "three/webgpu";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, true);

  console.log("resize");
}

var robotMesh;

const loader = new STLLoader();
loader.load(
  "robot.stl",
  function (geometry) {
    robotMesh = new THREE.Mesh(geometry, material);
    robotMesh.scale.setScalar(0.05);
    robotMesh.rotateX(-Math.PI / 2);
    robotMesh.position.set(15, -25, -10);
    scene.add(robotMesh);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  },
);

camera.position.setZ(30);
camera.position.y = -10;

const material = new THREE.MeshStandardMaterial({
  color: 0xdddddd,
  // wireframe: true,
  metalness: 0.9,
  roughness: 0.5,
});

// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
const pointLight1 = new THREE.PointLight(0xffffff, 300);
const pointLight2 = new THREE.PointLight(0xffffff, 300);
const pointLight3 = new THREE.PointLight(0xffffff, 300);
const pointLight4 = new THREE.PointLight(0xffffff, 300);
pointLight1.position.set(10, 5, 10);
pointLight2.position.set(-10, 5, 10);
pointLight3.position.set(-10, 5, -10);
pointLight4.position.set(-30, -35, -30);
scene.add(pointLight1, pointLight2, pointLight3, pointLight4);

const lightHelper = new THREE.PointLightHelper(pointLight3);

scene.add(lightHelper);

// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);

renderer.setClearColor(0xffffff, 1);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y * 20 - 900, z);
  scene.add(star);
}

Array(400).fill().forEach(addStar);

const cylinder = new THREE.CylinderGeometry(0.25, 0.25, 3);
const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const cylinder1 = new THREE.Mesh(cylinder, cylinderMaterial);
const cylinder2 = new THREE.Mesh(cylinder, cylinderMaterial);

cylinder1.rotation.z = Math.PI / 5;
cylinder1.position.set(-0.9, -15, 10);
cylinder2.rotation.z = -Math.PI / 5;
cylinder2.position.set(0.9, -15, 10);

scene.add(cylinder1, cylinder2);

function moveCamera() {
  const top = document.body.getBoundingClientRect().top;

  camera.position.y = top * 0.0005 * window.innerHeight - 10;
}

document.body.onscroll = moveCamera;

document.body.onresize = resize;

function animate() {
  requestAnimationFrame(animate);

  robotMesh.rotation.z += 0.01;

  cylinder1.position.y = Math.sin(Date.now() / 400) * 0.75 - 21;
  cylinder2.position.y = Math.sin(Date.now() / 400) * 0.75 - 21;

  renderer.render(scene, camera);
}

animate();
