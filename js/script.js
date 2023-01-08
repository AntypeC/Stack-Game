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
const scanRange = 1.5

/**
 * Returns intersecting part of two rectangles
 * @param  {object}  r1 4 coordinates in form of {x1, y1, x2, y2} object
 * @param  {object}  r2 4 coordinates in form of {x1, y1, x2, y2} object
 * @return {boolean}    False if there's no intersecting part
 * @return {object}     4 coordinates in form of {x1, y1, x2, y2} object
 */
const getIntersectingRectangle = (r1, r2) => {  
    [r1, r2] = [r1, r2].map(r => {
    return {
        x: [r.x1, r.x2].sort((a,b) => a - b),
        y: [r.y1, r.y2].sort((a,b) => a - b)
    };
    });

    const noIntersect = r2.x[0] > r1.x[1] || r2.x[1] < r1.x[0] ||
                        r2.y[0] > r1.y[1] || r2.y[1] < r1.y[0];

    return noIntersect ? false : {
    x1: Math.max(r1.x[0], r2.x[0]), // _[0] is the lesser,
    y1: Math.max(r1.y[0], r2.y[0]), // _[1] is the greater
    x2: Math.min(r1.x[1], r2.x[1]),
    y2: Math.min(r1.y[1], r2.y[1])
    };
};

var rectangle1 = { x1: 0.5, y1: 0.5, x2: -0.5, y2: -0.5 }
var rectangle2 = { x1: 0.5, y1: 0.5, x2: -0.5, y2: -0.5 }
var intersect = null;

function addStack(width, center) {
    const defaultGeometry = new THREE.BoxGeometry(1, 0.3, 1);
    scanner = new THREE.Mesh(defaultGeometry, material);
    const edge = new THREE.EdgesGeometry(scanner.geometry);
    const wire = new THREE.LineSegments(edge, mat);
    scanner.add(wire);
    scanner.position.y = (count*0.3)+1.65;
    scanner.position.z = -scanRange;

    if (count!=0) {
        const geometry = new THREE.BoxGeometry(1, 0.3, width)
        const stack = new THREE.Mesh(geometry, material);
        stack.add(new THREE.LineSegments(new THREE.EdgesGeometry(stack.geometry)));
        stack.position.y = (count*0.3 -0.3)+1.65;
        stack.position.z = center;
        rectangle2 = { x1: stack.position.z+width, y1: 0.5, x2: stack.position.z-width, y2: -0.5 };
        scene.add(stack)
    }

    scene.add(scanner);
}

scene.add(mesh);

var goForward = true
var moveCamera = 2

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
    if (camera.position.y < moveCamera) {
        camera.position.y += 0.01
    }
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();

var elem = document.getElementById('info');
var restart = document.getElementById('restart');

restart.onclick = function reset() {
    document.getElementById('red').style.display = 'none';
    document.getElementById('death-msg').style.display = 'none';
    document.getElementById('restart').style.display = 'none'
    document.getElementById('message').style.display = 'block'
}

document.addEventListener('keydown', (event) => {
    elem.innerHTML = 'Press space to stack!'
    document.getElementById('score').innerHTML = 'Score: '+count
    run: if (event.key == 'Spacebar' || event.key == ' ') {
        if (count == 0) {
            moveCamera += 0.3
            elem.style.display = 'none'
            addStack()
        } else {
            rectangle1 = { x1: scanner.position.z+0.5, y1: 0.5, x2: scanner.position.z-0.5, y2: -0.5 };
            intersect = getIntersectingRectangle(rectangle1, rectangle2)
            let width = Math.abs(intersect.x2-intersect.x1)
            let position = (intersect.x1+intersect.x2)/2
            scene.remove(scanner)
            if (intersect == false) {
                var redbg = document.getElementById('red-tint');
                var deathmsg = document.getElementById('death-msg');
                redbg.style.display = 'block';
                deathmsg.style.display = 'block';
                restart.style.display = 'block';
                break run;
            } else {
                moveCamera += 0.3
                console.log('coords: ')
                console.log(intersect)
                addStack(width, position) 
            }
        }
        count += 1
    }
})

