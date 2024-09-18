import "./style.css";

import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";

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

const OU_OFFSET = -240;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

var robotMesh;

// Instantiate a loader
const glbLoader = new GLTFLoader();

// Load a glTF resource
glbLoader.load(
  // resource URL
  "high-stakes.glb",
  // called when the resource is loaded
  function (gltf) {
    gltf.animations; // Array<THREE.AnimationClip>
    gltf.scene; // THREE.Group
    gltf.scenes; // Array<THREE.Group>
    gltf.cameras; // Array<THREE.Camera>
    gltf.asset; // Object
    robotMesh = gltf.scene;
    robotMesh.scale.setScalar(0.5);
    robotMesh.rotateX(-Math.PI / 2);
    robotMesh.position.set(18, -800, -10);

    scene.add(robotMesh);
  },
);

const mtlLoader = new MTLLoader();

var mutcapSilicone = undefined;

mtlLoader.load("tactile/mutcap-silicone.mtl", function (materials) {
  // materials.preload();
  var objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("tactile/mutcap-silicone.obj", function (object) {
    mutcapSilicone = object;
    mutcapSilicone.scale.setScalar(2);
    mutcapSilicone.rotateY(0.5);
    mutcapSilicone.position.set(-22, -370, -10);
    scene.add(mutcapSilicone);
  });
});

var mutcap3d = undefined;

mtlLoader.load("tactile/mutcap-3d.mtl", function (materials) {
  // materials.preload();
  var objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("tactile/mutcap-3d.obj", function (object) {
    mutcap3d = object;
    mutcap3d.rotateX(Math.PI / 2);
    mutcap3d.scale.setScalar(2);
    mutcap3d.position.set(20, -410, -10);
    scene.add(mutcap3d);
  });
});

var mutcapPcb = undefined;

mtlLoader.load("tactile/mutcap-pcb.mtl", function (materials) {
  // materials.preload();
  var objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("tactile/mutcap-pcb.obj", function (object) {
    mutcapPcb = object;
    mutcapPcb.rotateY(Math.PI * 1);
    mutcapPcb.rotateX(Math.PI / 2);
    mutcapPcb.scale.setScalar(2.5);
    mutcapPcb.position.set(-28, -450, 5);
    scene.add(mutcapPcb);
  });
});

var spoolHolder = undefined;

mtlLoader.load("spool-holder.mtl", function (materials) {
  // materials.preload();
  var objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("spool-holder.obj", function (object) {
    spoolHolder = object;
    spoolHolder.rotateY(Math.PI * 1);
    spoolHolder.scale.setScalar(0.6);
    spoolHolder.position.set(-20, -600, 5);
    scene.add(spoolHolder);
  });
});

camera.position.y = -10;

const material = new THREE.MeshStandardMaterial({
  color: 0xdddddd,
  // wireframe: true,
  metalness: 0.9,
  roughness: 0.5,
});

const light = new THREE.HemisphereLight(0xffffff, 0x080820, 5);
scene.add(light);

renderer.setClearColor(0xfdfdfd, 1);

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

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, true);

  if (window.innerWidth / window.innerHeight < 1.0) {
    camera.position.setZ(130);
    cylinder1.position.setZ(60);
    cylinder2.position.setZ(60);
  } else {
    camera.position.setZ(80);
    cylinder1.position.setZ(10);
    cylinder2.position.setZ(10);
  }

  console.log("resize");
}

resize();

// Robot path following

const curve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-40, OU_OFFSET, 0),
  new THREE.Vector3(-20, OU_OFFSET, 0),
  new THREE.Vector3(-20, OU_OFFSET, -35),
  new THREE.Vector3(0, OU_OFFSET, -35),
);

const points = curve.getPoints(50);
const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xff0000,
  linewidth: 1,
});

// Create the final object to add to the scene
const gridHelper = new THREE.GridHelper(10, 10);
gridHelper.position.setY(OU_OFFSET - 2);
gridHelper.scale.setScalar(10);
scene.add(gridHelper);
const curveObject = new THREE.Line(lineGeometry, lineMaterial);
scene.add(curveObject);

var over_under = undefined;
// Load a glTF resource
glbLoader.load(
  // resource URL
  "over-under.glb",
  // called when the resource is loaded
  function (gltf) {
    gltf.animations; // Array<THREE.AnimationClip>
    gltf.scene; // THREE.Group
    gltf.scenes; // Array<THREE.Group>
    gltf.cameras; // Array<THREE.Camera>
    gltf.asset; // Object
    over_under = gltf.scene;
    over_under.scale.setScalar(0.5);
    over_under.rotateX(-Math.PI / 2);
    over_under.position.set(18, -25, -10);

    scene.add(over_under);
  },
);

var planeGeometry = new THREE.PlaneGeometry(32, 18, 1, 1);
var texture = new THREE.TextureLoader().load("al-planner.png");
var planeMaterial = new THREE.MeshBasicMaterial({
  map: texture,
});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);

plane.position.set(30, -80, -20);
plane.rotateY(-0.5);

scene.add(plane);

function loadImage() {
  var planeGeometry = new THREE.PlaneGeometry(30, 20.45, 1, 1);
  var texture = new THREE.TextureLoader().load("command-based.png");
  var planeMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xeeeeee,
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.scale.setScalar(1.5);

  plane.position.set(30, -665, -20);
  plane.rotateY(-0.5);

  scene.add(plane);
}

loadImage();

var telemetry_radio = undefined;
mtlLoader.load("pico-debugger.mtl", function (materials) {
  // materials.preload();
  var objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("pico-debugger.obj", function (object) {
    telemetry_radio = object;
    telemetry_radio.scale.setScalar(5);
    telemetry_radio.position.set(-50, OU_OFFSET + 50, -40);
    telemetry_radio.rotation.z = Math.PI / 2;
    scene.add(telemetry_radio);
  });
});

const viewer = new GaussianSplats3D.DropInViewer({
  gpuAcceleratedSort: false,
});
viewer.addSplatScenes([
  {
    path: "/gaussian_splats/alex.ksplat",
    splatAlphaRemovalThreshold: 5,
  },
  {
    path: "/gaussian_splats/alex.ksplat",
    rotation: [1, 0, 0, 0],
    scale: [80, 80, 80],
    position: [0, 0, 0],
  },
]);

viewer.position.set(20, -5, -10);

scene.add(viewer);

// Idea for the Liftoff board use 2d planes and animate the opacity to show the layers

var pcb_bcu = undefined;
var pcb_bss = undefined;
var pcb_fcu = undefined;
var pcb_fss = undefined;

function loadSvg() {
  var planeGeometry = new THREE.PlaneGeometry(30, 28.3516483515, 1, 1);
  var texture1 = new THREE.TextureLoader().load("pcbs/liftoff-bss.png");

  pcb_bss = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshBasicMaterial({
      map: texture1,
      color: 0xeeeeee,
      transparent: true,
    }),
  );

  pcb_bss.scale.setScalar(1.0);

  pcb_bss.position.set(-30, -665, -20);
  pcb_bss.rotateZ(Math.PI / 2);
  pcb_bss.rotateX(0.5);

  var texture2 = new THREE.TextureLoader().load("pcbs/liftoff-bcu.png");
  pcb_bcu = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshBasicMaterial({
      map: texture2,
      color: 0xeeeeee,
      transparent: true,
    }),
  );

  pcb_bcu.scale.setScalar(1.0);

  pcb_bcu.position.set(-30, -665, -19.5);
  pcb_bcu.rotateZ(Math.PI / 2);
  pcb_bcu.rotateX(0.5);

  pcb_fcu = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("pcbs/liftoff-fcu.png"),
      color: 0xeeeeee,
      transparent: true,
    }),
  );

  pcb_fcu.scale.setScalar(1.0);

  pcb_fcu.position.set(-30, -665, -19);
  pcb_fcu.rotateZ(Math.PI / 2);
  pcb_fcu.rotateX(0.5);

  pcb_fss = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("pcbs/liftoff-fss.png"),
      color: 0xeeeeee,
      transparent: true,
    }),
  );

  pcb_fss.scale.setScalar(1.0);

  pcb_fss.position.set(-30, -665, -18.5);
  pcb_fss.rotateZ(Math.PI / 2);
  pcb_fss.rotateX(0.5);

  scene.add(pcb_bcu, pcb_bss, pcb_fcu, pcb_fss);
}

loadSvg();

document.body.onscroll = moveCamera;

document.body.onresize = resize;

function moveCamera() {
  const top = document.body.getBoundingClientRect().top;

  camera.position.y = top * 0.17 - 10;
  camera.rotation.x = Math.max(top * 0.003, -Math.PI / 4);

  const divisor = -600;

  const start = 2500;

  const diff = 30;

  if (telemetry_radio != undefined) {
    telemetry_radio.rotation.y = top * 0.01;
  }

  const opacity1 = Math.min((top + start) / divisor, 1);

  if (pcb_bss != undefined) {
    pcb_bss.position.setX((1 - opacity1) * -200 - 30);
  }

  const opacity2 = Math.min((top + start + diff) / divisor, 1);

  if (pcb_bcu != undefined) {
    pcb_bcu.position.setX((1 - opacity2) * -200 - 30);
  }

  const opacity3 = Math.min((top + start + 2 * diff) / divisor, 1);

  if (pcb_fcu != undefined) {
    pcb_fcu.position.setX((1 - opacity3) * -200 - 30);
  }

  const opacity4 = Math.min((top + start + 3 * diff) / divisor, 1);

  if (pcb_fss != undefined) {
    pcb_fss.position.setX((1 - opacity4) * -200 - 30);
  }

  console.log(opacity1);
}

moveCamera();

function animate() {
  requestAnimationFrame(animate);
  if (robotMesh != undefined) {
    robotMesh.rotation.z += 0.01;
  }

  viewer.rotation.y = Math.cos(Date.now() / 3200) / 1.8;

  cylinder1.position.y = Math.cos(Date.now() / 400) * 0.75 - 21;
  cylinder2.position.y = Math.cos(Date.now() / 400) * 0.75 - 21;

  const t = 1 - (Math.cos(((Date.now() / 3000.0) % 2.0) * Math.PI) + 1) / 2;

  const position = curve.getPoint(t);
  const tangent = curve.getTangent(t);

  if (over_under != undefined) {
    over_under.position.set(position.x, position.y, position.z + 1);
    over_under.rotation.z = Math.atan2(tangent.x, tangent.z);
  }

  if (mutcap3d != undefined) {
    mutcap3d.rotation.z = Date.now() / 3000.0;
    mutcap3d.position.y = -440 + Math.sin(Date.now() / 1000.0) * 5;
  }

  if (spoolHolder != undefined) {
    spoolHolder.rotation.y = Date.now() / 3000.0;
  }

  if (pcb_fss != undefined) {
  }

  renderer.render(scene, camera);
}

animate();
