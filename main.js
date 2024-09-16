import "./style.css";

import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

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

  if (window.innerWidth / window.innerHeight < 1.0) {
    camera.position.setZ(80);
  } else {
    camera.position.setZ(30);
  }

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
    robotMesh.position.set(18, -25, -10);
    robotMesh.castShadow = true;
    robotMesh.receiveShadow = true;
    scene.add(robotMesh);
  });
});

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
    mutcapPcb.position.set(-28, -430, 5);
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
    spoolHolder.position.set(-20, -580, 5);
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

  plane.position.set(30, -630, -20);
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

// Idea for the Liftoff board use 2d planes and animate the opacity to show the layers

function loadSvg() {
  const svgLoader = new SVGLoader();

  // load a SVG resource
  svgLoader.load(
    // resource URL
    "liftoff/liftoff-fcu.svg",
    // called when the resource is loaded
    function (data) {
      const paths = data.paths;
      const group = new THREE.Group();

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];

        const material = new THREE.MeshBasicMaterial({
          color: path.color,
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        const shapes = SVGLoader.createShapes(path);

        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j];
          const geometry = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
        }
      }
      group.scale.setScalar(0.1);
      group.position.set(-5, -100, 10);

      scene.add(group);
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    },
  );
}

// loadSvg();

document.body.onscroll = moveCamera;

document.body.onresize = resize;

function moveCamera() {
  const top = document.body.getBoundingClientRect().top;

  camera.position.y = top * 0.18 - 10;
  camera.rotation.x = Math.max(top * 0.003, -Math.PI / 4);

  if (telemetry_radio != undefined) {
    telemetry_radio.rotation.y = top * 0.01;
  }
}

moveCamera();

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

  if (mutcap3d != undefined) {
    mutcap3d.rotation.z = Date.now() / 3000.0;
    mutcap3d.position.y = -425 + Math.sin(Date.now() / 1000.0) * 5;
  }

  if (spoolHolder != undefined) {
    spoolHolder.rotation.y = Date.now() / 3000.0;
  }

  renderer.render(scene, camera);
}

animate();
