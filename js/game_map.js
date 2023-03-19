    var HEIGHT, WIDTH;
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 1, 10000);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0.0);
  document.getElementById('canvas').appendChild(renderer.domElement);

    // global vars
    var ambientLight, hemisphereLight, shadowLight, shadowLight2;


    function flipCoin() {
        var flip = Math.floor(Math.random()*2);

        if (flip === 1) {
            return Math.ceil(Math.random() * -700) -400;
        } else {
            return Math.ceil(Math.random() * 500) + 200;
        }
    }


    function handleWindowResize() {
        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    }

    function createLights() {
        ambientLight = new THREE.AmbientLight(0xE5D5D5);
        ambientLight.intensity = 0.5;
        hemisphereLight = new THREE.HemisphereLight(0x2F586D, 0x0E4A6D, .7);
        shadowLight = new THREE.DirectionalLight(0xE5CC20, .8);
        shadowLight2 = new THREE.DirectionalLight(0x136D69, 1);



        shadowLight.position.set(200, -350, 0);
        shadowLight2.position.set(-200,500,10);

        shadowLight.castShadow = true;
        shadowLight2.castShadow = true;

        shadowLight.shadow.camera.left = -1400;
        shadowLight.shadow.camera.right = 1400;
        shadowLight.shadow.camera.top = 1400;
        shadowLight.shadow.camera.bottom = -1400;
        shadowLight.shadow.camera.near = 1;
        shadowLight.shadow.camera.far = 1000;

        shadowLight.shadow.mapSize.width = 2048;
        shadowLight.shadow.mapSize.height = 2048;

        scene.add(ambientLight, hemisphereLight, shadowLight, shadowLight2);
    }

    var CreateDistantStars = function() {
        var particleCount = 10000,
            geom = new THREE.Geometry(),
            mat = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 1
            });

        for (var p = 0; p < particleCount; p++){
            var pX = Math.random() * 3000 - 1500,
                pY = Math.random() * 3000 - 1500,
                pZ = flipCoin(),
                particle = new THREE.Vector3(pX, pY, pZ);

            geom.vertices.push(particle);
        }

        this.mesh = new THREE.Points(geom, mat);
    };

    var CreateCloseStars = function() {
        this.mesh = new THREE.Object3D();
        var geom = new THREE.SphereGeometry(2,6,6);
        this.mat = new THREE.MeshPhongMaterial({
            shininess: 100,
            specular: 0xffffff,
            transparent: true
        });

        var star;
        var startCount = 155;

        for (var i = 0; i < startCount; i++) {
            star = new THREE.Mesh(geom, this.mat);
            star.position.x = Math.random() * (WIDTH + 1) - WIDTH/2;
            star.position.y = Math.random() * (HEIGHT + 1) - HEIGHT/2;
            star.position.z = Math.floor(Math.random() * (1200 - 1)) - 1500;
            star.scale.set(.5,.5,.5);
            this.mesh.add( star );
        }
    };

    var closeStars;
    var distantStars

    function createCosmos() {
        distantStars = new CreateDistantStars();
        closeStars = new CreateCloseStars();
        closeStars.mesh.position.set(0,0,0);
        distantStars.mesh.position.set(0,0,0);
        scene.add(distantStars.mesh, closeStars.mesh);
    }

    var Cloud = function() {
        this.mesh = new THREE.Object3D();

        var geom = new THREE.DodecahedronGeometry(4,0);
        var mat = new THREE.MeshPhongMaterial({
            color: 0xD0E3EE,
            shininess: 10,
            shadng: THREE.FlatShading
        });

        var nBlocs = 5+Math.floor(Math.random()*7);

        for (var i = 0; i < nBlocs; i++) {
            var m = new THREE.Mesh(geom, mat);

            m.position.x = Math.sin(i)*3;
            m.position.y = Math.random()*1.1;
            m.position.z = Math.random()*0.7;
            m.rotation.y = Math.random()*Math.PI*1.5;
            m.rotation.z = Math.random()*Math.PI*1.5;

            var s = .3 + Math.random() * .3;
            m.scale.set(s,s,s);

            m.castShadow = true;

            this.mesh.add(m);
        }
    };

    var Sky = function() {
        this.mesh = new THREE.Object3D();

        var Pivot = function() {
            this.mesh = new THREE.Object3D();
            this.mesh.position.set(0,0,0);
        };

        this.mesh.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));

        this.nClouds = 23;

        var stepAngle = Math.PI*2 / this.nClouds;

        for(var i = 0; i<this.nClouds; i++) {
            var p = new Pivot();

            var c = new Cloud();

            var a = stepAngle*i;
            var h = 62 + Math.random()*5;

            c.mesh.position.y = Math.sin(a)*h;
            c.mesh.position.x = Math.cos(a)*h;

            // rotate the clouds facing the surface of planet
            c.mesh.rotation.z = a + Math.PI/2;

            var s = Math.random() * 2;
            c.mesh.scale.set(s,s,s);

            p.mesh.add( c.mesh );

            p.mesh.rotation.x = (Math.PI/180)*(Math.random()*360);
            p.mesh.rotation.y = -(Math.PI/180)*(Math.random()*360);
            p.mesh.rotation.z = (Math.PI/180)*(Math.random()*360);

            this.mesh.add ( p.mesh );
        }


    };

    var sky;

    function createSky() {
        sky = new Sky();
        sky.mesh.position.set(0,0,0);
        earth.mesh.add(sky.mesh);
    }

    var Earth = function() {
        this.mesh = new THREE.Object3D();

        // create earthSphere with ocean color
        var geom = new THREE.OctahedronGeometry(55, 2);
        var mat = new THREE.MeshPhongMaterial({
            shininess: 15,
            color: 0x004D6D,
            shading: THREE.FlatShading
        });
        var earthSphere = new THREE.Mesh(geom, mat);

        earthSphere.receiveShadow = true;


        //create northPole
        var northPoleGeom = new THREE.SphereGeometry(35,5,5);

        northPoleGeom.vertices[0].y -= 2;
        northPoleGeom.vertices[7].y += 5;
        northPoleGeom.vertices[8].y += 5;
        northPoleGeom.vertices[9].y += 5;
        northPoleGeom.vertices[10].y += 5;
        northPoleGeom.vertices[11].y += 5;

        var northPoleMat = new THREE.MeshPhongMaterial({
            shininess: 15,
            color: 0xF7F7F3,
            shading: THREE.FlatShading
        });

        var northPole = new THREE.Mesh(northPoleGeom, northPoleMat);
        northPole.position.set(0, 24, 0);


        //create southPole
        var southPoleGeom = new THREE.SphereGeometry(35,5,5);

        southPoleGeom.vertices[0].y -= 2;
        southPoleGeom.vertices[7].y += 5;
        southPoleGeom.vertices[8].y += 5;
        southPoleGeom.vertices[9].y += 5;
        southPoleGeom.vertices[10].y += 5;
        southPoleGeom.vertices[11].y += 5;

        southPoleGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

        var southPoleMat = new THREE.MeshPhongMaterial({
            shininess: 15,
            color: 0xF7F7F3,
            shading: THREE.FlatShading
        });

        var southPole = new THREE.Mesh(southPoleGeom, southPoleMat)
        southPole.position.set(0, -24, 0);

        // create continent
        var contiGeom = new THREE.DodecahedronGeometry(25,1);

        contiGeom.mergeVertices();

        var l = contiGeom.vertices.length;

        for(var i = 0; i<l; i++) {
            var v = contiGeom.vertices[i];

            if( i < l/2 ) {
                v.y -= 5;
                v.z += Math.random()*5;
                v.x += Math.random()*5;
            } else {
                v.y += 7;
                v.z -= Math.random()*5;
                v.x -= Math.random()*5;
            }
        }

        contiGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));

        var contiMat = new THREE.MeshPhongMaterial({
            shininess: 15,
            color: 0x129B40,
            shading: THREE.FlatShading
        });

        var continent1 = new THREE.Mesh(contiGeom, contiMat);
        continent1.position.set(0,10,33);

        var continent2 = new THREE.Mesh(contiGeom, contiMat);
        continent2.position.set(0, -3, -33);
        continent2.rotation.x = (Math.PI/180)*6;

        var continent3 = new THREE.Mesh(contiGeom, contiMat);
        continent3.position.set(30, 15, 0);
        continent3.rotation.x = (Math.PI/180)*180;

        var continent4 = new THREE.Mesh(contiGeom, contiMat);
        continent4.position.set(28, -15, 0);
        continent4.rotation.x = (Math.PI/180)*270;
        continent4.rotation.y = (Math.PI/180)*50;

        var continent5 = new THREE.Mesh(contiGeom, contiMat);
        continent5.position.set(28, 0, 20);
        continent5.rotation.x = (Math.PI/180)*270;

        var continent6 = new THREE.Mesh(contiGeom, contiMat);
        continent6.position.set(-28, 20, 0);
        continent6.rotation.x = (Math.PI/180)*30;

        var atmopshereSphere = new THREE.SphereGeometry(75,20,20);
        var atmosphereMaterial = new THREE.MeshPhongMaterial({
            shininess: 100,
            shading: THREE.SmoothShading,
            color: 0x109EB4,
            transparent: true,
            opacity: .12
        });

        var atmosphere = new THREE.Mesh(atmopshereSphere, atmosphereMaterial);

        northPole.receiveShadow = true;
        southPole.receiveShadow = true;
        continent1.receiveShadow = true;
        continent2.receiveShadow = true;
        continent3.receiveShadow = true;
        continent4.receiveShadow = true;
        continent5.receiveShadow = true;
        continent6.receiveShadow = true;

        this.mesh.add( earthSphere, northPole, southPole, continent1, continent2, continent3, continent4, continent5, continent6, atmosphere);
    };


    var earth;

    function createEarth() {
        earth = new Earth();
        earth.mesh.position.set(0, 0, -150);
        scene.add(earth.mesh);
    }

    var Sputnik = function() {
        this.mesh = new THREE.Object3D();
        this.pivot = new THREE.Object3D();


        var mainModuleGeom = new THREE.CylinderGeometry(17, 13, 50, 7, 1);
        var mainModuleMat = new THREE.MeshPhongMaterial({
            shininess: 100,
            color: 0xB2B8AF,
            shading: THREE.FlatShading
        });

        var mainModule = new THREE.Mesh(mainModuleGeom, mainModuleMat);

        var wingsGeom = new THREE.BoxGeometry(300,20,1,11,1,1);

        for(var i = 0; i < wingsGeom.vertices.length; i++) {
            if (i % 2 === 0) {
                wingsGeom.vertices[i].z += 5;
            } else {
                wingsGeom.vertices[i].z -= 5;
            }
        }

        var wingsMat = new THREE.MeshPhongMaterial({
            shininess: 100,
            color: 0xD3C545,
            shading: THREE.FlatShading
        });


        var wings = new THREE.Mesh( wingsGeom, wingsMat ) ;
        wings.position.set(0,0,0);

        var antenaGeom = new THREE.CylinderGeometry(40, 10, 20, 10);


        var antenaMat = new THREE.MeshPhongMaterial({
            shininess: 100,
            color: 0xAED3BE,
            shading: THREE.FlatShading
        });

        var antena = new THREE.Mesh(antenaGeom, antenaMat);
        antena.position.y = 35;



        this.mesh.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/3));
        this.mesh.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/3));

        this.mesh.scale.set(0.1,0.1,0.1);
        this.mesh.add( mainModule, wings, antena );

        this.pivot.add(this.mesh);

    };

    var sputnik;

    function createSatelites() {
        sputnik = new Sputnik();
        sputnik.mesh.position.set(-50,0,-100);
        earth.mesh.add(sputnik.pivot);
    }
//rocket
let Colors = {
    white: 0xd8d0d1, 
    black: 0x000000,
    red1: 0xE3242B,
    red2: 0xFDB731,
    red3: 0x379351,
    grey: 0xD9D1B9,
    darkGrey: 0x4D4B54,
    windowBlue: 0xaabbe3,
    windowDarkBlue: 0x4A6E8A,
    thrusterOrange: 0xFEA036,
  }
  //other mat
  var materials = {
    orange: new THREE.MeshPhongMaterial({ color: 0xB7513C, flatShading: true }),
    green:  new THREE.MeshPhongMaterial({ color: 0x379351, flatShading: true }),
    brown:  new THREE.MeshPhongMaterial({ color: 0x5C2C22, flatShading: true }),
    pink:   new THREE.MeshPhongMaterial({ color: 0xB1325E, flatShading: true }),
    gray:   new THREE.MeshPhongMaterial({ color: 0x666666, flatShading: true }),
    clouds: new THREE.MeshPhongMaterial({ color: 0xeeeeee, flatShading: true }),
    rabbit: new THREE.MeshPhongMaterial({ color: 0xF0C294, flatShading: true })
  };
let rocket;

class Rocket {
    constructor() {
      this.mesh = new THREE.Object3D();
      
      // custom shapes
      let geoFinShape = new THREE.Shape();
      let x = 0, y = 0;
  
      geoFinShape.moveTo( x, y );
      geoFinShape.lineTo( x, y + 50 );
      geoFinShape.lineTo( x + 35, y + 10 );
      geoFinShape.lineTo( x + 35, y - 10 );
      geoFinShape.lineTo( x, y );
      
      let finExtrudeSettings= { 
        amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 
      };
      
      let geoWindowShape = new THREE.Shape();
      geoWindowShape.moveTo( x - 18, y + 45);
      geoWindowShape.lineTo( x + 18, y + 45);
      geoWindowShape.lineTo( x + 18, y - 45);
      geoWindowShape.lineTo( x - 18, y - 45);
      geoWindowShape.lineTo( x - 18, y + 45);
      
      // geometry
      let geoCone = new THREE.ConeGeometry(50, 70, 8);
      let geoUpper = new THREE.CylinderGeometry(50, 75, 80, 8);
      let geoMiddle = new THREE.CylinderGeometry(75, 85, 80, 8);
      let geoColumn = new THREE.CylinderGeometry(85, 85, 200, 8);
      let geoWindowFrameOuter = new THREE.CylinderGeometry(55, 55, 40, 8);
      let geoWindowFrameInner = new THREE.CylinderGeometry(40, 40, 40, 16);
      let geoWindow = new THREE.CylinderGeometry(50, 50, 40, 8);
      let geoWindowReflection = new THREE.ShapeGeometry(geoWindowShape);
      let geoFin = new THREE.ExtrudeGeometry(geoFinShape, finExtrudeSettings);
      let geoThruster = new THREE.CylinderGeometry(55, 55, 40, 8);
      let geoConnector = new THREE.CylinderGeometry(55, 35, 10, 8);
      
  
      // materials
      let matRoof1 = new THREE.MeshPhongMaterial({
        color: Colors.red1,
        flatShading: true,
      });
      let matRoof2 = new THREE.MeshPhongMaterial({
        color: Colors.red2,
        flatShading: true,
      });
      let matRoof3 = new THREE.MeshPhongMaterial({
        color: Colors.red3,
        flatShading: true,
      });
      let matBody = new THREE.MeshPhongMaterial({
        color: Colors.grey,
        flatShading: true,
      });
      let matWindowFrame = new THREE.MeshPhongMaterial({
        color: Colors.darkGrey,
        side: THREE.DoubleSide,
        flatShading: true,
      });
      let matWindow = new THREE.MeshPhongMaterial({
        color: Colors.windowDarkBlue,
      });
      let matWindowReflection = new THREE.MeshPhongMaterial({
        color: Colors.windowBlue,
      });
      let matThruster = new THREE.MeshPhongMaterial({
        color: Colors.thrusterOrange,
        flatShading: true,
      })
      
      let m = new THREE.Mesh(geoCone, matRoof1);
      m.position.y = 70;    
      m.castShadow = true;
      m.receiveShadow = true;
      
      let m2 = new THREE.Mesh(geoUpper, matRoof2);
      m2.castShadow = true;
      m2.receiveShadow = true;
      
      let m3 = new THREE.Mesh(geoMiddle, matRoof3);
      m3.position.y = -70;  
      m3.castShadow = true;
      m3.receiveShadow = true;
      
      this.roof = new THREE.Object3D();
      this.roof.add(m,m2,m3);
      
      let mColumn = new THREE.Mesh(geoColumn, matBody);
      mColumn.position.y = -210;  
      mColumn.position.x = 0;
      mColumn.position.z = 0;
      mColumn.castShadow = true;
      mColumn.receiveShadow = true;
      
      let zPlacement = 85
      let yPlacement = -310
      let xPlacement = 8;
      let yRotation = 1.6;
      let scale = 1.8;
      let finWidth = 15;
      let mFinLeft = new THREE.Mesh(geoFin, matRoof3);
      mFinLeft.position.y = yPlacement;   
      mFinLeft.position.z = - (zPlacement);
      mFinLeft.rotation.y = yRotation-0.08;
      mFinLeft.scale.set(scale, scale, scale);
      mFinLeft.castShadow = true;
      mFinLeft.receiveShadow = true;
      let mFinRight = new THREE.Mesh(geoFin, matRoof3);
      mFinRight.position.y = yPlacement;  
      mFinRight.position.z = zPlacement;    
      mFinRight.rotation.y = - yRotation;
      mFinRight.scale.set(scale, scale, scale);
      mFinRight.castShadow = true;
      mFinRight.receiveShadow = true;
      
      let mfins = new THREE.Object3D();
      mfins.rotation.y += 0.05;
      mfins.add(mFinLeft, mFinRight);
      this.body = new THREE.Object3D();
      this.body.add(mColumn, mfins);
      
      let innerMesh = new THREE.Mesh(geoWindowFrameInner) 
      innerMesh.rotation.y = 0.2;
      let outerCylinder = new ThreeBSP(geoWindowFrameOuter);
      let innerCylinder = new ThreeBSP(innerMesh);
      
      let hollowed = outerCylinder.union(innerCylinder);
      let m5 = hollowed.toMesh(matWindowFrame);
      m5.position.y = -200;
      m5.position.x = -77;
      m5.rotation.z = 1.59;
      m5.castShadow = true;
      m5.receiveShadow = true;
      
      let m6 = new THREE.Mesh(geoWindow, matWindow);
      m6.position.y = -200;
      m6.position.x = -67;
      m6.rotation.z = 1.59;
      m6.castShadow = true;
      m6.receiveShadow = true;
      
      let mWindowReflection = new THREE.Mesh(geoWindowReflection, matWindowReflection);
      mWindowReflection.position.x = -90;
      mWindowReflection.position.y = -200;
      mWindowReflection.rotation.y = -1.5;
      mWindowReflection.rotation.x = 0.82;
      mWindowReflection.receiveShadow = true;
      
      this.window = new THREE.Object3D();
      this.window.add(m5,m6, mWindowReflection);
      
      let mThruster = new THREE.Mesh(geoThruster, matWindowFrame);
      mThruster.position.y = -305;
      mThruster.receiveShadow = true;
      mThruster.castShadow = true;
      
      let mConnector = new THREE.Mesh(geoConnector, matThruster);
      mConnector.position.y = -330;
      mConnector.receiveShadow = true;
      mConnector.castShadow = true;
      
      let mBurner = new THREE.Mesh(geoThruster, matWindowFrame);
      mBurner.position.y = -340;
      mBurner.scale.set(0.7, 0.55, 0.7);
      mBurner.receiveShadow = true;
      mBurner.castShadow = true;
      
      this.base = new THREE.Object3D();
      this.base.add(mThruster, mConnector, mBurner);
      /**ADD CONEJO TO ROCKET */
      const group = new THREE.Group();
    
        const bodyGeo = new THREE.CubeGeometry(5, 5, 5);
        //const bodyGeo = new THREE.TetrahedronGeometry(2.8,3);
        
        bodyGeo.vertices[3].y += 0.5;
        bodyGeo.vertices[6].y += 0.5;
    
        const body = new THREE.Mesh(bodyGeo, materials.rabbit);
        body.position.y = 1;
        body.position.z = 4;
    /*
        const seatGeo = new THREE.CubeGeometry(6, 1, 6);
        const seat = new THREE.Mesh(seatGeo, materials.brown);
        seat.position.set(0, -2.5, 0);
        seat.rotation.set(.25, 0, 0);
        body.add(seat);
    */
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
        var bunnyHeadCover = new THREE.SphereGeometry(5.4,20,20);
        var atmosphereMaterial = new THREE.MeshPhongMaterial({
            shininess: 100,
            shading: THREE.SmoothShading,
            color: 0xffffff,
            transparent: true,
            opacity: .22
        });

        var casco = new THREE.Mesh(bunnyHeadCover, atmosphereMaterial);
        casco.position.y=2;
        casco.position.z=4;
        group.add(casco);
        group.add(body);
        group.scale.set(12,12, 12);
        group.rotation.x = -Math.PI/2;
        group.rotation.z = Math.PI/2;
        //group.rotation.y = -Math.PI/2;
        group.position.y=-245;
        group.position.x=-105;
        this.mesh.add(group);

      /**end */

      this.mesh.add(this.roof);
      this.mesh.add(this.body);
      this.mesh.add(this.window);
      this.mesh.add(this.base);
    }
    
  }
  
  class Base {
    constructor() {
      this.mesh = new THREE.Object3D();
      let geo = new THREE.CylinderGeometry(70, 80, 50, 8);
      let mat = new THREE.MeshPhongMaterial({
        color: Colors.darkGrey,
      });
      let m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      m.receiveShadow = true;
      this.mesh.add(m);
    }
  }
  
  //let rocket;
  
  const createRocket = () => {
    rocket = new Rocket();
    rocket.mesh.scale.set(.05, .05, .05);
    
    //rocket.mesh.position.y = -40;
    rocket.mesh.rotation.z = 1.5;
    
    rocket.mesh.position.set(-40,0,-100);

    earth.mesh.add(rocket.mesh);
    //scene.add(rocket.mesh);
    
    // let base = new Base();
    // base.mesh.position.y = -190;
    // base.mesh.scale.set(3.3, 0.8, 3.3);
    // scene.add(base.mesh);
  }
  
  let particleArray = [], 
    slowMoFactor = 1;
  /*
  const loop = () => {
    // render the scene
    renderer.render(scene, camera);
    
    if (rocket.mesh.position.y < 130) {
      rocket.mesh.position.y += 1;
      rocket.mesh.position.x = Math.random()*Math.PI*0.5;
      rocket.mesh.rotation.x = Math.random()*Math.sin(1)*0.04;
      rocket.mesh.rotation.z = Math.random()*Math.sin(1)*0.04;
      rocket.mesh.position.z = Math.random()*Math.PI*0.5;
    } else {
      rocket.mesh.rotation.y += Math.sin(1)*0.02;
    }
   
    
    if (rocket.mesh.position.y > 350) {
      rocket.mesh.position.y = -300;
    }
    
    setTimeout(()=> {
      createSmoke(rocket);
    }, 1000);
    createFlyingParticles();
  
    // controls.update();
    requestAnimationFrame(loop);
  }
  
  */
  const getParticle = (recycle) => {
    let p;
    if (particleArray.length > 0) {
      p = particleArray.pop();
    } else {
      p = new Particle(); 
    }
    return p;
  }
  
  const createSmoke = (rocket) => {
    let p = getParticle();
    dropParticle(p, rocket);
  }
  
  const createFlyingParticles = () => {
    let p = getParticle();
    flyParticle(p);
  }
  
  function Particle() {
    this.isFlying = false;
    
    var scale = 20 + Math.random()*20;
    var nLines = 3+ Math.floor(Math.random()*5);
    var nRows = 3+ Math.floor(Math.random()*5);  
    this.geometry = new THREE.SphereGeometry(scale,nLines,nRows);  
    
    this.material = new THREE.MeshLambertMaterial({
      color: 0xe3e3e3, shading: THREE.FlatShading, transparent: true
    });
    
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    recycleParticle(this);
  }
  
  function recycleParticle(p){
    p.mesh.position.x = 0;
    p.mesh.position.y = 0;
    p.mesh.position.z = 0;
    p.mesh.rotation.x = Math.random()*Math.PI*2;
    p.mesh.rotation.y = Math.random()*Math.PI*2;
    p.mesh.rotation.z = Math.random()*Math.PI*2;
    p.mesh.scale.set(.1,.1,.1);
    p.mesh.material.opacity = 0;
    p.color = 0xe3e3e3;
    p.mesh.material.color.set(p.color);
    p.material.needUpdate = true;
    scene.add(p.mesh);
    particleArray.push(p);
  }
  function flyParticle(p){
      var targetPosX, targetPosY, targetSpeed, targetColor;
    p.mesh.material.opacity = 1;
    p.mesh.position.x = -1000 + Math.random()*2000;
    p.mesh.position.y = 100 + Math.random()*2000;
    p.mesh.position.z =  -1000 + Math.random()*1500;
    
    var s = Math.random()*.2;
    p.mesh.scale.set(s,s,s);
  
    targetPosX = 0;
    targetPosY = - p.mesh.position.y - 2500;
    targetSpeed = 1+Math.random()*2;
    targetColor = 0xe3e3e3;
    
    TweenMax.to(p.mesh.position, targetSpeed*slowMoFactor, {
      x:targetPosX, 
      y:targetPosY,
      ease : Linear.easeNone,
      onComplete:recycleParticle, 
      onCompleteParams:[p]
    });
  }
   
  let cloudTargetPosX, cloudTargetPosY, cloudTargetSpeed, cloudTargetColor, cloudSlowMoFactor= 0.65;
  const dropParticle = (p, rocket) => {
    p.mesh.material.opacity = 1;
    p.mesh.position.x = 0;
    p.mesh.position.y = rocket.mesh.position.y - 18;
    p.mesh.position.z = 0;
    var s = Math.random(0.02)+0.35;
    p.mesh.scale.set(0.04*s,0.04*s,0.04*s);
    cloudTargetPosX = 0;
    cloudTargetPosY =  rocket.mesh.position.y - 15;
    cloudTargetSpeed = 0.8+Math.random()*0.6;
    cloudTargetColor = 0xa3a3a3;
    
    TweenMax.to(p.mesh.position, 0.03*cloudTargetSpeed*cloudSlowMoFactor, {
      x:cloudTargetPosX, 
      y:cloudTargetPosY,
      ease : Linear.easeNone,
      onComplete:recycleParticle, 
      onCompleteParams:[p]
    });
    
    TweenMax.to(p.mesh.scale, cloudTargetSpeed*cloudSlowMoFactor, {
      x:s * 1.08, 
      y:s * 1.08,
      z:s * 1.08,
      ease : Linear.ease
    });
  }

  
//end rocket
 


    function initScene() {
        // var axisHelper = new THREE.AxisHelper( 1000 );
        // scene.add( axisHelper );


        camera.position.set(-70, 40, 130);
        camera.rotation.x -= (Math.PI/180) * 7;
        createLights();
        createCosmos();
        createEarth();
        createSky();
     
 // Load cloud texture
 /*
 let loader = new THREE.TextureLoader();
 loader.load("img/sun.png", function(texture) {
   cloudGeo = new THREE.PlaneBufferGeometry(50,50);
   cloudMaterial = new THREE.MeshLambertMaterial({
     map: texture,
     transparent: true
   });
   
  
let cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
     cloud.position.set(
       -110,
       40,
       -1
     );
     
     //cloud.material.opacity = 0.6;
     
     scene.add(cloud);
  
   
 });
*/
        //createSatelites();
        createRocket();
        render();
       // loop();

       
    }

    function render() {
        closeStars.mesh.rotation.y += 0.00003;
        closeStars.mat.opacity = (Math.sin(Date.now() * 0.001))/2 + 0.5;
        distantStars.mesh.rotation.y += 0.00002;
        distantStars.mesh.rotation.x += 0.00003;
        distantStars.mesh.rotation.z += 0.00003;
        earth.mesh.rotation.y += 0.002;
        sky.mesh.rotation.y -= 0.0003;
        sky.mesh.rotation.z += 0.0003;

        //rocket.mesh.rotation.z -= 0.01;
        rocket.mesh.rotation.x -= 0.009;
        // sputnik.pivot.rotation.z += 0.008;
       /*
        setTimeout(()=> {
            createSmoke(rocket);
          }, 1000);
*/


        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    window.onload = initScene;
    window.addEventListener('resize', handleWindowResize, false);

    