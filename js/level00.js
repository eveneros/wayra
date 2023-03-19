//initialise simplex noise instance
var noise = new SimplexNoise();
var audio = document.getElementById("audio");
//audio.src = "sounds/carnavalito-lato.ogg";
//audio.src = URL.createObjectURL(files[0]);

//var playPromise = audio.play();
/*for audio*/
var bgmusic = null;

bgmusic = new Howl({
  src: ['sounds/adventure.ogg'],
  loop: true,
  volume: 0.5,
  pause:true
});
bgmusic.pause();

// Create analyzer
var analyser = Howler.ctx.createAnalyser();

// Connect master gain to analyzer
Howler.masterGain.connect(analyser);

// Connect analyzer to destination
analyser.connect(Howler.ctx.destination);

 //var context = new AudioContext();
 //var src = context.createMediaElementSource(audio);
 //var analyser = context.createAnalyser();
// src.connect(analyser);
 //analyser.connect(context.destination);
 analyser.fftSize = 512;
 var bufferLength = analyser.frequencyBinCount;
 var dataArray = new Uint8Array(bufferLength);
/*
if (playPromise !== undefined) {
  playPromise.then(_ => {
// Automatic playback started!
// Show playing UI.
audio.pause();

  })
.catch(error => {
// Auto-play was prevented
// Show paused UI.
});
}
*/

 

 function makeRoughBall(mesh, bassFr, treFr) {
  mesh.geometry.vertices.forEach(function (vertex, i) {
      var offset = mesh.geometry.parameters.radius;
      var amp = 7;
      var time = window.performance.now();
      vertex.normalize();
      var rf = 0.00001;
      var distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
      vertex.multiplyScalar(distance);
  });
  mesh.geometry.verticesNeedUpdate = true;
  mesh.geometry.normalsNeedUpdate = true;
  mesh.geometry.computeVertexNormals();
  mesh.geometry.computeFaceNormals();
}

function makeRoughGround(mesh, distortionFr) {
  mesh.geometry.vertices.forEach(function (vertex, i) {
      var amp = 2;
      var time = Date.now();
      var distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
      vertex.z *= distance;
  });
  mesh.geometry.verticesNeedUpdate = true;
  mesh.geometry.normalsNeedUpdate = true;
  mesh.geometry.computeVertexNormals();
  mesh.geometry.computeFaceNormals();
}
//some helper functions here
function fractionate(val, minVal, maxVal) {
  return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
  var fr = fractionate(val, minVal, maxVal);
  var delta = outMax - outMin;
  return outMin + (fr * delta);
}

function avg(arr){
  var total = arr.reduce(function(sum, b) { return sum + b; });
  return (total / arr.length);
}

function max(arr){
  return arr.reduce(function(a, b){ return Math.max(a, b); })
}
 /*fin audio */
//COLORS
var Colors = {
    red:0xf25346,
    green:0x607d3b,
    lightgreen:0xAEF359,
    white:0xd8d0d1,
    brown:0x59332e,
    brownDark:0x544b32,
    pink:0xF5986E,
    yellow:0xFFC373,
    blue:0x8E3D75,

};

///////////////

// GAME VARIABLES
var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
var ennemiesPool = [];
var particlesPool = [];
var particlesInUse = [];
//var zanahorias=0;
function resetGame(){
  game = {speed:0,
          initSpeed:.00005,
          baseSpeed:.00005,
          targetBaseSpeed:.00005,
          incrementSpeedByTime:.000001,
          incrementSpeedByLevel:.000001,
          distanceForSpeedUpdate:200,
          speedLastUpdate:0,
          zanahorias:0,
          distance:0,
          ratioSpeedDistance:50,
          energy:80,
          ratioSpeedEnergy:3,

          level:1,
          levelLastUpdate:0,
          distanceForLevelUpdate:550,

          planeDefaultHeight:250,
          planeAmpHeight:170,
          planeAmpWidth:150,
          planeMoveSensivity:0.0038,
          planeRotXSensivity:0.0007,
          planeRotZSensivity:0.0004,
          planeFallSpeed:.001,
          planeMinSpeed:1.2,
          planeMaxSpeed:1.8,
          planeSpeed:0,
          planeCollisionDisplacementX:0,
          planeCollisionSpeedX:0,

          planeCollisionDisplacementY:0,
          planeCollisionSpeedY:0,

          seaRadius:850,
          seaLength:700,
          //seaRotationSpeed:0.006,
          wavesMinAmp : 2.5,
          wavesMaxAmp : 13,
          wavesMinSpeed : 0.0005,
          wavesMaxSpeed : 0.0015,

          cameraFarPos:390,
          cameraNearPos:380,
          cameraSensivity:0.0019,

          coinDistanceTolerance:17,
          coinValue:3,
          coinsSpeed:.5,
          coinLastSpawn:0,
          distanceForCoinsSpawn:100,

          ennemyDistanceTolerance:15,
          ennemyValue:10,
          ennemiesSpeed:.6,
          ennemyLastSpawn:0,
          distanceForEnnemiesSpawn:50,

          status : "playing",
         };
  fieldLevel.innerHTML = Math.floor(game.level);
 
}

//THREEJS RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer,
    container,
    controls;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };


function createScene() {
 


  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 125;
  nearPlane = .1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0xffffff, 200,1100);
  //aduis
  
  camera.position.x = 0;
  camera.position.z = 310;
  camera.position.y = game.planeDefaultHeight;
  //camera.lookAt(new THREE.Vector3(0, 400, 0));

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);

  renderer.shadowMap.enabled = true;

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);

  /*
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = -Math.PI / 2;
  controls.maxPolarAngle = Math.PI ;

  //controls.noZoom = true;
  //controls.noPan = true;
  //*/
}

// MOUSE AND SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
  var tx = -0.5 + (event.clientX / WIDTH)*2;
  var ty = 0.5 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};
}

function handleTouchMove(event) {
    //event.preventDefault();
    var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
    var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
    mousePos = {x:tx, y:ty};
}

function handleMouseUp(event){
 
  
   
  //despausear
  /*
  if (game.status == "waitingReplay" && parseInt(game.energy)==0){
    resetGame();
    hideReplay();
  }
  */
   
  
  //para dragon:
  /*
  if (sneezeTimeout) clearTimeout(sneezeTimeout);
  sneezingRate += (maxSneezingRate - sneezingRate) / 10;
  powerField.innerHTML = parseInt(sneezingRate*100/maxSneezingRate);
  dragon.prepareToSneeze(sneezingRate);
  sneezeTimeout = setTimeout(sneeze, sneezeDelay*globalSpeedRate);
  dragon.isSneezing = true;
  */
  //fin para dragon
}


function handleTouchEnd(event){
  
  /*
  if (game.status == "waitingReplay" && parseInt(game.energy)==0){
    resetGame();
    hideReplay();
  }
 */


}

// LIGHTS

var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

  ambientLight = new THREE.AmbientLight(0xdc8874, .5);

  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, -350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 4096;
  shadowLight.shadow.mapSize.height = 4096;

  var ch = new THREE.CameraHelper(shadowLight.shadow.camera);

  //scene.add(ch);
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);

}
/** CREATE BUNNY */
/*
conejo:
*/
var materials = {
    orange: new THREE.MeshPhongMaterial({ color: 0xFDB731, flatShading: true }),
    green:  new THREE.MeshPhongMaterial({ color: 0x379351, flatShading: true }),
    brown:  new THREE.MeshPhongMaterial({ color: 0x5C2C22, flatShading: true }),
    pink:   new THREE.MeshPhongMaterial({ color: 0xB1325E, flatShading: true }),
    gray:   new THREE.MeshPhongMaterial({ color: 0x666666, flatShading: true }),
    clouds: new THREE.MeshPhongMaterial({ color: 0xeeeeee, flatShading: true }),
    rabbit: new THREE.MeshPhongMaterial({ color: 0xF0C294, flatShading: true })
  };
  CloudBunny =function() {
    
  
      console.log('☁️');
  
      this.mesh = new THREE.Group();
  
      const cloud = this._createCould();
  
      this.mesh.position.x = 200;
      this.mesh.position.y = config.y || Math.random();
      this.mesh.position.z = config.z || 0;
  
      this.mesh.add(cloud);
  
      this.animate(config);
    }
  
    CloudBunny.prototype.animate=function(config) {
  
      TweenMax.to(this.mesh.position, 3.5, {
        x: -200,
        repeat: Infinity,
        delay: config.delay || 0,
        onRepeat: () => {
  
          this.mesh.position.y =  randomIntFromInterval(-10, 20);
        }
      });
    }
    CloudBunny.prototype._createCouldBunny=function() {
  
      const group = new THREE.Group();
  
      const cloudGeo = new THREE.SphereGeometry(5, 4, 6);
      const cloud = new THREE.Mesh(cloudGeo,  materials.clouds);
      cloud.scale.set(1, 0.8, 1);
  
      const cloud2 = cloud.clone();
      cloud2.scale.set(.55, .35, 1);
      cloud2.position.set(5, -1.5, 2);
  
      const cloud3 = cloud.clone();
      cloud3.scale.set(.75, .5, 1);
      cloud3.position.set(-5.5, -2, -1);
  
      group.add(cloud);
      group.add(cloud2);
      group.add(cloud3);
  
      
  
      return group;
    }
    var conejo;
    var carrot;
    var Conejo=function() {
  
      
    
        console.log('🐰');
    
        this.mesh = new THREE.Group();
        this.mesh.name='conejo';
        this.pilot = this._createPilot();
    
        this.mesh.rotation.x = 1.5;
        this.mesh.position.set(0, 7, 5);
    
        this.mesh.add(this.pilot);
    
        this.animate();
      }
      Conejo.prototype.animate=function() {
  
        TweenMax.to(this.earPivotL.rotation, 0.1, {
          x: Math.sin(-Math.PI/3),
          repeat: Infinity,
          yoyo: true
        });
    
        TweenMax.to(this.earPivotR.rotation, 0.1, {
          x: -Math.PI/2.25,
          repeat: Infinity,
          yoyo: true
        });
    
        TweenMax.to(this.eye.scale, 0.5, {
          y: 0.1,
          repeat: Infinity,
          yoyo: true,
          delay: 5,
          repeatDelay: 3
        });
    
        TweenMax.to(this.eyeb.scale, 0.5, {
          y: 0.1,
          repeat: Infinity,
          yoyo: true,
          delay: 5,
          repeatDelay: 3
        });
      }
      Conejo.prototype._createPilot=function() {
  
        const group = new THREE.Group();
    
        const bodyGeo = new THREE.CubeGeometry(5, 5, 5);
        bodyGeo.vertices[3].y += 0.5;
        bodyGeo.vertices[6].y += 0.5;
    
        const body = new THREE.Mesh(bodyGeo, materials.rabbit);
        body.position.y = 1;
        body.position.z = 4;
    
        const seatGeo = new THREE.CubeGeometry(6, 1, 6);
        const seat = new THREE.Mesh(seatGeo, materials.brown);
        seat.position.set(0, -2.5, 0);
        seat.rotation.set(.25, 0, 0);
        body.add(seat);
    
        this.earPivotL = new THREE.Object3D();
        this.earPivotL.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2.5, 0));
        this.earPivotL.rotation.x = -Math.PI/2.25;
    
        this.earPivotR = this.earPivotL.clone();
        this.earPivotR.rotation.x = -Math.PI/3;
    
        const earGeo = new THREE.CubeGeometry(2, 6, 0.5);
        earGeo.vertices[2].x -= 0.5;
        earGeo.vertices[3].x -= 0.5;
        earGeo.vertices[6].x += 0.5;
        earGeo.vertices[7].x += 0.5;
    
        const ear = new THREE.Mesh(earGeo, materials.rabbit);
        ear.position.x = -1.5;
        ear.position.y = 2.5;
    
        const earInside = new THREE.Mesh(earGeo, materials.pink);
        earInside.scale.set(.5, .7, .5);
        earInside.position.set(0, 0, .25);
        ear.add(earInside);
    
        this.earPivotL.add(ear);
        body.add(this.earPivotL);
    
        const ear2 = ear.clone();
        ear2.position.x = ear.position.x * -1;
        this.earPivotR.add(ear2);
        body.add(this.earPivotR);
    
        const eyeGeo = new THREE.CubeGeometry(0.5, 1, 0.5);
        const eye = new THREE.Mesh(eyeGeo, materials.gray);
        eye.position.set(1, 0.5, 2.5);
        body.add(eye);
        this.eye = eye;
    
        const eyeb = eye.clone();
        eyeb.position.x = eye.position.x * -1;
        this.eyeb = eyeb;
        body.add(eyeb);
    
        const noseGeo = new THREE.CubeGeometry(0.5, 0.5, 0.5);
        noseGeo.vertices[2].x = 0;
        noseGeo.vertices[3].x = 0;
        noseGeo.vertices[6].x = 0;
        noseGeo.vertices[7].x = 0;
        const nose = new THREE.Mesh(noseGeo, materials.pink);
        nose.position.set(0, -.5, 2.5);
        body.add(nose);
    /*
        const mouthGeo = new THREE.CubeGeometry(.25, 0.25, 0.5);
        const mouth = new THREE.Mesh(mouthGeo, materials.gray);
        mouth.position.set(0, -1.5, 2.5);
        body.add(mouth);
    */
        group.add(body);
    
    
        return group;
      }
    
  
    var Carrot =function(){
      
    
        console.log('🥕');
    
        this.mesh = new THREE.Group();
        this.mesh.name = "carrot";
        this.body = this._createBody();
        this.wings = this._createWings();
        this.leafs = this._createLeafs();
        this.conejo = new Conejo();
    
        this.mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2);
        this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI/2);
    
        this.mesh.add(this.body);
        this.mesh.add(this.wings);
        this.mesh.add(this.leafs);
        this.mesh.add(this.conejo.mesh);
        
        this.animate();
      }
      Carrot.prototype.animate=function() {
      /*
        TweenMax.to(this.mesh.position, 1, {
          x: -2,
          y: 4,
          repeat: Infinity,
          yoyo: true,
          ease: Sine.easeInOut
        });
    */
        TweenMax.to(this.mesh.rotation, 2, {
          x: -1.001,
          repeat: Infinity,
          yoyo: true,
          ease: Sine.easeInOut
        });
    
        TweenMax.to(this.leafs.rotation, 0.1, {
          y: Math.PI,
          repeat: Infinity,
          ease: Power0.easeNone
        });
      }
      Carrot.prototype._createBody=function() {
  
        const group = new THREE.Group();
    
        const bodyGeom = new THREE.CylinderGeometry(5, 2, 25);
        bodyGeom.vertices[16].y += 3;
        bodyGeom.vertices[17].y -= 2;
    
        group.add(new THREE.Mesh(bodyGeom, materials.orange));
    
        
    
        return group;
      }
      Carrot.prototype._createWings=function() {
  
        console.log('✈️');
    
        const group = new THREE.Group();
        const geometry = new THREE.CubeGeometry(8, 7, 0.5);
    
        geometry.vertices[2].y += 2;
        geometry.vertices[3].y += 2;
        geometry.vertices[2].x -= 1;
        geometry.vertices[3].x -= 1;
    
        const wingR = new THREE.Mesh(geometry, materials.brown);
        wingR.position.x = 6;
        wingR.position.y = 2;
        wingR.position.z = 1;
    
        const wingL = wingR.clone();
        wingL.position.x = -6;
        wingL.rotation.y = Math.PI;
    
        group.add(wingR);
        group.add(wingL);
        
        
        return group;
      }
      Carrot.prototype._createLeafs=function() {
  
        console.log('🍃');
    
        const group = new THREE.Group();
        const geometry = new THREE.CylinderGeometry(1.5, 1, 5, 4);
    
        geometry.vertices[8].y += 0.5;
    
        const leafA = new THREE.Mesh(geometry, materials.green);
        leafA.position.y = 16;
    
        const leafB = leafA.clone();
        leafB.position.x = -1.75;
        leafB.position.y = 15;
        leafB.rotation.z = 0.4;
    
        const leafC = leafB.clone();
        leafC.position.x = leafB.position.x * -1;
        leafC.rotation.z = leafB.rotation.z * -1;
    
        group.add(leafA);
        group.add(leafB);
        group.add(leafC);
    
        
    
        return group;
      }
  /*
  fin conejo:
  */
/**CREATE ROCKET */
function makeCylinder(radiusTop, radiusBottom, height, radiusSegments, heightSegments, mat) {
	var geom = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments);
	var mesh = new THREE.Mesh(geom, mat);
	return mesh;
}
var rocket;
var freqCount=0,frequency = 6,smokeRecycle = [],worldCoords;
Rocket = function(){

	this.mesh = new THREE.Object3D();
	this.rocketTween = TweenMax.set(this.mesh.position, {x:0});
    
	this.bodyMat = new THREE.MeshLambertMaterial ({
		color: 0x1d836a,
		wireframe: false,
		shading:THREE.FlatShading
	});
	this.ringMat = new THREE.MeshLambertMaterial ({
		color: 0x3a1b19,
		wireframe: false,
		shading:THREE.FlatShading
	});
	this.metalMat = new THREE.MeshLambertMaterial ({
		color: 0x81878d,
		wireframe: false,
		shading:THREE.FlatShading
	});
	var footGeom = new THREE.BoxGeometry(30, 10, 30);

	this.top = new THREE.Object3D();
	this.mid = new THREE.Object3D();
	this.bot = new THREE.Object3D();
	this.engine = new THREE.Object3D();
	this.legs = new THREE.Object3D();

	this.bodyTopRing = makeCylinder(35, 35, 10, 10, 1, this.ringMat);
	this.bodyTopRing.position.y = 0;


	this.bodyTopBase = makeCylinder(25, 30, 10, 10, 1, this.bodyMat);
	this.bodyTopBase.position.y = 10;

	this.bodyTop = makeCylinder(5, 25, 30, 10, 1, this.bodyMat);
	this.bodyTop.position.y = 30;

	this.bodyTopNippleBase = makeCylinder(5, 5, 5, 10, 1, this.ringMat);
	this.bodyTopNippleBase.position.y = 47;

	this.bodyTopNipple = makeCylinder(2, 5, 5, 10, 1, this.ringMat);
	this.bodyTopNipple.position.y = 52;

	this.bodyTopAntenna = makeCylinder(1, 1, 25, 5, 1, this.ringMat);
	this.bodyTopAntenna.position.y = 63;

	this.bodyTopAntennaBall = new THREE.Mesh(new THREE.SphereGeometry( 2, 20, 10 ), this.ringMat);
	this.bodyTopAntennaBall.position.y = 76;

	this.top.add(this.bodyTopRing);
	this.top.add(this.bodyTopBase);
	this.top.add(this.bodyTop);
	this.top.add(this.bodyTopNippleBase);
	this.top.add(this.bodyTopNipple);
	this.top.add(this.bodyTopAntenna);
	this.top.add(this.bodyTopAntennaBall);

	this.bodyMidRing = makeCylinder(87, 87, 12, 12, 1, this.ringMat);
	this.bodyMidRing.position.y = 0;
	this.bodyMidBase = makeCylinder(60, 80, 50, 12, 1, this.bodyMat);
	this.bodyMidBase.position.y = 31;

	this.bodyMid = makeCylinder(30, 60, 120, 12, 1, this.bodyMat);
	this.bodyMid.position.y = 116;

	this.mid.add(this.bodyMid);
	this.mid.add(this.bodyMidBase);
	this.mid.add(this.bodyMidRing);
	this.bodyBotRing = makeCylinder(45, 45, 5, 12, 1, this.ringMat);
	this.bodyBotRing.position.y = 0;
	this.bodyBot = makeCylinder(80, 45, 25, 12, 1, this.bodyMat);
	this.bodyBot.position.y = 15;
	this.bot.add(this.bodyBotRing);
	this.bot.add(this.bodyBot);

	this.bodyEngineTop = makeCylinder(45, 50, 5, 12, 1, this.bodyMat);
	this.bodyEngineTop.position.y = 0;
	this.bodyEngineRingTop =  makeCylinder(55, 50, 10, 12, 1, this.ringMat);
	this.bodyEngineRingTop.position.y = -8;
	this.bodyEngineMid = makeCylinder(45, 45, 10, 8, 1, this.bodyMat);
	this.bodyEngineMid.position.y = -18;
	this.bodyEngineRingBot =  makeCylinder(50, 40, 10, 12, 1, this.ringMat);
	this.bodyEngineRingBot.position.y = -28;
	this.bodyEngineNozzle =  makeCylinder(45, 55, 25, 12, 1, this.metalMat);
	this.bodyEngineNozzle.position.y = -44;
	this.bodyEngineNozzleEnd =  makeCylinder(60, 60, 5, 12, 1, this.metalMat);
	this.bodyEngineNozzleEnd.position.y = -59;

	this.engine.add(this.bodyEngineTop);
	this.engine.add(this.bodyEngineRingTop);
	this.engine.add(this.bodyEngineMid);
	this.engine.add(this.bodyEngineRingBot);
	this.engine.add(this.bodyEngineNozzle);
	this.engine.add(this.bodyEngineNozzleEnd);

	this.legA =  makeCylinder(5, 5, 170, 6, 1, this.ringMat);
	this.legA.position.set(0,0,-75);
	this.legA.rotation.x = 20 * Math.PI / 180;
	this.legB =  makeCylinder(5, 5, 170, 6, 1, this.ringMat);
	this.legB.position.set(75,0,0);
	this.legB.rotation.z = 20 * Math.PI / 180;
	this.legY =  makeCylinder(5, 5, 170, 6, 1, this.ringMat);
	this.legY.position.set(0,0,75);
	this.legY.rotation.x = -20 * Math.PI / 180;
	this.legZ =  makeCylinder(5, 5, 170, 6, 1, this.ringMat);
	this.legZ.position.set(-75,0,0);
	this.legZ.rotation.z = -20 * Math.PI / 180;

	this.legs.add(this.legA);
	this.legs.add(this.legB);
	this.legs.add(this.legZ);
	this.legs.add(this.legY);

	this.legASock =  makeCylinder(6, 6, 50, 6, 1, this.metalMat);
	this.legASock.position.set(0,-37,-89);
	this.legASock.rotation.x = 20 * Math.PI / 180;

	this.legBSock =  makeCylinder(6, 6, 50, 6, 1, this.metalMat);
	this.legBSock.position.set(89,-37,0);
	this.legBSock.rotation.z = 20 * Math.PI / 180;

	this.legYSock =  makeCylinder(6, 6, 50, 6, 1, this.metalMat);
	this.legYSock.position.set(0,-37,89);
	this.legYSock.rotation.x = -20 * Math.PI / 180;

	this.legZSock =  makeCylinder(6, 6, 50, 6, 1, this.metalMat);
	this.legZSock.position.set(-89,-37,0);
	this.legZSock.rotation.z = -20 * Math.PI / 180;

	this.legs.add(this.legASock);
	this.legs.add(this.legBSock);
	this.legs.add(this.legYSock);
	this.legs.add(this.legZSock);

	this.legAFoot = new THREE.Mesh(footGeom, this.metalMat);
	this.legAFoot.position.set(0,-45,0);
	this.legAFoot.rotation.x = -20 * Math.PI / 180;

	this.legBFoot = new THREE.Mesh(footGeom, this.metalMat);
	this.legBFoot.position.set(0,-45,0);
	this.legBFoot.rotation.z = -20 * Math.PI / 180;

	this.legYFoot = new THREE.Mesh(footGeom, this.metalMat);
	this.legYFoot.position.set(0,-45,0);
	this.legYFoot.rotation.x = 20 * Math.PI / 180;

	this.legZFoot = new THREE.Mesh(footGeom, this.metalMat);
	this.legZFoot.position.set(0,-45,0);
	this.legZFoot.rotation.z = 20 * Math.PI / 180;

	this.legASock.add(this.legAFoot);
	this.legBSock.add(this.legBFoot);
	this.legYSock.add(this.legYFoot);
	this.legZSock.add(this.legZFoot);

	this.windowXTop = makeCylinder(14, 14, 2, 10, 1, this.ringMat);
	this.windowXTop.position.set(0,-45,57);
	this.windowXTop.rotation.x = 75 * Math.PI / 180;

	this.windowXInnerTop = makeCylinder(9, 9, 2, 10, 1, this.metalMat);
	this.windowXInnerTop.position.set(0,2,0);

	this.windowXBot = makeCylinder(12, 12, 2, 10, 1, this.ringMat);
	this.windowXBot.position.set(0,0,46);
	this.windowXBot.rotation.x = 75 * Math.PI / 180;

	this.windowXInnerBot = makeCylinder(7, 7, 2, 10, 1, this.metalMat);
	this.windowXInnerBot.position.set(0,2,0);

	this.windowXTop.add(this.windowXInnerTop);
	this.windowXBot.add(this.windowXInnerBot);
	this.bodyMid.add(this.windowXTop);
	this.bodyMid.add(this.windowXBot);

	this.top.position.y = 170   ;
	this.mid.position.y = 0;
	this.bot.position.y = -33   ;
	this.engine.position.y = -38   ;
	this.legs.position.y = -40   ;

	this.mesh.add(this.top);
	this.mesh.add(this.mid);
	this.mesh.add(this.bot);
	this.mesh.add(this.engine);
    this.mesh.add(this.legs);
    this.mesh.rotation.z = this.mesh.rotation.z - ( Math.PI / 2 );
}
Rocket.prototype.flyPath = function(){
	pt = spline.getPoint( t );
	tangent = spline.getTangent( t ).normalize();
	axis.crossVectors( up, tangent ).normalize();
	radians = Math.acos( up.dot( tangent ) );
	var quaterions = this.rocket.quaternion.setFromAxisAngle( axis, radians );

	this.rocketTween.kill();
	this.tweenPosition = TweenMax.to(rocket1.rocket.position, 0.1, {x:pt.x, y: pt.y, z: pt.z});
	this.tweenQuaternion = TweenMax.to(this.rocket.quaternion, 0.1,
		{
			x: quaterions._x,
			y: quaterions._y,
			z: quaterions._z});

		t = (t >= 1) ? 0 : t += 0.0009;
}

//Smoke Stuff here

// We create and recycle smoke objects here


function setSmokeCoords(){
	airplane.bodyMid.geometry.computeBoundingBox();
	var boundingBox = airplane.bodyMid.geometry.boundingBox;
	worldCoords = new THREE.Vector3();
	worldCoords.subVectors( boundingBox.max, boundingBox.min );
	worldCoords.multiplyScalar( 0.5 );
	worldCoords.add( boundingBox.min );
	worldCoords.applyMatrix4( airplane.bodyMid.matrixWorld );
}
function dropSmoke(s) {

	s.mesh.material.opacity = 1;
	s.mesh.position.x = worldCoords.x;
	s.mesh.position.y = worldCoords.y;
	s.mesh.position.z = worldCoords.z;
	s.mesh.scale.set(10.1, 10.1, 10.1);

	var smokeTl = new TimelineMax();

	var tweenSmokeEnter = TweenMax.to(s.mesh.scale, Math.random() * 1 + 0.3, {
		x: Math.random() * 1 + 0.7,
		y: Math.random() * 1 + 0.7,
		z: Math.random() * 1 + 0.7,
		delay: 0.1,
		ease: Strong.easeOut
	});
	var tweenSmokeLeave = TweenMax.to(s.mesh.scale, 0.5, {
		x: 0.1,
		y: 0.1,
		z: 0.1,
		ease: Strong.easeIn,
		onComplete: resetSmoke,
		onCompleteParams:[s]
	});
	smokeTl.add(tweenSmokeEnter).add(tweenSmokeLeave, 0.6).play();
}
function createDroppingWaste(){
	var s = getSmokeParticle();
	dropSmoke(s);
}
function getSmokeParticle(){
	if (smokeRecycle.length){
		return smokeRecycle.pop();
	}else{
		return new SmokeParticle();
	}
}
function resetSmoke(s){
	s.mesh.position.x = 0;
	s.mesh.position.y = 0;
	s.mesh.position.z = 0;
	s.mesh.rotation.x = Math.random()*Math.PI*2;
	s.mesh.rotation.y = Math.random()*Math.PI*2;
	s.mesh.rotation.z = Math.random()*Math.PI*2;
	//s.mesh.scale.set(.1,.1,.1);
	s.mesh.material.opacity = 0;
	//s.material.needUpdate = true;
	scene.add(s.mesh);
	smokeRecycle.push(s);
}
function SmokeParticle() {
	this.geometry = new THREE.IcosahedronGeometry( 75, 1 );
	this.material = new THREE.MeshLambertMaterial({
		color: 'white', shading: THREE.FlatShading, transparent: true
	});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	resetSmoke(this);
}
function updateSmokeArr(){
	if (freqCount % frequency == 0){
		createDroppingWaste();
	}
	freqCount++;
}


//Create Stuff

/**CREATE ROCKET END*/

var Pilot=function() {
  
      
    
  console.log('🐰');

  this.mesh = new THREE.Group();
  this.mesh.name='conejo';
  this.pilot = this._createPilot();

  this.mesh.rotation.x = 1.5;
  this.mesh.position.set(0, 7, 5);

  this.mesh.add(this.pilot);

  this.animate();
}
Pilot.prototype.animate=function() {

  TweenMax.to(this.earPivotL.rotation, 0.1, {
    x: Math.sin(-Math.PI/3),
    repeat: Infinity,
    yoyo: true
  });

  TweenMax.to(this.earPivotR.rotation, 0.1, {
    x: -Math.PI/2.25,
    repeat: Infinity,
    yoyo: true
  });

  TweenMax.to(this.eye.scale, 0.5, {
    y: 0.1,
    repeat: Infinity,
    yoyo: true,
    delay: 5,
    repeatDelay: 3
  });

  TweenMax.to(this.eyeb.scale, 0.5, {
    y: 0.1,
    repeat: Infinity,
    yoyo: true,
    delay: 5,
    repeatDelay: 3
  });
}
Pilot.prototype._createPilot=function() {

  const group = new THREE.Group();

  const bodyGeo = new THREE.CubeGeometry(5, 5, 5);
  bodyGeo.vertices[3].y += 0.5;
  bodyGeo.vertices[6].y += 0.5;

  const body = new THREE.Mesh(bodyGeo, materials.rabbit);
  body.position.y = 1;
  body.position.z = 4;

  

  this.earPivotL = new THREE.Object3D();
  this.earPivotL.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2.5, 0));
  this.earPivotL.rotation.x = -Math.PI/2.25;

  this.earPivotR = this.earPivotL.clone();
  this.earPivotR.rotation.x = -Math.PI/3;

  const earGeo = new THREE.CubeGeometry(2, 6, 0.5);
  earGeo.vertices[2].x -= 0.5;
  earGeo.vertices[3].x -= 0.5;
  earGeo.vertices[6].x += 0.5;
  earGeo.vertices[7].x += 0.5;

  const ear = new THREE.Mesh(earGeo, materials.rabbit);
  ear.position.x = -1.5;
  ear.position.y = 2.5;

  const earInside = new THREE.Mesh(earGeo, materials.pink);
  earInside.scale.set(.5, .7, .5);
  earInside.position.set(0, 0, .25);
  ear.add(earInside);

  this.earPivotL.add(ear);
  body.add(this.earPivotL);

  const ear2 = ear.clone();
  ear2.position.x = ear.position.x * -1;
  this.earPivotR.add(ear2);
  body.add(this.earPivotR);

  const eyeGeo = new THREE.CubeGeometry(0.5, 1, 0.5);
  const eye = new THREE.Mesh(eyeGeo, materials.gray);
  eye.position.set(1, 0.5, 2.5);
  body.add(eye);
  this.eye = eye;

  const eyeb = eye.clone();
  eyeb.position.x = eye.position.x * -1;
  this.eyeb = eyeb;
  body.add(eyeb);

  const noseGeo = new THREE.CubeGeometry(0.5, 0.5, 0.5);
  noseGeo.vertices[2].x = 0;
  noseGeo.vertices[3].x = 0;
  noseGeo.vertices[6].x = 0;
  noseGeo.vertices[7].x = 0;
  const nose = new THREE.Mesh(noseGeo, materials.pink);
  nose.position.set(0, -.5, 2.5);
  body.add(nose);
 /*
  const mouthGeo = new THREE.CubeGeometry(.25, 0.25, 0.5);
  const mouth = new THREE.Mesh(mouthGeo, materials.gray);
  mouth.position.set(0, -1.5, 2.5);
  body.add(mouth);
  */

  group.add(body);


  return group;
}

var AirPlane = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "airPlane";

  // Cabin

  var geomCabin = new THREE.BoxGeometry(80,40,40,1,1,1);
  var matCabin = new THREE.MeshPhongMaterial({color:Colors.green, shading:THREE.FlatShading});

  geomCabin.vertices[4].y-=10;
  geomCabin.vertices[4].z+=20;
  geomCabin.vertices[5].y-=10;
  geomCabin.vertices[5].z-=20;
  geomCabin.vertices[6].y+=30;
  geomCabin.vertices[6].z+=20;
  geomCabin.vertices[7].y+=30;
  geomCabin.vertices[7].z-=20;

  var cabin = new THREE.Mesh(geomCabin, matCabin);
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  this.mesh.add(cabin);

  // Engine

  var geomEngine = new THREE.BoxGeometry(20,40,40,1,1,1);
  var matEngine = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
  var engine = new THREE.Mesh(geomEngine, matEngine);
  engine.position.x = 50;
  engine.castShadow = true;
  engine.receiveShadow = true;
  this.mesh.add(engine);

  // Tail Plane

  var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
  var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.green, shading:THREE.FlatShading});
  var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
  tailPlane.position.set(-40,20,0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
  this.mesh.add(tailPlane);

  // Wings

  var geomSideWing = new THREE.BoxGeometry(30,5,180,1,1,1);
  var matSideWing = new THREE.MeshPhongMaterial({color:Colors.green, shading:THREE.FlatShading});
  var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
  sideWing.position.set(0,15,0);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  this.mesh.add(sideWing);

  

  

  var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
  geomPropeller.vertices[4].y-=5;
  geomPropeller.vertices[4].z+=5;
  geomPropeller.vertices[5].y-=5;
  geomPropeller.vertices[5].z-=5;
  geomPropeller.vertices[6].y+=5;
  geomPropeller.vertices[6].z+=5;
  geomPropeller.vertices[7].y+=5;
  geomPropeller.vertices[7].z-=5;
  var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
  this.propeller = new THREE.Mesh(geomPropeller, matPropeller);

  this.propeller.castShadow = true;
  this.propeller.receiveShadow = true;

  var geomBlade = new THREE.BoxGeometry(1,80,10,1,1,1);
  var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
  var blade1 = new THREE.Mesh(geomBlade, matBlade);
  blade1.position.set(8,0,0);

  blade1.castShadow = true;
  blade1.receiveShadow = true;

  var blade2 = blade1.clone();
  blade2.rotation.x = Math.PI/2;

  blade2.castShadow = true;
  blade2.receiveShadow = true;

  this.propeller.add(blade1);
  this.propeller.add(blade2);
  this.propeller.position.set(60,0,0);
  this.mesh.add(this.propeller);

  var wheelProtecGeom = new THREE.BoxGeometry(30,15,10,1,1,1);
  var wheelProtecMat = new THREE.MeshPhongMaterial({color:Colors.green, shading:THREE.FlatShading});
  var wheelProtecR = new THREE.Mesh(wheelProtecGeom,wheelProtecMat);
  wheelProtecR.position.set(25,-20,25);
  this.mesh.add(wheelProtecR);

  var wheelTireGeom = new THREE.BoxGeometry(20,20,4);
  var wheelTireMat = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
  var wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
  wheelTireR.position.set(25,-28,25);

  var wheelAxisGeom = new THREE.BoxGeometry(10,10,6);
  var wheelAxisMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
  var wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
  wheelTireR.add(wheelAxis);

  this.mesh.add(wheelTireR);

  var wheelProtecL = wheelProtecR.clone();
  wheelProtecL.position.z = -wheelProtecR.position.z ;
  this.mesh.add(wheelProtecL);

  var wheelTireL = wheelTireR.clone();
  wheelTireL.position.z = -wheelTireR.position.z;
  this.mesh.add(wheelTireL);

  var wheelTireB = wheelTireR.clone();
  wheelTireB.scale.set(.5,.5,.5);
  wheelTireB.position.set(-35,-5,0);
  this.mesh.add(wheelTireB);

  var suspensionGeom = new THREE.BoxGeometry(4,20,4);
  suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0))
  var suspensionMat = new THREE.MeshPhongMaterial({color:Colors.green, shading:THREE.FlatShading});
  var suspension = new THREE.Mesh(suspensionGeom,suspensionMat);
  suspension.position.set(-35,-5,0);
  suspension.rotation.z = -.3;
  this.mesh.add(suspension);

  this.pilot = new Pilot();
  this.pilot.mesh.scale.set(6,6,6);
  this.pilot.mesh.rotation.y=1.49;
  this.pilot.mesh.rotation.x=-0.11;
  this.pilot.mesh.position.set(-10,25,-10);
  this.mesh.add(this.pilot.mesh);


  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;

};

Sky = function(){
  this.mesh = new THREE.Object3D();
  this.nClouds = 12;
  this.clouds = [];
  var stepAngle = Math.PI*2 / this.nClouds;
  for(var i=0; i<this.nClouds; i++){
    var c = new Cloud();
    this.clouds.push(c);
    var a = stepAngle*i;
    var h = game.seaRadius + 50 + Math.random()*300;
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.position.z = -50-Math.random()*300;
    c.mesh.rotation.z = a + Math.PI/2;
    var s = 2+Math.random()*2;
    c.mesh.scale.set(s,s,s);
    this.mesh.add(c.mesh);
  }
}

Sky.prototype.moveClouds = function(min,max){
  for(var i=0; i<this.nClouds; i++){
    var c = this.clouds[i];
    c.rotate();
    //c.mesh.position.y = Math.sin((Math.PI*2 /36)*i)*(game.seaRadius + 50 + Math.random()*300)+(max/200);//vibra
    if(min>0)
    var s = 2.5+Math.random()*(min/4);
    else
    var s = 2.5+Math.random();
   
    //c.mesh.scale.set(4.25+(max/2),4.25+(max/2),4.25+(max/2));
  
    c.mesh.scale.set(s,s,s);
  }
  if(min>0)
  this.mesh.rotation.z += game.speed*deltaTime*(min/2);
  else
  this.mesh.rotation.z += game.speed*deltaTime;

}

Sea = function(){
  var geom = new THREE.CylinderGeometry(game.seaRadius,game.seaRadius,game.seaLength,60,10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  geom.mergeVertices();
  var l = geom.vertices.length;

  this.waves = [];

  for (var i=0;i<l;i++){
    var v = geom.vertices[i];
    //v.y = Math.random()*30;
    this.waves.push({y:v.y,
                     x:v.x,
                     z:v.z,
                     ang:Math.random()*Math.PI*2,
                     amp:game.wavesMinAmp + Math.random()*(game.wavesMaxAmp-game.wavesMinAmp),
                     speed:game.wavesMinSpeed + Math.random()*(game.wavesMaxSpeed - game.wavesMinSpeed)
                    });
  };
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.green,
    transparent:true,
    opacity:1,
    shading:THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.name = "waves";
  this.mesh.receiveShadow = true;

}

Sea.prototype.moveWaves = function (min,max){
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++){
    var v = verts[i];
    var vprops = this.waves[i];
    
    v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
    if(min>0)
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp*(min*7.5);
    else
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;

    vprops.ang += vprops.speed*deltaTime;
    this.mesh.geometry.verticesNeedUpdate=true;
  }
}

Cloud = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "cloud";
  //var geom = new THREE.CubeGeometry(20,18,20);
  var geom = new THREE.TetrahedronGeometry(8.5,2);
 // var geom = new THREE.TetrahedronGeometry(4,4)
  
  /*
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.white,

  });
  */
 var mat = new THREE.MeshPhongMaterial({
  color:Colors.white,
  shininess:0,
  specular:0xffffff,
  shading:THREE.FlatShading,
  opacity: 0.8  
});



  //*
  var nBlocs = 14+Math.floor(Math.random()*6);
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(geom.clone(), mat);
    m.position.x = i*3;
    m.position.y = Math.random()*10;
    m.position.z = Math.random()*50;
    m.rotation.z = Math.random()*Math.PI*0.2;
    m.rotation.y = Math.random()*Math.PI*0.2;
    var s = .4 + Math.random()*.9;
    m.scale.set(s,s,s);
    this.mesh.add(m);
    m.castShadow = true;
    m.receiveShadow = true;

  }
  //*/
}

Cloud.prototype.rotate = function(){
  var l = this.mesh.children.length;
  for(var i=0; i<l; i++){
    var m = this.mesh.children[i];
    m.rotation.z+= Math.random()*.002*(i+0.5);
    m.rotation.y+= Math.random()*.0001*(i+0.5);
  }
}

Ennemy = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "ennemy";
  var geom = new THREE.TetrahedronGeometry(10,3);
  var mat = new THREE.MeshLambertMaterial({
    color: 0x949494,
    side: THREE.DoubleSide,
    wireframe: true
});
  //this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
  
  //var geom = new THREE.TetrahedronGeometry(10,4)
  
  //*
  var nBlocs = 6+Math.floor(Math.random()*12);
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(geom.clone(), mat);
    m.castShadow = true;
    m.position.x = i*3;
    m.position.y = Math.random()*5;
    m.position.z = Math.random()*25;
    m.rotation.z = Math.random()*Math.PI*1.5;
    m.rotation.y = Math.random()*Math.PI*1.5;
    var s = .2 + Math.random()*.9;
    m.scale.set(s,s,s);
    this.mesh.add(m);
    m.castShadow = true;
    m.receiveShadow = true;

  }
  
}

EnnemiesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.ennemiesInUse = [];
}

EnnemiesHolder.prototype.spawnEnnemies = function(min,max){
  var nEnnemies = game.level*2;
  //var nEnnemies = 2; //numero de nubes negras fijo

  for (var i=0; i<nEnnemies; i++){
    var ennemy;
    if (ennemiesPool.length) {
      ennemy = ennemiesPool.pop();
    }else{
      ennemy = new Ennemy();
    }

    ennemy.angle = - (i*0.1);
    ennemy.distance = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight);
    ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
    
    ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;

    this.mesh.add(ennemy.mesh);
    this.ennemiesInUse.push(ennemy);
  }
}

EnnemiesHolder.prototype.rotateEnnemies = function(min,max){
  for (var i=0; i<this.ennemiesInUse.length; i++){
    var ennemy = this.ennemiesInUse[i];
    ennemy.angle += game.speed*deltaTime*game.ennemiesSpeed;

    if (ennemy.angle > Math.PI*2) ennemy.angle -= Math.PI*2;
    
    
    ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
    
    //ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance-20;
    if(min>1)
    ennemy.mesh.position.y -= (min*100/2);
    
    ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
    //ennemy.mesh.rotation.z -= Math.random()*.1;
    
    
    var diffPos = airplane.mesh.position.clone().sub(ennemy.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.ennemyDistanceTolerance){
      particlesHolder.spawnParticles(ennemy.mesh.position.clone(), 15, 0x333333, 3);

      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      game.planeCollisionSpeedX = 100 * diffPos.x / d;
      game.planeCollisionSpeedY = 100 * diffPos.y / d;
      ambientLight.intensity = 2;

      removeEnergy();
      ouch.play();
      $('#energy').fadeIn().delay(2500).fadeOut();
      i--;
    }else if (ennemy.angle > Math.PI){
      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      i--;
    }
  }
}

Particle = function(){
  var geom = new THREE.TetrahedronGeometry(3,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0x7FFF00,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
}

Particle.prototype.explode = function(pos, color, scale){
  var _this = this;
  var _p = this.mesh.parent;
  this.mesh.material.color = new THREE.Color( color);
  this.mesh.material.needsUpdate = true;
  this.mesh.scale.set(scale, scale, scale);
  var targetX = pos.x + (-1 + Math.random()*2)*50;
  var targetY = pos.y + (-1 + Math.random()*2)*50;
  var speed = .6+Math.random()*.2;
  TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
  TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
  TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
      if(_p) _p.remove(_this.mesh);
      _this.mesh.scale.set(1,1,1);
      particlesPool.unshift(_this);
    }});
}

ParticlesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.particlesInUse = [];
}

ParticlesHolder.prototype.spawnParticles = function(pos, density, color, scale){

  var nPArticles = density;
  for (var i=0; i<nPArticles; i++){
    var particle;
    if (particlesPool.length) {
      particle = particlesPool.pop();
    }else{
      particle = new Particle();
    }
    this.mesh.add(particle.mesh);
    particle.mesh.visible = true;
    var _this = this;
    particle.mesh.position.y = pos.y;
    particle.mesh.position.x = pos.x;
    particle.explode(pos,color, scale);
  }
}
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
    color: 0xe07a57,
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
  
Coin = function(){
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
    this.mesh.scale.set(1.2,1.2,1.2);
    this.body.traverse(function(object) {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
}

CoinsHolder = function (nCoins){
  this.mesh = new THREE.Object3D();
  this.coinsInUse = [];
  this.coinsPool = [];
  for (var i=0; i<nCoins; i++){
    var coin = new Coin();
    this.coinsPool.push(coin);
  }
}

CoinsHolder.prototype.spawnCoins = function(){

  var nCoins = 1 + Math.floor(Math.random()*4);
  var d = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-40);
  var amplitude = 10 + Math.round(Math.random()*10);
  for (var i=0; i<nCoins; i++){
    var coin;
    if (this.coinsPool.length) {
      coin = this.coinsPool.pop();
    }else{
      coin = new Coin();
    }
    this.mesh.add(coin.mesh);
    this.coinsInUse.push(coin);
    coin.angle = - (i*0.02);
    coin.distance = d + Math.cos(i*.5)*amplitude;
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
  }
}

CoinsHolder.prototype.rotateCoins = function(min,max){
  for (var i=0; i<this.coinsInUse.length; i++){
    var coin = this.coinsInUse[i];
    if (coin.exploding) continue;
    coin.angle += game.speed*deltaTime*game.coinsSpeed;
    if (coin.angle>Math.PI*2) coin.angle -= Math.PI*2;
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance+50;
    if(min>1)
    coin.mesh.position.y -= (min*90/2);
    coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
    coin.mesh.rotation.z += Math.random()*.1;
    coin.mesh.rotation.y += Math.random()*.1;
    
    //var globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
    var diffPos = airplane.mesh.position.clone().sub(coin.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.coinDistanceTolerance){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, 0x7FFF00, .8);
      addEnergy();
      i--;
    }else if (coin.angle > Math.PI){
      this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      i--;
    }
  }
}
var sunSphere;
var skySun;
//create sun
function sun(){
  skySun = new THREE.Sky();
  skySun.scale.setScalar( 450000);
  skySun.material.uniforms.turbidity.value =1;//1
  skySun.material.uniforms.rayleigh.value = 0.0511; //menos es mas oscuro 2:noche, 1:tarde
  skySun.material.uniforms.luminance.value = 0.0111;//tarde:0.001
  skySun.material.uniforms.mieCoefficient.value = 0.0513//0.1:esfera mas iluminada sol
  skySun.material.uniforms.mieDirectionalG.value = 0.146785;
  
  scene.add( skySun );

  sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 200000, 16, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xfffb85 } )
  );
  sunSphere.visible = false;
  scene.add( sunSphere );
  
  var theta = Math.PI * ( -0.03 );
  var phi = 2 * Math.PI * ( -.25 );

  sunSphere.position.x = 90000 * Math.cos( phi );
  sunSphere.position.y = 80500 * Math.sin( phi ) * Math.sin( theta );//posicion de la esfera
  sunSphere.position.z = 90000* Math.sin( phi ) * Math.cos( theta );
  
  skySun.material.uniforms.sunPosition.value.copy( sunSphere.position );
}

// 3D Models
var sea;
var airplane;

function createPlane(){
  /*CREATE FLYNG CARROT  */
  airplane=new Carrot();
  airplane.mesh.scale.set(1.65,1.65,1.65);
  /**END FLYNG CARROT */
  /**CREATE AIR PLANE */
  //airplane = new AirPlane();
  //airplane.mesh.scale.set(.25,.25,.25);
  /**END CREATE AIRPLANE */
  airplane.mesh.position.y = game.planeDefaultHeight;
    
    scene.add(airplane.mesh);
  }

function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -game.seaRadius;
  scene.add(sea.mesh);
}

function createThrees(){
  forest = new Forest();
  forest.mesh.position.y = -game.seaRadius;
  scene.add(forest.mesh);
}

const zoom = 2;
const threeHeights = [60,65,85];

var Cactus=function(){
  this.mesh = new THREE.Group();
  var geometry = new THREE.BoxGeometry( .25, .15, .05 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0} );
this.mesh = new THREE.Mesh( geometry, material );

var leafShape = new THREE.Shape();
leafShape.quadraticCurveTo(0, 5.5, 10, 5.5);
leafShape.quadraticCurveTo(0, -5.5, 0, 2);

var extrudeSettings = {
steps: 1,
amount: .005,
bevelEnabled: true,
bevelThickness: .025,
bevelSize: .50,
bevelSegments: .5
};

var geometry = new THREE.ExtrudeGeometry( leafShape, extrudeSettings );
var material = new THREE.MeshLambertMaterial( { color: Colors.yellow } );
var Leaf = new THREE.Mesh( geometry, material);
Leaf.scale.set(.025, .025, 1);
Leaf.rotation.set(-1.3, 0, 0);
this.mesh.add(Leaf);

newLeaf = Leaf.clone();
newLeaf.rotation.set(-1.5, -1, 0);
//newLeaf.position.set(.15, 0, .15);
this.mesh.add(newLeaf);

newLeaf = Leaf.clone();
newLeaf.rotation.set(-1.5, -2, .01);
this.mesh.add(newLeaf);

newLeaf = Leaf.clone();
newLeaf.rotation.set(-1.5, -3.25, .01);
this.mesh.add(newLeaf);

newLeaf = Leaf.clone();
newLeaf.rotation.set(-10.5, -6.25, .01);
this.mesh.add(newLeaf);

 newLeaf = Leaf.clone();
newLeaf.rotation.set(-12.5, -7.25, .01);
this.mesh.add(newLeaf);

 newLeaf = Leaf.clone();
newLeaf.rotation.set(-10.5, -6.25, .01);
this.mesh.add(newLeaf);

  newLeaf = Leaf.clone();
newLeaf.rotation.set(-6.5, -2, .01);
this.mesh.add(newLeaf);

 newLeaf = Leaf.clone();
newLeaf.rotation.set(1.9, 3, .01);
this.mesh.add(newLeaf);
//this.mesh.castShadow = true;
this.mesh.receiveShadow = false;


}

Tree = function () {

	this.mesh = new THREE.Object3D();

	var matTreeLeaves = new THREE.MeshPhongMaterial( { color:Colors.green, shading:THREE.FlatShading});

	var geonTreeBase = new THREE.BoxGeometry( 10,20,10 );
	var matTreeBase = new THREE.MeshBasicMaterial( { color:Colors.brown});
	var treeBase = new THREE.Mesh(geonTreeBase,matTreeBase);
	treeBase.castShadow = true;
	treeBase.receiveShadow = true;
	this.mesh.add(treeBase);

	var geomTreeLeaves1 = new THREE.CylinderGeometry(1, 12*3, 12*3, 4 );
	var treeLeaves1 = new THREE.Mesh(geomTreeLeaves1,matTreeLeaves);
	treeLeaves1.castShadow = true;
	treeLeaves1.receiveShadow = true;
	treeLeaves1.position.y = 20
	this.mesh.add(treeLeaves1);

	var geomTreeLeaves2 = new THREE.CylinderGeometry( 1, 9*3, 9*3, 4 );
	var treeLeaves2 = new THREE.Mesh(geomTreeLeaves2,matTreeLeaves);
	treeLeaves2.castShadow = true;
	treeLeaves2.position.y = 40;
	treeLeaves2.receiveShadow = true;
	this.mesh.add(treeLeaves2);

	var geomTreeLeaves3 = new THREE.CylinderGeometry( 1, 6*3, 6*3, 4);
	var treeLeaves3 = new THREE.Mesh(geomTreeLeaves3,matTreeLeaves);
	treeLeaves3.castShadow = true;
	treeLeaves3.position.y = 55;
	treeLeaves3.receiveShadow = true;
	this.mesh.add(treeLeaves3);

}

Flower = function () {

	this.mesh = new THREE.Object3D();

	var geomStem = new THREE.BoxGeometry( 5,50,5,1,1,1 );
	var matStem = new THREE.MeshPhongMaterial( { color:Colors.green, shading:THREE.FlatShading});
	var stem = new THREE.Mesh(geomStem,matStem);
	stem.castShadow = false;
	stem.receiveShadow = true;
	this.mesh.add(stem);


	var geomPetalCore = new THREE.BoxGeometry(10,10,10,1,1,1);
	var matPetalCore = new THREE.MeshPhongMaterial({color:Colors.yellow, shading:THREE.FlatShading});
	petalCore = new THREE.Mesh(geomPetalCore, matPetalCore);
	//petalCore.castShadow = false;
	petalCore.receiveShadow = true;

	var petalColor = petalColors [Math.floor(Math.random()*3)];

	var geomPetal = new THREE.BoxGeometry( 15,20,5,1,1,1 );
	var matPetal = new THREE.MeshBasicMaterial( { color:petalColor});
	geomPetal.vertices[5].y-=4;
	geomPetal.vertices[4].y-=4;
	geomPetal.vertices[7].y+=4;
	geomPetal.vertices[6].y+=4;
	geomPetal.translate(12.5,0,3);

		var petals = [];
		for(var i=0; i<4; i++){	

			petals[i]=new THREE.Mesh(geomPetal,matPetal);
			petals[i].rotation.z = i*Math.PI/2;
			petals[i].castShadow = true;
			petals[i].receiveShadow = true;
		}

	petalCore.add(petals[0],petals[1],petals[2],petals[3]);
	petalCore.position.y = 25;
	petalCore.position.z = 3;
	this.mesh.add(petalCore);

}

var petalColors = [Colors.red, Colors.yellow, Colors.blue];



Forest = function(){

	this.mesh = new THREE.Object3D();

	// Number of Trees
	this.nTrees = 300;

	// Space the consistenly
	var stepAngle = Math.PI*2 / this.nTrees;

	// Create the Trees

	for(var i=0; i<this.nTrees; i++){
	
		var t = new Tree();

		//set rotation and position using trigonometry
		var a = stepAngle*i;
		// this is the distance between the center of the axis and the tree itself
		var h = 805;
		t.mesh.position.y = Math.sin(a)*h;
		t.mesh.position.x = Math.cos(a)*h;		

		// rotate the tree according to its position
		t.mesh.rotation.z = a + (Math.PI/2)*3;

		//Andreas Trigo funtime
		//t.mesh.rotation.z = Math.atan2(t.mesh.position.y, t.mesh.position.x)-Math.PI/2;

		// random depth for the tree on the z-axis
		t.mesh.position.z = 100-Math.random()*750;

		// random scale for each tree
		var s = .3+Math.random()*.75;
		t.mesh.scale.set(s,s,s);

		this.mesh.add(t.mesh);
	}

	// Number of Trees
	this.nFlowers = 350;

	var stepAngle = Math.PI*2 / this.nFlowers;


	for(var i=0; i<this.nFlowers; i++){	

		var f = new Flower();
		var a = stepAngle*i;

		var h = 805;
		f.mesh.position.y = Math.sin(a)*h;
		f.mesh.position.x = Math.cos(a)*h;		

		f.mesh.rotation.z = a + (Math.PI/2)*3;

		f.mesh.position.z = 100-Math.random()*750;

		var s = .1+Math.random()*.3;
		f.mesh.scale.set(s,s,s);

		this.mesh.add(f.mesh);
	}

}
Land = function(){
	var geom = new THREE.CylinderGeometry(800,800,1700,40,10);
	//rotate on the x axis
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	//create a material
	var mat = new THREE.MeshPhongMaterial({
		color: Colors.lightgreen,
		shading:THREE.FlatShading,
	});

	//create a mesh of the object
	this.mesh = new THREE.Mesh(geom, mat);
	//receive shadows
	this.mesh.receiveShadow = true;
}

Orbit = function(){

	var geom =new THREE.Object3D();

	this.mesh = geom;
	//this.mesh.add(sun);
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -game.seaRadius;
  scene.add(sky.mesh);
}

function createCoins(){

  coinsHolder = new CoinsHolder(3);
  scene.add(coinsHolder.mesh)
}

function createEnnemies(){
  for (var i=0; i<10; i++){
    var ennemy = new Ennemy();
    ennemiesPool.push(ennemy);
  }
  ennemiesHolder = new EnnemiesHolder();
  //ennemiesHolder.mesh.position.y = -game.seaRadius;
  scene.add(ennemiesHolder.mesh)
}

function createParticles(){
  for (var i=0; i<10; i++){
    var particle = new Particle();
    particlesPool.push(particle);
  }
  particlesHolder = new ParticlesHolder();
  //ennemiesHolder.mesh.position.y = -game.seaRadius;
  scene.add(particlesHolder.mesh)
}
//edson
/*snow*/
var snow = [];
	var nb = 35;


Snow =function () {
  this.position = new THREE.Vector3();
  this.vel = new THREE.Vector3(-1 * (0.0005 + Math.random() * 0.001),-1 * (0.005 + Math.random() * 0.01), -.1 * (0.005 + Math.random() * 0.01));

  
    this.position.x = Math.random() * 2.85;
    this.position.y = 2.6;
    this.position.z = -400.47 + Math.random() * 2;
  

  
    this.mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1),
      new THREE.MeshPhongMaterial({
        color: 0xfafafa
      })
   ); 
    this.mesh.position.copy(this.position);
    this.mesh.scale.set(0.02,0.02,0.02);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    //scene.add(this.mesh);
  
/*
  this.update = function() {
    if (this.position.y < 0)
      this.position.y = 2.6;
    if (this.position.x < 0 || this.position.x > 2.85)
        this.vel.x *= -1;
    if (this.position.z < -2.47 || this.position.z > -.47)
        this.vel.z *= -1;
    this.position.add(this.vel);
    this.mesh.position.copy(this.position);
  }
  */
}

Snow.prototype.updateSnow = function() {
  if (this.position.y < 0)
      this.position.y = 2.6;
    if (this.position.x < 0 || this.position.x > 2.85)
        this.vel.x *= -1;
    if (this.position.z < -2.47 || this.position.z > -.47)
        this.vel.z *= -1;
    this.position.add(this.vel);
    this.mesh.position.copy(this.position);
}
function createSnow(){
  for (var i = 0; i < nb ; i++) {
    var particle = new Snow();
     snow.push(particle);
    scene.add(particle.mesh);
	}
}


function createStars(){
  var totalObjects = 4000;
  var geometry = new THREE.Geometry();

for (i = 0; i < totalObjects; i ++) 
{ 
  var vertex = new THREE.Vector3();
  vertex.x = Math.random()*40000-20000;
  vertex.y = Math.random()*7000-3500;
  vertex.z = Math.random()*1000-3000;
  geometry.vertices.push( vertex );
}

var material = new THREE.ParticleBasicMaterial( { size: 4 });
var particles = new THREE.ParticleSystem( geometry, material );
      
scene.add( particles ); 
}

function createSmoke(){
  var scene = this.scene;

  var textureLoader = new THREE.TextureLoader();
  var smokeParticles = this.smokeParticles = [];

  textureLoader.load('img/clouds.png', function (texture) {
    var smokeMaterial = new THREE.MeshLambertMaterial({
      color: Colors.yellow,
      map: texture,
      transparent: true,
      opacity:0.1
    });
    smokeMaterial.map.minFilter = THREE.LinearFilter;
    var smokeGeometry = new THREE.PlaneBufferGeometry(300, 300);

    var smokeMeshes = [];
    var limit = 150;

    while (limit--) {
      smokeMeshes[limit] = new THREE.Mesh(smokeGeometry, smokeMaterial);
      smokeMeshes[limit].position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100);
      smokeMeshes[limit].rotation.z = Math.random() * 360;
      smokeParticles.push(smokeMeshes[limit]);
      scene.add(smokeMeshes[limit]);
    }
  });
}
//dragonnn
var powerField = document.getElementById('power');
var dragon, pepperBottle,
sneezingRate = 0,
fireRate = 0,
maxSneezingRate = 8,
sneezeDelay = 500,
awaitingSmokeParticles = [],
timeSmoke = 0,
timeFire = 0,
globalSpeedRate = 1,
sneezeTimeout,
powerField;
function sneeze() {
  dragon.sneeze(sneezingRate);
  sneezingRate = 0;
  powerField.innerHTML = "00";
}
function crearDragones(){
  /*
  dragones = new Dragones();
  dragones.mesh.position.y = -game.seaRadius;
  */
 dragon = new Dragon();
 dragon.threegroup.position.y = 80;
 //dragon.threegroup.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 10));
 dragon.threegroup.rotateY (1.5);
  scene.add(dragon.threegroup);
}
Dragones = function(){
  this.mesh = new THREE.Object3D();
  this.nClouds = 16;
  this.clouds = [];
  var stepAngle = Math.PI*2 / this.nClouds;
  for(var i=0; i<this.nClouds; i++){
    var c = new Dragon();
    this.clouds.push(c);
    var a = stepAngle*i;
    var h = game.seaRadius + 22 + Math.random()*24;
    //c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.position.z = -10-Math.random()*250;
    c.mesh.rotation.z = a + Math.PI/2;
    var s = 1+Math.random()*2;
    c.mesh.scale.set(s,s,s);
    this.mesh.add(c.threegroup);
  }
}
Dragones.prototype.moverDragones = function(){
  for(var i=0; i<this.nClouds; i++){
    var c = this.clouds[i];
    //c.rotate();
  }
  this.mesh.rotation.z += game.speed*deltaTime;

}
Dragon = function() {
  this.tailAmplitude = 3;
  this.tailAngle = 0;
  this.tailSpeed = .07;

  this.wingAmplitude = Math.PI / 8;
  this.wingAngle = 0;
  this.wingSpeed = 0.1
  this.isSneezing = false;

  this.threegroup = new THREE.Group(); // this is a sort of container that will hold all the meshes and will be added to the scene;

  // Materials
  var greenMat = new THREE.MeshLambertMaterial({
    color: 0x5da683,
    shading: THREE.FlatShading
  });
  var lightGreenMat = new THREE.MeshLambertMaterial({
    color: 0x95c088,
    shading: THREE.FlatShading
  });

  var yellowMat = new THREE.MeshLambertMaterial({
    color: 0xfdde8c,
    shading: THREE.FlatShading
  });

  var redMat = new THREE.MeshLambertMaterial({
    color: 0xcb3e4c,
    shading: THREE.FlatShading
  });

  var whiteMat = new THREE.MeshLambertMaterial({
    color: 0xfaf3d7,
    shading: THREE.FlatShading
  });

  var brownMat = new THREE.MeshLambertMaterial({
    color: 0x874a5c,
    shading: THREE.FlatShading
  });

  var blackMat = new THREE.MeshLambertMaterial({
    color: 0x403133,
    shading: THREE.FlatShading
  });
  var pinkMat = new THREE.MeshLambertMaterial({
    color: 0xd0838e,
    shading: THREE.FlatShading
  });

  // body
  this.body = new THREE.Group();
  this.belly = makeCube(greenMat, 30, 30, 40, 0, 0, 0, 0, 0, Math.PI / 4);

  // Wings
  this.wingL = makeCube(yellowMat, 5, 30, 20, 15, 15, 0, -Math.PI / 4, 0, -Math.PI / 4);
  this.wingL.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 15, 10));
  this.wingR = this.wingL.clone();
  this.wingR.position.x = -this.wingL.position.x;
  this.wingR.rotation.z = -this.wingL.rotation.z;

  // pike body
  var pikeBodyGeom = new THREE.CylinderGeometry(0, 10, 10, 4, 1);
  this.pikeBody1 = new THREE.Mesh(pikeBodyGeom, greenMat);
  this.pikeBody1.scale.set(.2, 1, 1);
  this.pikeBody1.position.z = 10;
  this.pikeBody1.position.y = 26;

  this.pikeBody2 = this.pikeBody1.clone();
  this.pikeBody2.position.z = 0
  this.pikeBody3 = this.pikeBody1.clone();
  this.pikeBody3.position.z = -10;

  // tail
  this.tail = new THREE.Group();
  this.tail.position.z = -20;
  this.tail.position.y = 10;

  var tailMat = new THREE.LineBasicMaterial({
    color: 0x5da683,
    linewidth: 5
  });

  var tailGeom = new THREE.Geometry();
  tailGeom.vertices.push(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 5, -10),
    new THREE.Vector3(0, -5, -20),
    new THREE.Vector3(0, 0, -30)
  );

  this.tailLine = new THREE.Line(tailGeom, tailMat);

  // pike
  var pikeGeom = new THREE.CylinderGeometry(0, 10, 10, 4, 1);
  pikeGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  this.tailPike = new THREE.Mesh(pikeGeom, yellowMat);
  this.tailPike.scale.set(.2, 1, 1);
  this.tailPike.position.z = -35;
  this.tailPike.position.y = 0;

  this.tail.add(this.tailLine);
  this.tail.add(this.tailPike);

  this.body.add(this.belly);
  this.body.add(this.wingL);
  this.body.add(this.wingR);
  this.body.add(this.tail);
  this.body.add(this.pikeBody1);
  this.body.add(this.pikeBody2);
  this.body.add(this.pikeBody3);

  // head
  this.head = new THREE.Group();

  // head face
  this.face = makeCube(greenMat, 60, 50, 80, 0, 25, 40, 0, 0, 0);
  
  
  // head horn
  var hornGeom = new THREE.CylinderGeometry(0, 6, 10, 4, 1);
  this.hornL = new THREE.Mesh(hornGeom, yellowMat);
  this.hornL.position.y = 55;
  this.hornL.position.z = 10;
  this.hornL.position.x = 10;

  this.hornR = this.hornL.clone();
  this.hornR.position.x = -10;

  // head ears
  this.earL = makeCube(greenMat, 5, 10, 20, 32, 42, 2, 0, 0, 0);
  this.earL.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 5, -10));
  this.earL.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 4));
  this.earL.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 4));

  this.earR = makeCube(greenMat, 5, 10, 20, -32, 42, 2, 0, 0, 0);
  this.earR.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 5, -10));
  this.earR.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 4));
  this.earR.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI / 4));

  // head mouth
  this.mouth = new THREE.Group();
  this.mouth.position.z = 50;
  this.mouth.position.y = 3;
  this.mouth.rotation.x = 0//Math.PI / 8;

  // head mouth jaw
  this.jaw = makeCube(greenMat, 30, 10, 30, 0, -5, 15, 0, 0, 0);
  this.mouth.add(this.jaw);

  // head mouth tongue
  this.tongue = makeCube(redMat, 20, 10, 20, 0, -3, 15, 0, 0, 0);
  this.mouth.add(this.tongue);
  
  // head smile
  var smileGeom = new THREE.TorusGeometry( 6, 2, 2, 10, Math.PI );
  this.smile = new THREE.Mesh(smileGeom, blackMat);
  this.smile.position.z = 82;  
  this.smile.position.y = 5;
  this.smile.rotation.z = -Math.PI;
  

  // head cheek
  this.cheekL = makeCube(lightGreenMat, 4, 20, 20, 30, 18, 55, 0, 0, 0);
  this.cheekR = this.cheekL.clone();
  this.cheekR.position.x = -this.cheekL.position.x;
  
  //head spots
  this.spot1 = makeCube(lightGreenMat, 2, 2, 2, 20, 16, 80, 0, 0, 0);
  
  this.spot2 = this.spot1.clone();
  this.spot2.position.x = 15;
  this.spot2.position.y = 14;
  
  this.spot3 = this.spot1.clone();
  this.spot3.position.x = 16;
  this.spot3.position.y = 20;
  
  this.spot4 = this.spot1.clone();
  this.spot4.position.x = 12;
  this.spot4.position.y = 18;
  
    
  this.spot5 = this.spot1.clone();
  this.spot5.position.x = -15;
  this.spot5.position.y = 14;
  
  this.spot6 = this.spot1.clone();
  this.spot6.position.x = -14;
  this.spot6.position.y = 20;
  
  this.spot7 = this.spot1.clone();
  this.spot7.position.x = -19;
  this.spot7.position.y = 17;
  
  this.spot8 = this.spot1.clone();
  this.spot8.position.x = -11;
  this.spot8.position.y = 17;
  
  
  // head eye
  this.eyeL = makeCube(whiteMat, 10, 22, 22, 27, 34, 18, 0, 0, 0);
  this.eyeR = this.eyeL.clone();
  this.eyeR.position.x = -27;

  // head iris
  this.irisL = makeCube(brownMat, 10, 12, 12, 28, 30, 24, 0, 0, 0);
  this.irisR = this.irisL.clone();
  this.irisR.position.x = -this.irisL.position.x;

  // head nose
  this.noseL = makeCube(blackMat, 5, 5, 8, 5, 40, 77, 0, 0, 0);
  this.noseR = this.noseL.clone();
  this.noseR.position.x = -this.noseL.position.x;

  this.head.position.z = 30;
  this.head.add(this.face);
  this.head.add(this.hornL);
  this.head.add(this.hornR);
  this.head.add(this.earL);
  this.head.add(this.earR);
  this.head.add(this.mouth);
  this.head.add(this.eyeL);
  this.head.add(this.eyeR);
  this.head.add(this.irisL);
  this.head.add(this.irisR);
  this.head.add(this.noseL);
  this.head.add(this.noseR);
  this.head.add(this.cheekL);
  this.head.add(this.cheekR);
  this.head.add(this.smile);
  /*
  this.head.add(this.spot1);
  this.head.add(this.spot2);
  this.head.add(this.spot3);
  this.head.add(this.spot4);
  this.head.add(this.spot5);
  this.head.add(this.spot6);
  this.head.add(this.spot7);
  this.head.add(this.spot8);
  */
  // legs
  this.legFL = makeCube(greenMat, 20, 10, 20, 20, -30, 15, 0, 0, 0);
  this.legFR = this.legFL.clone();
  this.legFR.position.x = -30;
  this.legBL = this.legFL.clone();
  this.legBL.position.z = -15;
  this.legBR = this.legBL.clone();
  this.legBR.position.x = -30;

  this.threegroup.add(this.body);
  this.threegroup.add(this.head);
  this.threegroup.add(this.legFL);
  this.threegroup.add(this.legFR);
  this.threegroup.add(this.legBL);
  this.threegroup.add(this.legBR);
  //this.threegroup.add(this.pike);

  this.threegroup.traverse(function(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}

Dragon.prototype.update = function() {

  this.tailAngle += this.tailSpeed/globalSpeedRate;
  this.wingAngle += this.wingSpeed/globalSpeedRate;
  for (var i = 0; i < this.tailLine.geometry.vertices.length; i++) {
    var v = this.tailLine.geometry.vertices[i];
    v.y = Math.sin(this.tailAngle - (Math.PI / 3) * i) * this.tailAmplitude * i * i;
    v.x = Math.cos(this.tailAngle / 2 + (Math.PI / 10) * i) * this.tailAmplitude * i * i;
    if (i == this.tailLine.geometry.vertices.length - 1) {
      this.tailPike.position.x = v.x;
      this.tailPike.position.y = v.y;
      this.tailPike.rotation.x = (v.y / 30);
    }
  }
  this.tailLine.geometry.verticesNeedUpdate = true;

  this.wingL.rotation.z = -Math.PI / 4 + Math.cos(this.wingAngle) * this.wingAmplitude;
  this.wingR.rotation.z = Math.PI / 4 - Math.cos(this.wingAngle) * this.wingAmplitude;
}

Dragon.prototype.prepareToSneeze = function(s) {
  var _this = this;
  var speed = .7*globalSpeedRate;
  TweenLite.to(this.head.rotation, speed, {
    x: -s * .12,
    ease: Back.easeOut
  });
  TweenLite.to(this.head.position, speed, {
    z: 30 - s * 2.2,
    y: s * 2.2,
    ease: Back.easeOut
  });
  TweenLite.to(this.mouth.rotation, speed, {
    x: s * .18,
    ease: Back.easeOut
  });
  
  TweenLite.to(this.smile.position, speed/2, {
    z:75,
    y:10,
    ease: Back.easeOut
  });
  TweenLite.to(this.smile.scale, speed/2, {
    x:0, y:0,
    ease: Back.easeOut
  });
  
  TweenMax.to(this.noseL.scale, speed, {
    x: 1 + s * .1,
    y: 1 + s * .1,
    ease: Back.easeOut
  });
  TweenMax.to(this.noseR.scale, speed, {
    x: 1 + s * .1,
    y: 1 + s * .1,
    ease: Back.easeOut
  });
  TweenMax.to(this.eyeL.scale, speed, {
    y: 1 + s * .01,
    ease: Back.easeOut
  });
  TweenMax.to(this.eyeR.scale, speed, {
    y: 1 + s * .01,
    ease: Back.easeOut
  });
  TweenMax.to(this.irisL.scale, speed, {
    y: 1 + s * .05,
    z: 1 + s * .05,
    ease: Back.easeOut
  });
  TweenMax.to(this.irisR.scale, speed, {
    y: 1 + s * .05,
    z: 1 + s * .05,
    ease: Back.easeOut
  });
  TweenMax.to(this.irisL.position, speed, {
    y: 30 + s * .8,
    z: 24 - s * .4,
    ease: Back.easeOut
  });
  TweenMax.to(this.irisR.position, speed, {
    y: 30 + s * .8,
    z: 24 - s * .4,
    ease: Back.easeOut
  });
  TweenMax.to(this.earL.rotation, speed, {
    x: -s * .1,
    y: -s * .1,
    ease: Back.easeOut
  });
  TweenMax.to(this.earR.rotation, speed, {
    x: -s * .1,
    y: s * .1,
    ease: Back.easeOut
  });
  TweenMax.to(this.wingL.rotation, speed, {
    z: -Math.PI / 4 - s * .1,
    ease: Back.easeOut
  });
  TweenMax.to(this.wingR.rotation, speed, {
    z: Math.PI / 4 + s * .1,
    ease: Back.easeOut
  });
  TweenMax.to(this.body.rotation, speed, {
    x: -s * .05,
    ease: Back.easeOut
  });
  TweenMax.to(this.body.scale, speed, {
    y: 1 + s * .01,
    ease: Back.easeOut
  });
  TweenMax.to(this.body.position, speed, {
    z: -s * 2,
    ease: Back.easeOut
  });

  TweenMax.to(this.tail.rotation, speed, {
    x: s * 0.1,
    ease: Back.easeOut
  });

}

Dragon.prototype.sneeze = function(s) {
  var _this = this;
  var sneezeEffect = 1 - (s / maxSneezingRate);
  var speed = .1*globalSpeedRate;
  timeFire = Math.round(s * 10);

  TweenLite.to(this.head.rotation, speed, {
    x: s * .05,
    ease: Back.easeOut
  });
  TweenLite.to(this.head.position, speed, {
    z: 30 + s * 2.4,
    y: -s * .4,
    ease: Back.easeOut
  });

  TweenLite.to(this.mouth.rotation, speed, {
    x: 0,
    ease: Strong.easeOut
  });
  
  TweenLite.to(this.smile.position, speed*2, {
    z:82,
    y:5,
    ease: Strong.easeIn
  });
  
  TweenLite.to(this.smile.scale, speed*2, {
    x:1,
    y:1,
    ease: Strong.easeIn
  });
  

  TweenMax.to(this.noseL.scale, speed, {
    y: sneezeEffect,
    ease: Strong.easeOut
  });
  TweenMax.to(this.noseR.scale, speed, {
    y: sneezeEffect,
    ease: Strong.easeOut
  });
  TweenMax.to(this.noseL.position, speed, {
    y: 40, // - (sneezeEffect * 5),
    ease: Strong.easeOut
  });
  TweenMax.to(this.noseR.position, speed, {
    y: 40, // - (sneezeEffect * 5),
    ease: Strong.easeOut
  });
  TweenMax.to(this.irisL.scale, speed, {
    y: sneezeEffect/2,
    z: 1,
    ease: Strong.easeOut
  });
  TweenMax.to(this.irisR.scale, speed, {
    y: sneezeEffect/2,
    z: 1,
    ease: Strong.easeOut
  });
  TweenMax.to(this.eyeL.scale, speed, {
    y: sneezeEffect/2,
    ease: Back.easeOut
  });
  TweenMax.to(this.eyeR.scale, speed, {
    y: sneezeEffect/2,
    ease: Back.easeOut
  });

  TweenMax.to(this.wingL.rotation, speed, {
    z: -Math.PI / 4 + s * .15,
    ease: Back.easeOut
  });
  TweenMax.to(this.wingR.rotation, speed, {
    z: Math.PI / 4 - s * .15,
    ease: Back.easeOut
  });

  TweenMax.to(this.body.rotation, speed, {
    x: s * 0.02,
    ease: Back.easeOut
  });
  TweenMax.to(this.body.scale, speed, {
    y: 1 - s * .03,
    ease: Back.easeOut
  });
  TweenMax.to(this.body.position, speed, {
    z: s * 2,
    ease: Back.easeOut
  });

  TweenMax.to(this.irisL.position, speed*7, {
    y: 35,
    ease: Back.easeOut
  });
  TweenMax.to(this.irisR.position, speed*7, {
    y: 35,
    ease: Back.easeOut
  });
  TweenMax.to(this.earR.rotation, speed*3, {
    x: s * .20,
    y: s * .20,
    ease: Back.easeOut
  });
  TweenMax.to(this.earL.rotation, speed*3, {
    x: s * .20,
    y: -s * .20,
    ease: Back.easeOut,
    onComplete: function() {
      _this.backToNormal(s);
      fireRate = s;
      console.log(fireRate);
    }
  });

  TweenMax.to(this.tail.rotation, speed*3, {
    x: -s * 0.1,
    ease: Back.easeOut
  });

}

Dragon.prototype.backToNormal = function(s) {
  var _this = this;
  var speed = 1*globalSpeedRate;
  TweenLite.to(this.head.rotation, speed, {
    x: 0,
    ease: Strong.easeInOut
  });
  TweenLite.to(this.head.position, speed, {
    z: 30,
    y: 0,
    ease: Back.easeOut
  });
  TweenMax.to(this.noseL.scale, speed, {
    x: 1,
    y: 1,
    ease: Strong.easeInOut
  });
  TweenMax.to(this.noseR.scale, speed, {
    x: 1,
    y: 1,
    ease: Strong.easeInOut
  });
  TweenMax.to(this.noseL.position, speed, {
    y: 40,
    ease: Strong.easeInOut
  });
  TweenMax.to(this.noseR.position, speed, {
    y: 40,
    ease: Strong.easeInOut
  });
  TweenMax.to(this.irisL.scale, speed, {
    y: 1,
    z: 1,
    ease: Back.easeOut
  });
  TweenMax.to(this.irisR.scale, speed, {
    y: 1,
    z: 1,
    ease: Back.easeOut
  });
  TweenMax.to(this.irisL.position, speed*.7, {
    y: 30,
    ease: Back.easeOut
  });
  TweenMax.to(this.irisR.position, speed*.7, {
    y: 30,
    ease: Back.easeOut
  });
  TweenMax.to(this.eyeL.scale, speed, {
    y: 1,
    ease: Strong.easeOut
  });
  TweenMax.to(this.eyeR.scale, speed, {
    y: 1,
    ease: Strong.easeOut
  });
  TweenMax.to(this.body.rotation, speed, {
    x: 0,
    ease: Back.easeOut
  });
  TweenMax.to(this.body.scale, speed, {
    y: 1,
    ease: Back.easeOut
  });
  TweenMax.to(this.body.position, speed, {
    z: 0,
    ease: Back.easeOut
  });

  TweenMax.to(this.wingL.rotation, speed*1.3, {
    z: -Math.PI / 4,
    ease: Back.easeInOut
  });
  TweenMax.to(this.wingR.rotation, speed*1.3, {
    z: Math.PI / 4,
    ease: Back.easeInOut
  });

  TweenMax.to(this.earL.rotation, speed*1.3, {
    x: 0,
    y: 0,
    ease: Back.easeInOut
  });
  TweenMax.to(this.earR.rotation, speed*1.3, {
    x: 0,
    y: 0,
    ease: Back.easeInOut,
    onComplete: function() {
      _this.isSneezing = false;
      timeSmoke = Math.round(s * 5);
    }
  });

  TweenMax.to(this.tail.rotation, speed*1.3, {
    x: 0,
    ease: Back.easeOut
  });

}

function makeCube(mat, w, h, d, posX, posY, posZ, rotX, rotY, rotZ) {
  var geom = new THREE.BoxGeometry(w, h, d);
  var mesh = new THREE.Mesh(geom, mat);
  mesh.position.x = posX;
  mesh.position.y = posY;
  mesh.position.z = posZ;
  mesh.rotation.x = rotX;
  mesh.rotation.y = rotY;
  mesh.rotation.z = rotZ;
  return mesh;
}



function createDragon() {
  dragon = new Dragon();
  scene.add(dragon.threegroup);
}
SmokeParticle = function() {
  this.color = {
    r: 0,
    g: 0,
    b: 0
  };
  var particleMat = new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: .5,
    shading: THREE.FlatShading
  });
  this.mesh = makeCube(particleMat, 4, 4, 4, 0, 0, 0, 0, 0, 0);
  awaitingSmokeParticles.push(this);
}

SmokeParticle.prototype.initialize = function() {
  this.mesh.rotation.x = 0;
  this.mesh.rotation.y = 0;
  this.mesh.rotation.z = 0;

  this.mesh.position.x = 0;
  this.mesh.position.y = 0;
  this.mesh.position.z = 0;

  this.mesh.scale.x = 1;
  this.mesh.scale.y = 1;
  this.mesh.scale.z = 1;

  this.mesh.material.opacity = .5;
  awaitingSmokeParticles.push(this);
}

SmokeParticle.prototype.updateColor = function() { 
  this.mesh.material.color.setRGB(this.color.r, this.color.g, this.color.b);
}

SmokeParticle.prototype.fly = function() {
  var _this = this;
  var speed = 10*globalSpeedRate;
  var ease = Strong.easeOut;
  var initX = this.mesh.position.x;
  var initY = this.mesh.position.y;
  var initZ = this.mesh.position.z;
  var bezier = {
    type: "cubic",
    values: [{
      x: initX,
      y: initY,
      z: initZ
    }, {
      x: initX + 30 - Math.random() * 10,
      y: initY + 20 + Math.random() * 2,
      z: initZ + 20
    }, {
      x: initX + 10 + Math.random() * 20,
      y: initY + 40 + Math.random() * 5,
      z: initZ - 30
    }, {
      x: initX + 50 - Math.random() * 20,
      y: initY + 70 + Math.random() * 10,
      z: initZ + 20
    }]
  };
  TweenMax.to(this.mesh.position, speed, {
    bezier: bezier,
    ease: ease
  });
  TweenMax.to(this.mesh.rotation, speed, {
    x: Math.random() * Math.PI * 3,
    y: Math.random() * Math.PI * 3,
    ease: ease
  });
  TweenMax.to(this.mesh.scale, speed, {
    x: 5 + Math.random() * 5,
    y: 5 + Math.random() * 5,
    z: 5 + Math.random() * 5,
    ease: ease
  });
  //*
  TweenMax.to(this.mesh.material, speed, {
    opacity: 0,
    ease: ease,
    onComplete: function() {
      _this.initialize();
    }
  });
  //*/
}

SmokeParticle.prototype.fire = function(f) {
  var _this = this;
  var speed = 1*globalSpeedRate;
  var ease = Strong.easeOut;
  var initX = this.mesh.position.x;
  var initY = this.mesh.position.y;
  var initZ = this.mesh.position.z;

  TweenMax.to(this.mesh.position, speed, {
    x: initX+15*f,
    y: initY-2*f,
    z: Math.max(initZ+15*f, initZ+40),
    ease: ease
  });
  TweenMax.to(this.mesh.rotation, speed, {
    x: Math.random() * Math.PI * 3,
    y: Math.random() * Math.PI * 3,
    ease: ease
  });
  
  var bezierScale = [{
      x:1,
      y:1,
      z:1
    },{
      x:f/maxSneezingRate+Math.random()*.3,
      y:f/maxSneezingRate+Math.random()*.3,
      z:f*2/maxSneezingRate+Math.random()*.3
    }, {
      x:f/maxSneezingRate+Math.random()*.5,
      y:f/maxSneezingRate+Math.random()*.5,
      z:f*2/maxSneezingRate+Math.random()*.5
    },{
      x:f*2/maxSneezingRate+Math.random()*.5,
      y:f*2/maxSneezingRate+Math.random()*.5,
      z:f*4/maxSneezingRate+Math.random()*.5
    },{
      x:f*2+Math.random()*5,
      y:f*2+Math.random()*5,
      z:f*2+Math.random()*5
    }];
  
  TweenMax.to(this.mesh.scale, speed * 2, {
    bezier:bezierScale,
    ease: ease,
    onComplete: function() {
      _this.initialize();
    }
  });

  TweenMax.to(this.mesh.material, speed, {
    opacity: 0,
    ease: ease
  });
  //*
  
  var bezierColor = [{
      r: 255 / 255,
      g: 205 / 255,
      b: 74 / 255
    },{
      r: 255 / 255,
      g: 205 / 255,
      b: 74 / 255
    },{
      r: 255 / 255,
      g: 205 / 255,
      b: 74 / 255
    }, {
      r: 247 / 255,
      g: 34 / 255,
      b: 50 / 255
    }, {
      r: 0 / 255,
      g: 0 / 255,
      b: 0 / 255
    }];
  
  
  TweenMax.to(this.color, speed, {
    bezier: bezierColor,
    ease: Strong.easeOut,
    onUpdate: function() {
      _this.updateColor();
    }
  });
  //*/
}

function getSmokeParticle() {
  var p;
  if (!awaitingSmokeParticles.length) {
    p = new SmokeParticle();
  }
  p = awaitingSmokeParticles.pop();
  return p;
}
//end dragoon
//end edson
function loop(){

  newTime = new Date().getTime();
  deltaTime = newTime-oldTime;
  oldTime = newTime;
/* sound vars: */
analyser.getByteFrequencyData(dataArray);

var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

var overallAvg = avg(dataArray);
var lowerMax = max(lowerHalfArray);
var lowerAvg = avg(lowerHalfArray);
var upperMax = max(upperHalfArray);
var upperAvg = avg(upperHalfArray);

var lowerMaxFr = lowerMax / lowerHalfArray.length;
var lowerAvgFr = lowerAvg / lowerHalfArray.length;
var upperMaxFr = upperMax / upperHalfArray.length;
var upperAvgFr = upperAvg / upperHalfArray.length;
/**audio vars */
  if (game.status=="playing"){

    // Add energy coins every 100m;
    if (Math.floor(game.distance)%game.distanceForCoinsSpawn == 0 && Math.floor(game.distance) > game.coinLastSpawn){
      game.coinLastSpawn = Math.floor(game.distance);
      coinsHolder.spawnCoins();
    }

    if (Math.floor(game.distance)%game.distanceForSpeedUpdate == 0 && Math.floor(game.distance) > game.speedLastUpdate){
      game.speedLastUpdate = Math.floor(game.distance);
      game.targetBaseSpeed += game.incrementSpeedByTime*deltaTime;
    }


    if (Math.floor(game.distance)%game.distanceForEnnemiesSpawn == 0 && Math.floor(game.distance) > game.ennemyLastSpawn){
      game.ennemyLastSpawn = Math.floor(game.distance);
      ennemiesHolder.spawnEnnemies(lowerAvgFr,upperAvgFr);
    }

    if (Math.floor(game.distance)%game.distanceForLevelUpdate == 0 && Math.floor(game.distance) > game.levelLastUpdate){
      game.levelLastUpdate = Math.floor(game.distance);
      game.level++;
      fieldLevel.innerHTML = Math.floor(game.level);

      game.targetBaseSpeed = game.initSpeed + game.incrementSpeedByLevel*game.level;
      $('#level').fadeIn().delay(18000).fadeOut();
    }

//make sea move:
//makeRoughGround(sea.mesh, modulate(upperMaxFr, 0, 1, 0.5, 4));

    
    updatePlane(lowerMaxFr,upperAvgFr);
    /*for rocket
    setSmokeCoords();
    updateSmokeArr();
    */
    updateDistance();
    updateEnergy();
    var mouseSpeed=1;
    var calculoSpeed=(mousePos.x / WIDTH)*2500;
    if(calculoSpeed>1)
    mouseSpeed=calculoSpeed ;
  
    game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
    game.speed = game.baseSpeed * game.planeSpeed*mouseSpeed;

    /*
    para sol:
*/
   /*
    if(skySun.material.uniforms.turbidity.value<-10)
    {
        skySun.material.uniforms.turbidity.value=10
    }
    else{
        if(upperAvgFr>0)
    skySun.material.uniforms.turbidity.value-=0.1*(Math.random()*(upperAvgFr/9));
    }
    if(skySun.material.uniforms.rayleigh.value<-10)
    {
        skySun.material.uniforms.rayleigh.value=10
    }
    else{
        if(upperAvgFr>0)
        skySun.material.uniforms.rayleigh.value-=0.1*(Math.random()*(upperAvgFr/9));
    }
    */
    /*var theta = Math.PI * ( -0.03 );
    var phi = 2 * Math.PI * ( -.25 );
    if(upperAvgFr>0)
    sunSphere.position.y+=405000 * Math.sin( phi ) * Math.sin( theta )+(upperAvgFr*1000);
   */
    
    
    
      
     // makeRoughBall(sea.mesh, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
/**end dound */

  }else if(game.status=="gameover"){
    
     
    
    game.speed *= .99;
    //airplane.mesh.rotation.z += (-Math.PI/2 - airplane.mesh.rotation.z)*.0002*deltaTime;
    airplane.mesh.rotation.x += 0.0003*deltaTime;
    game.planeFallSpeed *= 1.05;
    airplane.mesh.position.y -= game.planeFallSpeed*deltaTime;
    
    if (airplane.mesh.position.y <5){
      airplane.mesh.position.y=5;


      //showReplay();
      game.status = "waitingReplay";
      game.energy=0;
      
      //abrir dialog gameover
      $("#open-game-over").fancybox({'modal': true}).trigger('click');
      falla.play();
      motor.stop();
      bgmusic.stop();
      
    }
  }else if (game.status=="waitingReplay"){
    
   
  }


  
//for sea
  //if ( sea.mesh.rotation.z > 2*Math.PI)  sea.mesh.rotation.z -= 2*Math.PI;

  ambientLight.intensity += (.5 - ambientLight.intensity)*deltaTime*0.005;
  if (game.status!="waitingReplay"){
   //for sea
   // sea.mesh.rotation.z += game.speed*deltaTime;//*game.seaRotationSpeed;
  coinsHolder.rotateCoins(lowerMaxFr,upperMaxFr);
  ennemiesHolder.rotateEnnemies(lowerMaxFr,upperMaxFr);
  
    sky.moveClouds(lowerAvgFr,upperAvgFr);
    //only for forest
    land.mesh.rotation.z += .0019*mouseSpeed;
    orbit.mesh.rotation.z += .0011;
    forest.mesh.rotation.z += .0019*mouseSpeed;
     
    ini=-905;
       if(lowerMaxFr>0){
        forest.mesh.position.y=ini-(lowerMaxFr*30);
        land.mesh.position.y=ini-(lowerMaxFr*30);
    }
    
    //dragones.moverDragones();
    //for sea:
    //sea.moveWaves(lowerAvgFr,upperAvgFr);
    //snow.updateSnow();
  }
  renderer.render(scene, camera);
  
  /*para dragon*/
  /*
  if (!dragon.isSneezing) {
    dragon.update();
  }

  if (timeSmoke > 0) {
    //if (timeSmoke%2==0){
    var noseTarget = (Math.random() > .5) ? dragon.noseR : dragon.noseL;
    var p = getSmokeParticle();
    var pos = noseTarget.localToWorld(new THREE.Vector3(0, 0, 2));

    p.mesh.position.x = pos.x;
    p.mesh.position.y = pos.y;
    p.mesh.position.z = pos.z;
    p.mesh.material.color.setHex(0x555555);
    p.mesh.material.opacity = .2;

    scene.add(p.mesh);
    p.fly();
    //}
    timeSmoke--;
  }

  if (timeFire > 0) {
    var noseTarget = (Math.random() > .5) ? dragon.noseL : dragon.noseR;
    var colTarget = (Math.random() > .5) ? 0xfdde8c : 0xcb3e4c;
    var f = getSmokeParticle();
    var posF = noseTarget.localToWorld(new THREE.Vector3(0, 0, 2));

    f.mesh.position.x = posF.x;
    f.mesh.position.y = posF.y;
    f.mesh.position.z = posF.z;
    f.color = {
      r: 255 / 255,
      g: 205 / 255,
      b: 74 / 255
    };
    f.mesh.material.color.setRGB(f.color.r, f.color.g, f.color.b);
    f.mesh.material.opacity = 1;
    
    scene.add(f.mesh);
    f.fire(fireRate);
    timeFire--;
  }
  */
/*end para dragon*/
  requestAnimationFrame(loop);
 
  
}

function updateDistance(){
  game.distance += game.speed*deltaTime*game.ratioSpeedDistance;
  fieldDistance.innerHTML = Math.floor(game.distance);
  distancia_final.innerHTML = 'Millas recorridas: ' + Math.floor(game.distance);
  var d = 502*(1-(game.distance%game.distanceForLevelUpdate)/game.distanceForLevelUpdate);
  levelCircle.setAttribute("stroke-dashoffset", d);

}

var blinkEnergy=false;

function updateEnergy(){
  game.energy -= game.speed*deltaTime*game.ratioSpeedEnergy;
  game.energy = Math.max(0, game.energy);
  energyBar.style.right = (100-game.energy)+"%";
  energyBar.style.backgroundColor = (game.energy<35)? "#f25346" : "#D4F21B";
  
  
  if (game.energy<30){
    energyBar.style.animationName = "blinking";
  }else{
    energyBar.style.animationName = "none";
  }

  if (game.energy <1){
    game.status = "gameover";
  }
}

function addEnergy(){
  game.energy += game.coinValue;
  game.energy = Math.min(game.energy, 100);
  game.zanahorias++;
  zanahorias_final.innerHTML ='🥕:' +game.zanahorias;
   coin.play();
   $('#energy').fadeIn().delay(1000).fadeOut();
 
}

function removeEnergy(){
  game.energy -= game.ennemyValue;
  game.energy = Math.max(0, game.energy);
  if ( game.energy<25 ){
    low.play();
    $('#energy').fadeIn();
  }
}
/*BACK*/
function createMountainsBack(){
  // Load cloud texture
  var loader = new THREE.TextureLoader();
 loader.load("img/mountain4.png", function(texture) {
   cloudGeo = new THREE.PlaneBufferGeometry(8000,2000);
   cloudMaterial = new THREE.MeshLambertMaterial({
     map: texture,
     transparent: true
   }); 
   
var cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
     cloud.position.set(
       0,
       149,
       -980
     ); 
     scene.add(cloud);
 });
}
function createSunBack(){
  // Load cloud texture
  var loaderSun = new THREE.TextureLoader();
 loaderSun.load("img/sun.png", function(texture2) {
   cloudGeoSun = new THREE.PlaneBufferGeometry(326,281);
   cloudMaterialSun = new THREE.MeshLambertMaterial({
     map: texture2,
     transparent: true
   }); 
var cloudSun = new THREE.Mesh(cloudGeoSun,cloudMaterialSun);
cloudSun.position.set(
       0,
       100,
       -180
     ); 
     scene.add(cloudSun);
 });
}
var offSet = -600;
function createForest(){
    forest = new Forest();
    forest.mesh.position.y = offSet;
    scene.add(forest.mesh);
  }
  function createLand(){
    land = new Land();
    land.mesh.position.y = offSet;
    scene.add(land.mesh);
  }
  
  function createOrbit(){
    orbit = new Orbit();
    orbit.mesh.position.y = offSet;
    orbit.mesh.rotation.z = -Math.PI/6; 
    scene.add(orbit.mesh);
  }
/*BACK*/
function updatePlane(min,max){

  game.planeSpeed = normalize(mousePos.x,-.5,.5,game.planeMinSpeed, game.planeMaxSpeed);
  
  var targetY = normalize(mousePos.y,-.75,.75,game.planeDefaultHeight-game.planeAmpHeight, game.planeDefaultHeight+game.planeAmpHeight);
  //if(max>0)
  //var targetX = normalize(mousePos.x*(max),-1,1,-game.planeAmpWidth*.7, -game.planeAmpWidth);
  //else
  var targetX = normalize(mousePos.x,-1,1,-game.planeAmpWidth*.7, -game.planeAmpWidth);

  game.planeCollisionDisplacementX += game.planeCollisionSpeedX;
  targetX += game.planeCollisionDisplacementX;
  if(min>0 )
  airplane.mesh.scale.set(1.05+(min/2),1.05+(min/2),1.05+(min/2));
  else
  airplane.mesh.scale.set(1.65,1.65,1.65);

  game.planeCollisionDisplacementY += game.planeCollisionSpeedY;
  targetY += game.planeCollisionDisplacementY;

  airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*deltaTime*game.planeMoveSensivity;
  airplane.mesh.position.x += (targetX-airplane.mesh.position.x)*deltaTime*game.planeMoveSensivity;

  //airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y)*deltaTime*game.planeRotXSensivity;
  //airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY)*deltaTime*game.planeRotZSensivity;
  var targetCameraZ = normalize(game.planeSpeed, game.planeMinSpeed, game.planeMaxSpeed, game.cameraNearPos, game.cameraFarPos);
  camera.fov = normalize(mousePos.x,-1,1,40, 80);
  camera.updateProjectionMatrix ()
  camera.position.y += (airplane.mesh.position.y - camera.position.y)*deltaTime*game.cameraSensivity*(min/2);

  game.planeCollisionSpeedX += (0-game.planeCollisionSpeedX)*deltaTime * 0.03;
  game.planeCollisionDisplacementX += (0-game.planeCollisionDisplacementX)*deltaTime *0.01;
  game.planeCollisionSpeedY += (0-game.planeCollisionSpeedY)*deltaTime * 0.03;
  game.planeCollisionDisplacementY += (0-game.planeCollisionDisplacementY)*deltaTime *0.01;

  //airplane.pilot.updateHairs();
}

function showReplay(){
  replayMessage.style.display="block";
}

function hideReplay(){
  //replayMessage.style.display="none";
  motor.play();
  //audio.play();
  //bgmusic.play();
}

function normalize(v,vmin,vmax,tmin, tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

var fieldDistance, energyBar, replayMessage, fieldLevel, levelCircle;

var motor = new Howl({
  src: ['sounds/viento.ogg'],
 
  loop: true,
  volume: 0.5,
});
var falla = new Howl({
  src: ['sounds/falla.ogg'],
  
  loop: false,
  volume: 0.5
});
var ouch = new Howl({
  src: ['sounds/ouch.ogg'],
  
  loop: false,
  volume: 0.5
});
var low = new Howl({
  src: ['sounds/low.ogg'],
  html5: true,
  
  loop: false,
  volume: 0.3
});
var coin = new Howl({
  src: ['sounds/coin.mp3'],
  html5: true,
  
  loop: false,
  coin: 0.3
});

function isPlaying(){
  if(low.playing()){
    // console.log('audio is currently playing...');
     low.stop();
     setTimeout(isPlaying, 2000); //adjust timeout to fit your needs
  }
}


function playLow() {
    //check if sound is null, if not stop previous sound and unload it
    if (low != null) {
        low.stop();
        low.unload();
        low = null;
    }
    low = new Howl({
        src: ['sounds/bip.ogg'],
        loop: false,
        volume: 0.3
    });
    low.play();
}
function init(event){

  // UI
  
  fieldDistance = document.getElementById("distValue");
  energyBar = document.getElementById("energyBar");
  replayMessage = document.getElementById("replayMessage");
  fieldLevel = document.getElementById("levelValue");
  levelCircle = document.getElementById("levelCircleStroke");
  //for game over
  zanahorias_final = document.getElementById("zanahorias_final");
  distancia_final= document.getElementById("distancia_final");

  resetGame();
  createScene();
  sun();
  createLights();
  createStars();
  createPlane();
  //createSea();
  createForest();
  createLand();
  createOrbit();
  //crearDragones();
  createSky();
  createCoins();
  createMountainsBack();
  //createSunBack();
  createEnnemies();
  createParticles();
  //audioBgStart();
  //createSnow();
  //createSmoke();

  
  //TuneGenerator();
  
  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener('touchend', handleTouchEnd, false);

  loop();
}

//window.addEventListener('load', init, false);
window.addEventListener("load", function(event) {
  //init();
  //console.log("'Todos los recursos terminaron de cargar!");
  //pausegame();
});

//pause logica




/*
CONTROLES DE RESETEO DE JUEGO Y DIALOGS
*/
function resetGameEds(){
  if (game.status == "waitingReplay" && game.energy==0){
    resetGame();
    hideReplay();
  }
}
