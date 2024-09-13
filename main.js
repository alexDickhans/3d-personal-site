import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { mx_bilerp_1 } from "three/src/nodes/materialx/lib/mx_noise.js";
import { PI, RGBA_ASTC_5x4_Format, Vector3 } from "three/webgpu";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

function move_bar(pct) {
  document.getElementsByClassName("bar-inside")[0].style.width = pct + "%";
}

THREE.DefaultLoadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
  console.log(
    "Started loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files.",
  );

  move_bar((itemsLoaded * 100) / itemsTotal);
};

THREE.DefaultLoadingManager.onLoad = function () {
  console.log("Loading Complete!");
  document.querySelector(".loading").className = "hidden";
  document.getElementById("content").style.visibility = "visible";
};

THREE.DefaultLoadingManager.onProgress = function (
  url,
  itemsLoaded,
  itemsTotal,
) {
  console.log(
    "Loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files.",
  );

  move_bar((itemsLoaded * 100) / itemsTotal);
};

THREE.DefaultLoadingManager.onError = function (url) {
  console.log("There was an error loading " + url);
};

const OU_OFFSET = -220;

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

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, true);

  console.log("resize");
}

resize();

var robotMesh;

const mtlLoader = new MTLLoader();

mtlLoader.load("high-stakes.mtl", function (materials) {
  // materials.preload();
  var objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("high-stakes.obj", function (object) {
    robotMesh = object;
    robotMesh.scale.setScalar(0.5);
    robotMesh.rotateX(-Math.PI / 2);
    robotMesh.position.set(15, -25, -10);
    robotMesh.castShadow = true;
    robotMesh.receiveShadow = true;
    scene.add(robotMesh);
    scene.add(over_under);
  });
});

camera.position.setZ(30);
camera.position.y = -10;

const material = new THREE.MeshStandardMaterial({
  color: 0xdddddd,
  // wireframe: true,
  metalness: 0.9,
  roughness: 0.5,
});

// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
const pointLight1 = new THREE.PointLight(0xffffff, 500);
const pointLight2 = new THREE.PointLight(0xffffff, 300);
const pointLight3 = new THREE.PointLight(0xffffff, 300);
const pointLight4 = new THREE.PointLight(0xffffff, 300);
const pointLight5 = new THREE.PointLight(0xffffff, 500);
const pointLight6 = new THREE.PointLight(0xffffff, 500);
const pointLight7 = new THREE.PointLight(0xffffff, 500);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);

pointLight1.position.set(10, -10, 10);
pointLight2.position.set(-10, -15, 10);
pointLight3.position.set(-25, 0, -15);
pointLight4.position.set(-30, -35, -30);
pointLight5.position.set(-20, OU_OFFSET + 20, 15);
pointLight6.position.set(20, OU_OFFSET + 20, -20);
pointLight7.position.set(20, OU_OFFSET + 20, 20);
scene.add(
  pointLight1,
  pointLight2,
  pointLight3,
  pointLight4,
  pointLight5,
  pointLight6,
  pointLight7,
  directionalLight,
);

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

  camera.position.y = top * 0.00036 * window.innerHeight - 10;
  camera.rotation.x = Math.max(
    top * 0.0000018 * window.innerHeight,
    -Math.PI / 4,
  );
}

moveCamera();

// Robot path following

const curve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-20, OU_OFFSET, 0),
  new THREE.Vector3(0, OU_OFFSET, 0),
  new THREE.Vector3(0, OU_OFFSET, -35),
  new THREE.Vector3(20, OU_OFFSET, -35),
);

const points = curve.getPoints(50);
const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xff0000,
  linewidth: 10,
});

// Create the final object to add to the scene
const gridHelper = new THREE.GridHelper(10, 10);
gridHelper.position.setY(OU_OFFSET - 2);
gridHelper.scale.setScalar(10);
scene.add(gridHelper);
const curveObject = new THREE.Line(lineGeometry, lineMaterial);
scene.add(curveObject);

var over_under = undefined;
mtlLoader.load("over-under.mtl", function (materials) {
  // materials.preload();
  var objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("over-under.obj", function (object) {
    over_under = object;
    over_under.scale.setScalar(0.4);
    over_under.position.set(0, OU_OFFSET, -10);
    over_under.rotateX(-Math.PI / 2);
    scene.add(over_under);
  });
});

document.body.onscroll = moveCamera;

document.body.onresize = resize;

function animate() {
  requestAnimationFrame(animate);
  if (robotMesh != undefined) {
    robotMesh.rotation.z += 0.01;
  }

  cylinder1.position.y = Math.cos(Date.now() / 400) * 0.75 - 21;
  cylinder2.position.y = Math.cos(Date.now() / 400) * 0.75 - 21;

  const t = 1 - (Math.cos(((Date.now() / 3000.0) % 2.0) * Math.PI) + 1) / 2;

  const position = curve.getPoint(t);
  const tangent = curve.getTangent(t);

  if (over_under != undefined) {
    over_under.position.set(position.x, position.y, position.z + 1);
    over_under.rotation.z = Math.atan2(tangent.x, tangent.z);
  }

  renderer.render(scene, camera);
}

animate();
