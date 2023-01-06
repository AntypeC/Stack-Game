import * as THREE from './three.module.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth /window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.add(new THREE.Vector3(2, 2, 2))
camera.rotation.y = Math.PI/4;

const geometry = new THREE.BoxGeometry(1, 3, 1)
// mesh
var material = new THREE.MeshPhongMaterial( {
    color: 0xff0000,
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1
} );
var mesh = new THREE.Mesh( geometry, material );
scene.add( mesh )

// wireframe
var edge = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
var mat = new THREE.LineBasicMaterial( { color: 0xffffff} );
var wireframe = new THREE.LineSegments( edge, mat );
mesh.add( wireframe );

var stackAdder = undefined
var count = 0

function AddStack() {
    const geo = new THREE.BoxGeometry(1, 0.3, 1);
    stackAdder = new THREE.Mesh(geo, material);
    const e = new THREE.EdgesGeometry(stackAdder.geometry);
    const w = new THREE.LineSegments(e, mat);
    stackAdder.add(w);
    stackAdder.position.y = count+1.65;
    stackAdder.position.z = -1.5;

    scene.add(stackAdder);
    count += 0.3
}

// var geometry1 = new THREE.BoxGeometry(1, 1, 1);
// var geometry2 = new THREE.BoxGeometry(1, 1, 1);

// var csg1 = CSG.fromGeometry(geometry1);
// var csg2 = CSG.fromGeometry(geometry2);

// var result = csg1.intersect(csg2);

// var intersectionGeometry = result.toGeometry();

scene.add(mesh);

var goForward = true

function animate() {
    let speed = 0.02;
    if (stackAdder != undefined) {
        if (goForward == true) {
            stackAdder.position.z += speed;
            if (stackAdder.position.z >= 1.5) {
                goForward = false
            }
        } else {
            stackAdder.position.z -= speed;
            if (stackAdder.position.z <= -1.5) {
                goForward = true
            }
        }
    }
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

document.addEventListener('keydown', (event) => {
    if (event.key == 'Spacebar' || event.key == ' ') {
        AddStack()
        if (document.getElementsByClassName('text') != null) {
            document.getElementById('score').remove();
            document.getElementById('how-to').remove();
        }
    }
})

animate();