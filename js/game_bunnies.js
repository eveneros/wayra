console.clear();
let scene, camera, controls;
let renderer;

let width = window.innerWidth;
let height = window.innerHeight;
let fov = 75;
let aspectRatio = width / height;
let near = 0.001;
let far = 100;
let mainGroup = new THREE.Group();
let colors = {
  blue: 0x71b6f7,
  brown: 0x744436,
  brown2: 0xC88247,
  red: 0xFDB731,
  green: 0xa4d740,
  green2: 0x66b888,
  green3: 0x2C9D3E,
  house: 0xfce3ad,
  purple: 0x6e5370,
  gold: 0xFFF09C,
  grey: 0xB7B398,
  greyBrown: 0xB7B398 };


const setup = () => {
  // scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xd5f8f8, 0.14);
  // camera
  camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
  scene.add(camera);
  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  renderer.setClearColor(0xd5f8f8);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMapSoft = true;
  
  
  document.getElementById('canvas').appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  camera.position.set(4.56, 2.5, 1.4);
  
  // controls
  
  
  
  
  // lights 
  let light = new THREE.HemisphereLight(0xffffff, 0x5c9cfe, 1.1);
  scene.add(light);
  //
  let spot = new THREE.SpotLight(0xF6FAFD, 0.06);
  spot.castShadow = true;
  spot.shadow.camera.left = -1;
  spot.shadow.camera.right = -1;
  spot.shadow.camera.top = -1;
  spot.shadow.camera.bottom = -1;
  spot.shadow.camera.near = 1;
  spot.shadow.camera.far = 100;
  spot.shadow.mapSize.width = 2048;
  spot.shadow.mapSize.height = 2048;
  spot.shadow.camera.fov = 100;
  spot.position.set(-3, 3, 0);
  camera.add(spot);
  // group for all other groups
  mainGroup = new THREE.Group();
  scene.add(mainGroup);
  camera.lookAt(0, 0, 0);
};

// objects
let islandGroup = new THREE.Group();
const createIsland = () => {
  // earth
  let coneGeo = new THREE.ConeBufferGeometry(2, 3, 8);
  let mat = new THREE.MeshLambertMaterial({
    color: colors.brown });

  let cone = new THREE.Mesh(coneGeo, mat);
  cone.rotation.x = THREE.Math.degToRad(180);
  cone.position.set(0, -1.75, 0);
  //islandGroup.add(cone);
  // grass
  let boxGeo = new THREE.BoxBufferGeometry();
  let mat2 = new THREE.MeshLambertMaterial({
    color: colors.green });

  let grass = new THREE.Mesh(boxGeo, mat2);
  grass.scale.set(4, 0.5, 4);
  grass.receiveShadow = true;
  islandGroup.add(grass);
  // water
  let mat3 = new THREE.MeshLambertMaterial({
    color: colors.blue });

  let water = new THREE.Mesh(boxGeo, mat3);
  water.receiveShadow = true;
  islandGroup.add(water);
  water.scale.set(0.5, 0.5, 4);
  water.position.set(0.75, 0.005, 0.005);
  mainGroup.add(islandGroup);
};

// waterfall particles
let dropCount = 100;
let drops = [];
// water details
let detailCount = 24;
let dets = [];
let detailCount2 = 8;
let dets2 = [];

// creating particles function
let particleGeo, particleMat, particle;
const createParticles = (color, particleAmount, particleArray, scaleX, scaleY, scaleZ, posX, posX2, posY, posY2, posZ, posZ2, opacity, rotX, rotY, rotZ) => {
  particleGeo = new THREE.BoxBufferGeometry();
  particleMat = new THREE.MeshLambertMaterial({
    color: color,
    transparent: true });

  for (let i = 0; i < particleAmount; i++) {
    particle = new THREE.Mesh(particleGeo, particleMat);
    islandGroup.add(particle);
    particleArray.push(particle);
    particle.scale.set(scaleX, scaleY, scaleZ);
    particle.position.set(THREE.Math.randFloat(posX, posX2), THREE.Math.randFloat(posY, posY2), THREE.Math.randFloat(posZ, posZ2));
    particle.material.opacity = opacity;
    particle.rotation.set(rotX, THREE.Math.degToRad(rotY), rotZ);
  }
};

// function to create various box like shapes of the house and the mailbox
const createBoxShape = (x, y, z, xPos, yPos, zPos, color, rShadow, cShadow, group) => {
  let geo = new THREE.BoxBufferGeometry(x, y, z);
  let mat = new THREE.MeshLambertMaterial({ color: color });
  let mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(xPos, yPos, zPos);
  mesh.receiveShadow = rShadow;
  mesh.castShadow = cShadow;
  group.add(mesh);
};

let treeGroup = new THREE.Group();
const createTree = (trunkX, trunkY, trunkZ, leavesX, leavesY, leavesZ) => {
  // trunk
  let geo = new THREE.CylinderBufferGeometry(0.1, 0.1, 0.5, 5);
  let mat = new THREE.MeshLambertMaterial({
    color: colors.brown });

  let trunk = new THREE.Mesh(geo, mat);
  treeGroup.add(trunk);
  trunk.position.set(trunkX, trunkY, trunkZ);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  // leaves
  let geo2 = new THREE.SphereBufferGeometry(0.25, 6, 12);
  let mat2 = new THREE.MeshLambertMaterial({
    color: colors.green2 });

  let treeLeaves = new THREE.Mesh(geo2, mat2);
  treeLeaves.position.set(leavesX, leavesY, leavesZ);
  treeLeaves.castShadow = true;
  treeLeaves.receiveShadow = true;
  treeGroup.add(treeLeaves);
  mainGroup.add(treeGroup);
};
//monedas cambiadas a zanahorias
// Materials
var blackMat = new THREE.MeshPhongMaterial({
  color: 0x100707,
  shading:THREE.FlatShading,
});

var brownMat = new THREE.MeshPhongMaterial({
  color: 0xb44b39,
  shininess:0,
  shading:THREE.FlatShading,
});

var greenMat = new THREE.MeshPhongMaterial({
  color: 0x7abf8e,
  shininess:0,
  shading:THREE.FlatShading,
});

var pinkMat = new THREE.MeshPhongMaterial({
  color: 0xdc5f45,//0xb43b29,//0xff5b49,
  shininess:0,
  shading:THREE.FlatShading,
});

var lightBrownMat = new THREE.MeshPhongMaterial({
  color: 0xCC8E52,
  shading:THREE.FlatShading,
});

var whiteMat = new THREE.MeshPhongMaterial({
  color: 0xa49789, 
  shading:THREE.FlatShading,
});
var skinMat = new THREE.MeshPhongMaterial({
  color: 0xff9ea5,
  shading:THREE.FlatShading
});

const createBush = (x, y, z) => {
  

  this.angle = 0;
  this.mesh = new THREE.Group();
  
  var bodyGeom = new THREE.CylinderGeometry(5,3, 10, 4,1);
  bodyGeom.vertices[8].y+=2;
  bodyGeom.vertices[9].y-=3;
  
  this.body = new THREE.Mesh(bodyGeom, pinkMat);
  
  var leafGeom = new THREE.CubeGeometry(5,10,1,1);
  leafGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,5,0));
  leafGeom.vertices[2].x-=1;
  leafGeom.vertices[3].x-=1;
  leafGeom.vertices[6].x+=1;
  leafGeom.vertices[7].x+=1;
  
  this.leaf1 = new THREE.Mesh(leafGeom,greenMat);
  this.leaf1.position.y = 7;
  this.leaf1.rotation.z = .3;
  this.leaf1.rotation.x = .2;
  
  this.leaf2 = this.leaf1.clone();
  this.leaf2.scale.set(1,1.3,1);
  this.leaf2.position.y = 7;
  this.leaf2.rotation.z = -.3;
  this.leaf2.rotation.x = -.2;
  
  this.mesh.add(this.body);
  this.mesh.add(this.leaf1);
  this.mesh.add(this.leaf2);

  this.body.traverse(function(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  this.mesh.position.set(x, y, z);
  this.mesh.scale.set(0.025, 0.025, 0.025);
  treeGroup.add(this.mesh);
};

// house
let houseGroup = new THREE.Group();

// roof window function
const createRoofWindow = (x, y, z, color, radB, radT, height, segments) => {
  let geo = new THREE.CylinderBufferGeometry(radB, radT, height, segments);
  let mat = new THREE.MeshLambertMaterial({ color: color });
  let window = new THREE.Mesh(geo, mat);
  window.rotation.z = THREE.Math.degToRad(90);
  window.position.set(x, y, z);
  houseGroup.add(window);
};

const createHouse = () => {
  let boxGeo = new THREE.BoxBufferGeometry();
  // house
  let houseMat = new THREE.MeshLambertMaterial({ color: colors.house });
  let house = new THREE.Mesh(boxGeo, houseMat);
  house.position.set(-1, 0.52, 1);
  house.scale.set(1.2, 0.5, 1.5);
  house.receiveShadow = true;
  house.castShadow = true;
  houseGroup.add(house);
  // roof
  let roofGeo = new THREE.ConeBufferGeometry(1.1, 0.7, 4);
  let roofMat = new THREE.MeshLambertMaterial({ color: colors.red });
  let roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(-1, 1.098, 1);
  roof.rotation.y = THREE.Math.degToRad(45);
  roof.castShadow = true;
  roof.receiveShadow = true;
  houseGroup.add(roof);
  // roof chimney
  let chimneyMat = new THREE.MeshLambertMaterial({ color: colors.house });
  let chimney = new THREE.Mesh(boxGeo, chimneyMat);
  chimney.position.set(-1, 1.2, 0.6);
  chimney.scale.set(0.2, 0.3, 0.2);
  chimney.receiveShadow = true;
  houseGroup.add(chimney);
  // door
  let doorMat = new THREE.MeshLambertMaterial({ color: colors.purple });
  let door = new THREE.Mesh(boxGeo, doorMat);
  door.scale.set(0.2, 0.4, 0.35);
  door.position.set(-0.49, 0.51, 1);
  houseGroup.add(door);
  // doorknob
  let knobG = new THREE.SphereBufferGeometry(0.025, 8, 8);
  let knobMat = new THREE.MeshLambertMaterial({ color: colors.gold });
  let knob = new THREE.Mesh(knobG, knobMat);
  houseGroup.add(knob);
  knob.position.set(-0.39, 0.2, 1.14);
  // doorstep 
  createBoxShape(0.05, 0.05, 0.35, -0.38, 0.27, 1, colors.grey, false, false, houseGroup);
  createBoxShape(0.05, 0.05, 0.35, -0.34, 0.25, 1, colors.grey, false, false, houseGroup);
  // windows 
  createRoofWindow(-0.65, 1.2, 1, colors.blue, 0.1, 0.1, 0.2, 12);
  createRoofWindow(-0.67, 1.2, 1, colors.red, 0.12, 0.12, 0.22, 12);
  
  // left window
  createBoxShape(0.05, 0.1, 0.3, -0.41, 0.65, 1.45, colors.blue, false, false, houseGroup);
  // vertical bars
  createBoxShape(0.05, 0.1, 0.025, -0.40, 0.65, 1.45, colors.brown2, false, false, houseGroup);
  createBoxShape(0.05, 0.1, 0.025, -0.40, 0.65, 1.60, colors.brown2, false, false, houseGroup);
  createBoxShape(0.05, 0.1, 0.025, -0.40, 0.65, 1.30, colors.brown2, false, false, houseGroup);
  // horizontal bars
  createBoxShape(0.05, 0.025, 0.325, -0.40, 0.8, 1.45, colors.brown2, false, false, houseGroup);
  createBoxShape(0.05, 0.025, 0.325, -0.40, 0.65, 1.45, colors.brown2, false, false, houseGroup);
  
  // right window
  createBoxShape(0.05, 0.1, 0.3, -0.41, 0.65, 0.55, colors.blue, false, false, houseGroup);
  // vertical bars
  createBoxShape(0.05, 0.1, 0.025, -0.40, 0.65, 0.55, colors.brown2, false, false, houseGroup);
  createBoxShape(0.05, 0.1, 0.025, -0.40, 0.65, 0.70, colors.brown2, false, false, houseGroup);
  createBoxShape(0.05, 0.1, 0.025, -0.40, 0.65, 0.40, colors.brown2, false, false, houseGroup);
  // horizontal bars
  createBoxShape(0.05, 0.025, 0.325, -0.40, 0.8, 0.55, colors.brown2, false, false, houseGroup);
  createBoxShape(0.05, 0.025, 0.325, -0.40, 0.65, 0.55, colors.brown2, false, false, houseGroup);
  
  mainGroup.add(houseGroup);
};

// chimney smoke
const puffCount = 2;
let puffs = [];
let puff;
const createPuffs = () => {
  for (let i = 0; i < puffCount; i++) {
    const geo = new THREE.SphereBufferGeometry(0.1, 6, 6);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true });
    puff = new THREE.Mesh(geo, mat);
    puffs.push(puff);
    houseGroup.add(puff);
    puff.position.set(-1, 0.05, 0.6);
    puff.scale.set(0, 0, 0);
  }
};

// mailbox
let mailBoxGroup = new THREE.Group();

const createMailBoxRoof = () => {
  let mailRoofG = new THREE.ConeBufferGeometry(0.16, 0.1, 4);
  let mailRoofMat = new THREE.MeshLambertMaterial({ color: colors.brown2 });
  let mailRoofMesh = new THREE.Mesh(mailRoofG, mailRoofMat);
  mailRoofMesh.position.set(0, 0.34, 0);
  mailRoofMesh.rotation.y = THREE.Math.degToRad(45);
  mailRoofMesh.receiveShadow = true;
  mailRoofMesh.castShadow = true;
  mailBoxGroup.add(mailRoofMesh);
};
const createBigBunny=()=>{
  this.status = "running";
  this.runningCycle = 0;
  this.mesh = new THREE.Group();
  this.body = new THREE.Group();
  this.mesh.add(this.body);
  
  var torsoGeom = new THREE.CubeGeometry(7, 7, 10, 1);
  
  this.torso = new THREE.Mesh(torsoGeom, brownMat);
  this.torso.position.z = 0;
  this.torso.position.y = 7;
  this.torso.castShadow = true;
  this.body.add(this.torso);
  
  var pantsGeom = new THREE.CubeGeometry(9, 9, 5, 1);
  this.pants = new THREE.Mesh(pantsGeom, brownMat);
  this.pants.position.z = -3;
  this.pants.position.y = 0;
  this.pants.castShadow = true;
  this.torso.add(this.pants);
  
  var tailGeom = new THREE.CubeGeometry(3, 3, 3, 1);
  tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-2));
  this.tail = new THREE.Mesh(tailGeom, lightBrownMat);
  this.tail.position.z = -4;
  this.tail.position.y = 5;
  this.tail.castShadow = true;
  this.torso.add(this.tail);
  
  this.torso.rotation.x = -Math.PI/8;
  
  var headGeom = new THREE.CubeGeometry(10, 10, 13, 1);
  
  headGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,7.5));
  this.head = new THREE.Mesh(headGeom, brownMat);
  this.head.position.z = 2;
  this.head.position.y = 11;
  this.head.castShadow = true;
  this.body.add(this.head);
  
  var cheekGeom = new THREE.CubeGeometry(1, 4, 4, 1);
  this.cheekR = new THREE.Mesh(cheekGeom, pinkMat);
  this.cheekR.position.x = -5;
  this.cheekR.position.z = 7;
  this.cheekR.position.y = -2.5;
  this.cheekR.castShadow = true;
  this.head.add(this.cheekR);
  
  this.cheekL = this.cheekR.clone();
  this.cheekL.position.x = - this.cheekR.position.x;
  this.head.add(this.cheekL);
  
  
  var noseGeom = new THREE.CubeGeometry(6, 6, 3, 1);
  this.nose = new THREE.Mesh(noseGeom, lightBrownMat);
  this.nose.position.z = 13.5;
  this.nose.position.y = 2.6;
  this.nose.castShadow = true;
  this.head.add(this.nose);
  
  var mouthGeom = new THREE.CubeGeometry(4, 2, 4, 1);
  mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,3));
  mouthGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/12));
  this.mouth = new THREE.Mesh(mouthGeom, brownMat);
  this.mouth.position.z = 8;
  this.mouth.position.y = -4;
  this.mouth.castShadow = true;
  this.head.add(this.mouth);
  
  
  var pawFGeom = new THREE.CubeGeometry(3,3,3, 1);
  this.pawFR = new THREE.Mesh(pawFGeom, lightBrownMat);
  this.pawFR.position.x = -2;
  this.pawFR.position.z = 6;
  this.pawFR.position.y = 1.5;
  this.pawFR.castShadow = true;
  this.body.add(this.pawFR);
  
  this.pawFL = this.pawFR.clone();
  this.pawFL.position.x = - this.pawFR.position.x;
  this.pawFL.castShadow = true;
  this.body.add(this.pawFL);
  
  var pawBGeom = new THREE.CubeGeometry(3,3,6, 1);
  this.pawBL = new THREE.Mesh(pawBGeom, lightBrownMat);
  this.pawBL.position.y = 1.5;
  this.pawBL.position.z = 0;
  this.pawBL.position.x = 5;
  this.pawBL.castShadow = true;
  this.body.add(this.pawBL);
  
  this.pawBR = this.pawBL.clone();
  this.pawBR.position.x = - this.pawBL.position.x;
  this.pawBR.castShadow = true;
  this.body.add(this.pawBR);
  
  var earGeom = new THREE.CubeGeometry(7, 18, 2, 1);
  earGeom.vertices[6].x+=2;
  earGeom.vertices[6].z+=.5;
  
  earGeom.vertices[7].x+=2;
  earGeom.vertices[7].z-=.5;
  
  earGeom.vertices[2].x-=2;
  earGeom.vertices[2].z-=.5;
  
  earGeom.vertices[3].x-=2;
  earGeom.vertices[3].z+=.5;
  earGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,9,0));
  
  this.earL = new THREE.Mesh(earGeom, brownMat);
  this.earL.position.x = 2;
  this.earL.position.z = 2.5;
  this.earL.position.y = 5;
  this.earL.rotation.z = -Math.PI/12;
  this.earL.castShadow = true;
  this.head.add(this.earL);
  
  this.earR = this.earL.clone();
  this.earR.position.x = -this.earL.position.x;
  this.earR.rotation.z = -this.earL.rotation.z;
  this.earR.castShadow = true;
  this.head.add(this.earR);
  
  var eyeGeom = new THREE.CubeGeometry(2,4,4);
  
  this.eyeL = new THREE.Mesh(eyeGeom, whiteMat);
  this.eyeL.position.x = 5;
  this.eyeL.position.z = 5.5;
  this.eyeL.position.y = 2.9;
  this.eyeL.castShadow = true;
  this.head.add(this.eyeL);
  
  var irisGeom = new THREE.CubeGeometry(.6,2,2);
  
  this.iris = new THREE.Mesh(irisGeom, blackMat);
  this.iris.position.x = 1.2;
  this.iris.position.y = 1;
  this.iris.position.z = 1;
  this.eyeL.add(this.iris);
  
  this.eyeR = this.eyeL.clone();
  this.eyeR.children[0].position.x = -this.iris.position.x;
  
  
  this.eyeR.position.x = -this.eyeL.position.x;
  this.head.add(this.eyeR);

  this.body.traverse(function(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  this.mesh.scale.set(0.02,0.02,.02);
  this.mesh.position.y=0.28;
  this.mesh.position.x=0.28;

  scene.add(this.mesh);
}
const createMailbox = () => {
  createMailBoxRoof();
  // pole
  createBoxShape(0.05, 0.3, 0.05, 0, 0, 0, colors.brown2, true, true, mailBoxGroup);
  // box
  createBoxShape(0.2, 0.2, 0.2, 0, 0.2, 0, colors.brown2, true, true, mailBoxGroup);
  // hole
  createBoxShape(0.05, 0.05, 0.16, 0.085, 0.22, 0, 0x634326, false, false, mailBoxGroup);
  mainGroup.add(mailBoxGroup);
  mailBoxGroup.position.set(1.5, 0.4, 1.5);
};

// Bunny
let pivot1 = new THREE.Group();
let pivot2 = new THREE.Group();
let pivot3 = new THREE.Group();
let bunnyGroup1 = new THREE.Group();
let bunnyGroup2 = new THREE.Group();
let bunnyGroup3 = new THREE.Group();
const createBunnyShape = (group, x, y, z, color, xPos, yPos, zPos) => {
  let geo = new THREE.BoxBufferGeometry(x, y, z);
  let mat = new THREE.MeshLambertMaterial({ color: color, transparent: true });
  let mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(xPos, yPos, zPos);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  group.add(mesh);
};

const bunnyColors = [0xFFFFFF, 0xEAEAEA, 0xCFAF8E];
const createBunny = (group, pivotPositionX, pivotPositionY, pivotPositionZ, pivot) => {
  bunnyColor = bunnyColors[Math.round(Math.random() * 2)];
  // head
  createBunnyShape(group, 0.1, 0.1, 0.1, bunnyColor, 0, 0, 0.2);
  // ears
  createBunnyShape(group, 0.025, 0.14, 0.025, bunnyColor, 0.025, 0.05, 0.23);
  createBunnyShape(group, 0.025, 0.14, 0.025, bunnyColor, -0.025, 0.05, 0.23);
  // eyes
  createBunnyShape(group, 0.02, 0.02, 0.02, "black", 0.025, 0.02, 0.25);
  createBunnyShape(group, 0.02, 0.02, 0.02, "black", -0.025, 0.02, 0.25);
  mainGroup.add(group);
  // https://stackoverflow.com/questions/28848863/threejs-how-to-rotate-around-objects-own-center-instead-of-world-center
  let box = new THREE.Box3().setFromObject(group);
  box.getCenter(group.position); // this re-sets the mesh position
  group.position.multiplyScalar(-1);
  pivot.add(group);
  pivot.position.set(pivotPositionX, pivotPositionY, pivotPositionZ);
  mainGroup.add(pivot);

};

// GSAP ANIMATIONS 
// make island floaty
const animateIsland = () => {
  gsap.to(mainGroup.position, { y: '+=0.065', repeat: -1, yoyo: true, ease: "sine.in", duration: 2, yoyoEase: "sine.inOut" });
};
// animate single waterfall particle
const animateDrop = drop => {
  const tl = gsap.timeline({
    onStart: () => {
      gsap.set(drop.position, { y: gsap.utils.random(-0.17, 0, 0.01) });
      gsap.set(drop.scale, { x: 0.1, y: 0.1, z: 0.1 });
    },
    onComplete: animateDrop,
    onCompleteParams: [drop] });


  tl.to(drop.position, {
    y: "-=1",
    ease: "linear",
    delay: gsap.utils.random(0, 2, 0.2),
    duration: 1,
    onStart: () => {
      gsap.to(drop.scale, { x: 0, y: 0, z: 0, delay: 0.14, duration: 0.86 });
    } });

  return tl;
};
// animate single water detail
animateDet = det => {
  const tl = gsap.timeline(
  { defaults: { duration: 1, ease: "sine.in" },
    onStart: () => {
      gsap.set(det.position, { x: gsap.utils.random(0.60, 0.92), z: gsap.utils.random(-1.8, 1.8) });
      gsap.set(det.rotation, { y: 0, z: 0 });
      gsap.set(det.material, { opacity: 0 });
    },
    onComplete: animateDet,
    onCompleteParams: [det] });

  tl.to(det.material, { keyframes: [{ opacity: 0.7 }, { opacity: 0 }] }, 'in').
  to(det.position, { keyframes: [{ z: "+=0.025" }, { z: "-=0.025" }] }, 'in').
  to(det.rotation, { keyframes: [{ y: "-=0.2" }, { z: "+=0.2" }] }, 'in');

  return tl;
};

animateDet2 = det => {
  const tl = gsap.timeline(
  { defaults: { duration: 1, ease: "sine.in" },
    onStart: () => {
      gsap.set(det.position, { x: gsap.utils.random(0.60, 0.92), y: gsap.utils.random(-0.18, 0.20) });
      gsap.set(det.rotation, { y: 0, z: 0 });
      gsap.set(det.material, { opacity: 0 });
    },
    onComplete: animateDet2,
    onCompleteParams: [det] });

  tl.to(det.material, { keyframes: [{ opacity: 0.7 }, { opacity: 0 }] }, 'in').
  to(det.position, { keyframes: [{ y: "-=0.025" }, { y: "+=0.025" }] }, 'in').
  to(det.rotation, { keyframes: [{ y: "-=0.2" }, { z: "+=0.2" }] }, 'in');

  return tl;
};


// animate single puff
const animatePuff = puff => {
  const tl = gsap.timeline({ onComplete: animatePuff, onCompleteParams: [puff], onStart: () => {
      gsap.set(puff.material, { opacity: 1 });
      gsap.set(puff.scale, { x: 0, y: 0, z: 0 });
      gsap.set(puff.position, { y: 1.2 });
    } });
  tl.to(puff.position, { y: '+=0.6', duration: 2, delay: 0.6, ease: "sine.inOut", onStart: () => {
      gsap.to(puff.scale, { keyframes: [{ x: 1, y: 1.4, z: 1 }, { z: 1.4, duration: 0.24 }, { y: 0.8, delay: -0.44, duration: 0.24 }, { x: 1, y: 1 }] });
      gsap.to(puff.material, { opacity: 0, duration: 1.32, delay: 0.68 });
    } });
};
// function to loop over particles
const animateParticles = (fn, array) => {
  for (let i = 0; i < array.length; i++) {
    fn(array[i]);
  }
};

// animate the bunny
// eye blink
const animateBunnyEyes = (group, delay) => {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, defaults: { duration: 0.2 }, delay: delay });
  const eyes = [group.children[3].material, group.children[4].material];
  tl.to(eyes, { keyframes: [{ opacity: 0 }, { opacity: 1 }] }, 'blink');
  return tl;
};

// hop and move
const animateBunny = (pivot, delay) => {
  const tl = gsap.timeline({ repeat: -1, defaults: { duration: 0.32 }, delay: delay });
  tl.to(pivot.position, { keyframes: [{ y: '+=0.1', z: '+=0.1' }, { y: '-=0.1' }, { y: '+=0.1', z: '+=0.1' }, { y: '-=0.1' }] }).
  to(pivot.rotation, { y: 3, duration: 0.6, delay: 0.16 }).
  to(pivot.position, { keyframes: [{ y: '+=0.1', z: '-=0.1' }, { y: '-=0.1' }, { y: '+=0.1', z: '-=0.1' }, { y: '-=0.1' }] }).
  to(pivot.rotation, { y: 0, duration: 0.6, delay: 0.16 });
  return tl;
};

// render
render = () => {

  controls.update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

// resize
const resizeHandler = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("resize", () => {
  resizeHandler();
});

window.addEventListener('load', () => {
  setup();
  createIsland();
  animateIsland();
  // waterfall particles creation
  createParticles(
  colors.blue,
  dropCount,
  drops,
  0.1, 0.1, 0.1,
  0.56, 0.95, 0, -0.19, 1.95, 1.95,
  1,
  0, 0, 0);

  // animate waterfall particles 
  animateParticles(animateDrop, drops);
  // water details creation
  createParticles(
  "white",
  detailCount,
  dets,
  0.025, 0.025, 0.025,
  0.60, 0.92, 0.25, 0.26, 1.8, -1.8,
  0,
  0, 0, 0);

  createParticles(
  "white",
  detailCount2,
  dets2,
  0.025, 0.025, 0.025,
  0.60, 0.92, -0.2, 0.23, 2, 2,
  0,
  0, 0, 0);

  // animate water details
  animateParticles(animateDet, dets);
  animateParticles(animateDet2, dets2);
  // trees
  // trees next to house
  
  createTree(-1.50, 0.35, -0.1, -1.50, 0.7, -0.1);
  createTree(-0.75, 0.35, -0.5, -0.75, 0.7, -0.5);
  
  // other trees
  createTree(1.5, 0.35, -1.5, 1.5, 0.7, -1.5);
  createTree(1.5, 0.35, -0.5, 1.5, 0.7, -0.5);
  createTree(1.5, 0.35, 0.5, 1.5, 0.7, 0.5);
  // bushes next to house
  createBush(-0.7, 0.28, -0.1);
  createBush(-0.7, 0.28, -1);
  createBush(-1.55, 0.28, -0.6);
  createBush(-1.35, 0.28, -1.5);
  //
  createBush(1.5, 0.28, 1);
  createBush(1.5, 0.28, 0);
  createBush(1.5, 0.28, -1);
  // house
  createHouse();
  // chimney smoke
  createPuffs();
  // animate the smoke
  animateParticles(animatePuff, puffs);
  // mailbox
  createMailbox();
  //the bunny
  createBigBunny();
  
  // bunnies 
  
  createBunny(bunnyGroup1, 0, 0.33, 0.2, pivot1);
  createBunny(bunnyGroup2, -1, 0.33, -1, pivot2);
  createBunny(bunnyGroup3, -0.2, 0.33, -1.4, pivot3);

  animateBunny(pivot1, 0);
  animateBunny(pivot2, gsap.utils.random(0, 3, 0.4));
  animateBunny(pivot3, gsap.utils.random(0, 3, 0.4));
  animateBunnyEyes(bunnyGroup1, 0);
  animateBunnyEyes(bunnyGroup2, gsap.utils.random(0, 3, 0.4));
  animateBunnyEyes(bunnyGroup3, gsap.utils.random(0, 3, 0.4));
  render();
});