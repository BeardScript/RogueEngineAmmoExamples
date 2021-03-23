import * as RE from 'rogue-engine';
import * as THREE from 'three';
import { AmmoPhysics } from '../libs/AmmoPhysics';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default class Instancing extends RE.Component {
  physics;
  position;
  spheres;
  boxes: THREE.InstancedMesh<THREE.BoxGeometry, THREE.MeshLambertMaterial>;
  cameraControls;

  hasStarted: boolean = false;

  start() {
    this.init().then(() => {
      this.hasStarted = true;
    }).catch(e => {
      RE.Debug.logError(e);
    });
  }

  async init() {
    this.physics = await AmmoPhysics();
    this.position = new THREE.Vector3();

    //

    const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set( - 1, 1.5, 2 );
    camera.lookAt( 0, 0.5, 0 );

    const scene = RE.App.currentScene;
    scene.background = new THREE.Color( 0x666666 );

    const hemiLight = new THREE.HemisphereLight();
    hemiLight.intensity = 0.35;
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight();
    dirLight.position.set( 5, 5, 5 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.zoom = 2;
    scene.add( dirLight );

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry( 10, 5, 10 ),
      new THREE.ShadowMaterial( { color: 0x111111 } )
    );
    floor.position.y = - 2.5;
    floor.receiveShadow = true;
    scene.add( floor );
    this.physics.addMesh( floor );

    //

    const material = new THREE.MeshLambertMaterial();

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    // Boxes

    const geometryBox = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    this.boxes = new THREE.InstancedMesh( geometryBox, material, 100 );
    this.boxes.castShadow = true;
    this.boxes.receiveShadow = true;
    scene.add( this.boxes );

    for ( let i = 0; i < this.boxes.count; i ++ ) {
      matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
      this.boxes.setMatrixAt( i, matrix );
      // this.boxes["setColorAt"]( i, color.setHex( 0xffffff * Math.random() ) );
    }

    this.physics.addMesh( this.boxes, 1 );

    // Spheres

    const geometrySphere = new THREE.IcosahedronGeometry( 0.075, 3 );
    this.spheres = new THREE.InstancedMesh( geometrySphere, material, 100 );
    this.spheres.castShadow = true;
    this.spheres.receiveShadow = true;
    scene.add( this.spheres );

    for ( let i = 0; i < this.spheres.count; i ++ ) {
      matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
      this.spheres.setMatrixAt( i, matrix );
      // this.spheres["setColorAt"]( i, color.setHex( 0xffffff * Math.random() ) );
    }

    this.physics.addMesh( this.spheres, 1 );

    //

    scene.add(camera);
    RE.App.activeCamera = camera.uuid;
    this.cameraControls = new OrbitControls( camera, RE.Runtime.rogueDOMContainer );
    this.cameraControls.target.y = 0.5;
    this.cameraControls.update();
  }

  update() {
    if (!this.hasStarted) return;

    this.cameraControls.enabled = true;
    this.cameraControls.update();

    let index = Math.floor( Math.random() * this.boxes.count );

    this.position.set( 0, Math.random() + 1, 0 );
    this.physics.setMeshPosition( this.boxes, this.position, index );

    //

    index = Math.floor( Math.random() * this.spheres.count );

    this.position.set( 0, Math.random() + 1, 0 );
    this.physics.setMeshPosition( this.spheres, this.position, index );
  }
}

RE.registerComponent(Instancing);
