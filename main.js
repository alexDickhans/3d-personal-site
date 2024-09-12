import { gosper } from "three/examples/jsm/utils/GeometryUtils.js";
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PI2 } from "three/webgpu";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({
  color: 0xffff,
});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
const pointLight = new THREE.PointLight(0xffffff, 200);
pointLight.position.set(10, 10, 10);
scene.add(pointLight, ambientLight);

const lightHelper = new THREE.PointLightHelper(pointLight);

const gridHelper = new THREE.GridHelper(200, 50).rotateZ(PI2 / 4);
scene.add(lightHelper, gridHelper);

renderer.setClearColor(0xffffff, 1);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y * 8 + 100, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

function moveCamera() {
  const top = document.body.getBoundingClientRect().top;

  camera.position.y = top * 0.1;
}

document.body.onscroll = moveCamera;

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  torus.rotation.z += 0.01;

  renderer.render(scene, camera);
}

animate();
