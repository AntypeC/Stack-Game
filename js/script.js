import * as THREE from './three.module.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth /window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.add(new THREE.Vector3(2, 2, 2))
camera.rotation.y = Math.PI/4;

const baseGeometry = new THREE.BoxGeometry(1, 3, 1)
// mesh
var material = new THREE.MeshPhongMaterial( {
    color: 0xff0000,
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1
} );
var mesh = new THREE.Mesh( baseGeometry, material );
scene.add( mesh )

// wireframe
var baseEdge = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
var mat = new THREE.LineBasicMaterial( { color: 0xffffff} );
var wireframe = new THREE.LineSegments( baseEdge, mat );
mesh.add( wireframe );

var scanner = undefined
var count = 0
document.getElementById('score').innerHTML = 'Score: '+count/0.3
const scanRange = 1.5

function ToVertices(geometry, zDelta) {
    const positions = geometry.attributes.position;
    const vertices = [];
    for (let index = 0; index < positions.count; index++) {
        vertices.push(
            new THREE.Vector3(
                positions.getX(index),
                positions.getY(index),
                positions.getZ(index)+zDelta
            )
        )
    }
    return vertices;
}

function addStack(intersection, displacement) {
    const defaultGeometry = new THREE.BoxGeometry(1, 0.3, 1);
    scanner = new THREE.Mesh(defaultGeometry, material);
    const edge = new THREE.EdgesGeometry(scanner.geometry);
    const wire = new THREE.LineSegments(edge, mat);
    scanner.add(wire);
    scanner.position.y = count+1.65;
    scanner.position.z = -scanRange;

    if (count!=0 && intersection != 0) {
        const geometry = new THREE.BoxGeometry(1, 0.3, intersection)
        const stack = new THREE.Mesh(geometry, material);
        stack.add(new THREE.LineSegments(new THREE.EdgesGeometry(stack.geometry)));
        stack.position.y = (count-0.3)+1.65;
        stack.position.z = displacement;
        scene.add(stack)
    }

    // const intersection = new THREE.Mesh(geometry, material);
    // intersection.add(new THREE.LineSegments(new THREE.EdgesGeometry(intersection.geometry)));
    // intersection.position.y = count+1.65;

    scene.add(scanner);
    count += 0.3
}

scene.add(mesh);

var goForward = true

function animate() {
    let speed = 0.008;
    if (scanner != undefined) {
        if (goForward == true) {
            scanner.position.z += speed;
            if (scanner.position.z >= scanRange) {
                goForward = false
            }
        } else {
            scanner.position.z -= speed;
            if (scanner.position.z <= -scanRange) {
                goForward = true
            }
        }
    }
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

document.addEventListener('keydown', (event) => {
    if (event.key == 'Spacebar' || event.key == ' ') {
        camera.position.y += 0.08
        let intersection = 0;
        let displacement = 0;
  
        if (count == 0) {
            document.getElementsByClassName('info')[0].remove();
        } else {
            scene.remove(scanner)
            console.log(scanner.position.z)
            let distanceFromCenter = Math.abs(scanner.position.z);
            if (scanner.position.z <= 0) {
                if (distanceFromCenter < 1) {
                    intersection = 1- distanceFromCenter;
                    displacement = -((0.5 - intersection) + 0.5*intersection);
                }
            } else {
                if (distanceFromCenter < 1) {
                    intersection = 1- distanceFromCenter;
                    displacement = -((-0.5 + intersection) - 0.5*intersection);
                }
            }
        }
        addStack(intersection, displacement)
    }
})

animate();