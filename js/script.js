import * as THREE from './three.module.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth /window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.add(new THREE.Vector3(3, 3, 3))
camera.rotation.y = Math.PI/4;

const baseGeometry = new THREE.BoxGeometry(1, 3, 1)

var material = new THREE.MeshPhongMaterial( {
    color: 0xff0000,
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1
} );
var base = new THREE.Mesh( baseGeometry, material );
scene.add( base )

// wireframe
var baseEdge = new THREE.EdgesGeometry( base.geometry ); // or WireframeGeometry
var mat = new THREE.LineBasicMaterial( { color: 0xffffff} );
var wireframe = new THREE.LineSegments( baseEdge, mat );
base.add( wireframe );

base.position.y = -2.5;

var scanner = undefined
var count = 0
const scanRange = 3

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
var widthX = 0
var widthY = 0
var positionX = 0
var positionY = 0
var intersect = null;

function addStack(widthX, widthY, positionX, positionY) {
    const defaultGeometry = new THREE.BoxGeometry(widthY, 0.3, widthX);
    scanner = new THREE.Mesh(defaultGeometry, material);
    const edge = new THREE.EdgesGeometry(scanner.geometry);
    const wire = new THREE.LineSegments(edge, mat);
    scanner.add(wire);
    scanner.position.y = (count*0.3)+1.65;
    if (count % 2 == 0) {
        scanner.position.z = -scanRange;
    } else {
        scanner.position.x = -scanRange;
    }

    if (count!=0) {
        const geometry = new THREE.BoxGeometry(widthY, 0.3, widthX)
        const stack = new THREE.Mesh(geometry, material);
        stack.add(new THREE.LineSegments(new THREE.EdgesGeometry(stack.geometry)));
        stack.position.y = (count*0.3 -0.3)+1.65;
        stack.position.z = positionX;
        stack.position.x = positionY;
        rectangle2 = { x1: stack.position.z+widthX/2, y1: stack.position.x+widthY/2, x2: stack.position.z-widthX/2, y2: stack.position.x-widthY/2 };
        scene.add(stack)
    }

    scene.add(scanner);
}

scene.add(base);

var scan = true
var lateral = false
var viewHeight = 2
var viewIceberg = false
var baseHeight = 0
var run = false

function animate() {
    let speed = 0.03+(0.001*count);
    if (scanner != undefined) {
        if (lateral == false) {
            if (scan == true) {
                scanner.position.z += speed;
                if (scanner.position.z >= scanRange) {
                    scan = false
                }
            } else {
                scanner.position.z -= speed;
                if (scanner.position.z <= -scanRange) {
                    scan = true
                }
            }
        } else {
            if (scan == true) {
                scanner.position.x += speed;
                if (scanner.position.x >= scanRange) {
                    scan = false
                }
            } else {
                scanner.position.x -= speed;
                if (scanner.position.x <= -scanRange) {
                    scan = true
                }
            }
        }
    }
    if (base.position.y <= baseHeight-0.03) {
        base.position.y += 0.03
    } else {
        run = true
    }
    if (camera.position.y < viewHeight) {
        camera.position.y += 0.01
    }
    if (viewIceberg==true) {
        if (camera.position.x < camera.position.y) {
            camera.position.x += 0.02
            camera.position.z += 0.02
        }
    } 
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

animate();

var elem = document.getElementById('instruction1');
var restart = document.getElementById('instruction2');

function reset() {
    document.addEventListener('keydown', (e) => {
        if (e.key == 'Spacebar' || e.key == ' ') {
            window.location.reload()
        }
    })
}

document.addEventListener('keydown', (event) => {
    document.getElementById('score').innerHTML = 'Score: '+count
    elem.innerHTML = 'Press space to stack!'
    restart.style.display = 'none'
    if ((event.key == 'Spacebar' && run == true) || (event.key == ' ' && run == true)) {
        if (count == 0) {
            viewHeight += 0.3
            elem.style.display = 'none'
            addStack()
        } else {
            rectangle1 = { x1: scanner.position.z+0.5, y1: scanner.position.x+0.5, x2: scanner.position.z-0.5, y2: scanner.position.x-0.5 };
            intersect = getIntersectingRectangle(rectangle1, rectangle2)
            widthX = Math.abs(intersect.x2-intersect.x1)
            widthY = Math.abs(intersect.y2-intersect.y1)
            positionX = (intersect.x1+intersect.x2)/2
            positionY = (intersect.y1+intersect.y2)/2
            scene.remove(scanner)
            if (intersect == false) {
                var redbg = document.getElementById('red-tint');
                var deathmsg = document.getElementById('death-msg');
                redbg.style.display = 'block';
                deathmsg.style.display = 'block';
                restart.style.display = 'block';
                viewIceberg = true
                reset()
                
            } else {
                viewHeight += 0.3
                if (count % 2==0) {
                    addStack(widthX, widthY, positionX, positionY)
                    lateral = false 
                } else {
                    addStack(widthX, widthY, positionX, positionY) 
                    lateral = true
                }
            }
        }
        count += 1
    }
})
