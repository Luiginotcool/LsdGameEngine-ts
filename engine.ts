import { Game } from "./game.js";
import { Vec3 } from "./math.js";
import { Input } from "./input.js";
import { Render } from "./render.js";

export class Engine{}

export class Camera {
    pos: Vec3
    heading: number;
    pitch: number;
    fov: number
    constructor(x: number,y:number,z:number, heading:number, pitch:number, fov:number) {
        this.pos = new Vec3(x,y,z);
        this.heading = heading
        this.pitch = pitch;
        this.fov = fov;
    }
}


export class Scene {
    gameObjectArray: GameObject[]
    constructor() {
        this.gameObjectArray = [];
    }

    addGameObject(gameObject: GameObject) {
        this.gameObjectArray.push(gameObject);
    }
}

export class GameObject {
    mesh: Mesh | null
    transform: Transform
    controller: Controller | null
    camera: Camera | null
    body: Body | null
    constructor() {
        this.mesh = null;
        this.transform = new Transform();
        this.controller = null;
        this.camera = null;
        this.body = null;
    }

    update(dt: number) {
        if (this.hasController()) {

        }

        if (this.hasBody()) {
            this.body!.update(dt);
            this.transform.pos = this.body!.pos;
        }
    }

    hasController() {
        return this.controller !== null;
    }

    hasMesh() {
        return this.mesh !== null;
    }

    hasTransform() {
        return this.transform !== null;
    }

    hasBody() {
        return this.body !== null;
    }

    handleInput(dt: number) {
            let sensitivity = 0.001;
            let speed = 0.01 * dt;
            let cam = this.camera;
            let pos = this.transform.pos;

            if (cam == null || pos == null) {
                return
            }
            
            // Update camera rotation based on mouse movement
            if (Input.mouseLocked) {
                if (Input.mouseX) {
                    cam.heading += Input.mouseDx * sensitivity;
                    cam.pitch -= Input.mouseDy * sensitivity;
                    if (Math.abs(cam.pitch) > Math.PI/2) {
                        cam.pitch = Math.sign(cam.pitch) * Math.PI/2;
                    }
                    Input.mouseX = 0;
                    Input.mouseY = 0;
                } else {
                    Input.mouseX = 0;
                }
            }
            
            // Calculate forward direction
            let vx = speed * -Math.sin(cam.heading);
            let vz = speed * Math.cos(cam.heading);
            if (Input.keys.down) {
                pos.x += vx
                pos.z += vz;
            }
            if (Input.keys.up) {
                pos.x -= vx;
                pos.z -= vz;
            }
            if (Input.keys.right) {
                pos.x += vz;
                pos.z -= vx;
            }
            if (Input.keys.left) {
                pos.x -= vz;
                pos.z += vx;
            }
    
            if (Input.keys.space) {
                pos.y += speed
            }
    
            if (Input.keys.shift) {
                pos.y -= speed;
            }
            this.transform.pos = pos;
            this.camera!.pos = pos;
    
        }
}

export class PlaneCollider {
    type: string

    constructor() {
        this.type = "PlaneCollider"
    }
}

export class BoxCollider {
    pos: Vec3;
    dim: Vec3;
    type: string

    constructor(pos: Vec3, dim: Vec3) {
        this.pos = pos; // -ve axis corner
        this.dim = dim;
        this.type = "BoxCollider"
    }

    collides(_collider: BoxCollider | PlaneCollider) {
        if (_collider.type == "PlaneCollider") {
            let collider = <PlaneCollider>_collider;
        }

        if (_collider.type == "BoxCollider") {
            let collider = <BoxCollider>_collider;
            let p1 = this.pos;
            let p2 = this.pos.add(this.dim);
            let q1 = collider.pos;
            let q2 = collider.pos.add(collider.dim);
            return (
                BoxCollider.intervalOverlap(p1.x, p2.x, q1.x, q2.x) &&
                BoxCollider.intervalOverlap(p1.y, p2.y, q1.y, q2.y) &&
                BoxCollider.intervalOverlap(p1.z, p2.z, q1.z, q2.z)
            )
        }

    }

    static intervalOverlap(x1: number, x2: number, y1: number, y2: number) {
        if (x1 > x2) {
            [x1, x2] = [x2, x1];
        }
        if (y1 > y2) {
            [y1, y2] = [y2, y1];
        }

        return (x1 <= y2 && y1 <= x2);
    }

    showCollider(render: Render, camera: Camera) {
        let scene = new Scene();
        let bboxObj = new GameObject();
        bboxObj.mesh = Mesh.cube();
        bboxObj.transform.scale = this.dim.scale(1/2 + 0.01 );
        bboxObj.transform.pos = this.pos;
        scene.addGameObject(bboxObj);
        render.drawScene(scene, camera, true);
    }
}

export class Body {
    collider: BoxCollider | null;
    pos: Vec3;
    vel: Vec3;
    acc: Vec3;

    constructor(pos: Vec3) {
        this.collider = null;
        this.pos = pos;
        this.vel = Vec3.zero();
        this.acc = Vec3.zero();
    }

    update(dt: number) {

        if (this.hasCollider()) {

        }

        if (Number.isNaN(dt)) {
            dt = 1;
        }

        console.log("The velocity of the body",this.vel.add(this.acc.scale(dt)))
        this.vel = this.vel.add(this.acc.scale(dt));
        this.pos = this.pos.add(this.vel.scale(dt));

        if (this.hasCollider()) {
            this.collider!.pos = this.pos
        }
        //this.bbox.pos = this.pos
    }

    collide(obj: GameObject) {
        if (obj.hasBody()) {
            
        }
    }

    hasCollider() {
        return (this.collider !== null)
    }


}

export class Controller {
    keys: keyFunctions
    gameObject: GameObject
    constructor(gameObject: GameObject) {
        this.keys = {}
        this.gameObject = gameObject;
    }

    static player(gameObject: GameObject) {
        let c = new Controller(gameObject);
        
        c.keys["w"] = function(dt: number) {
            let sensitivity = 0.001;
            let speed = 0.01 * dt;
        }
    }
}

export class Transform {
    pos: Vec3
    scale: Vec3
    rotate: Vec3
    centre: Vec3
    constructor() {
        this.pos = new Vec3();
        this.scale = new Vec3(1, 1, 1);
        this.rotate = new Vec3();
        this.centre = Vec3.zero();
    }

    set(pos: Vec3 = Vec3.zero(), scale: Vec3 = Vec3.one(), rotate: Vec3 = Vec3.zero()) {
        this.pos = pos;
        if (scale.has(0)) {
            scale = Vec3.one();
            console.log("Scale has a zero!")
        }
        this.scale = scale;
        this.rotate = rotate;

        return this;
    }
}

export class Mesh {
    vertexArray: number[]
    indexArray: number[]
    faceColourArray: number[]
    constructor(vertexArray: number[] = [], indexArray: number[] = [], faceColourArray: number[] = []) {
        this.vertexArray = vertexArray;
        this.indexArray = indexArray;
        //console.log("Filling arrays", faceColourArray.length, 4 * indexArray.length / 3,  4 * indexArray.length / 3 - faceColourArray.length)
        let numFaces = indexArray.length / 3;
        if (faceColourArray.length < 4 * numFaces) {
            for (let i = 0; i <= 4 * numFaces; i+=3) {
                let c = [Math.random(), Math.random(), Math.random(), 1.0];
                faceColourArray = faceColourArray.concat(c, c, c, c);
            }
        }
        this.faceColourArray = faceColourArray;
    }

    translate(vec: Vec3): Mesh {
        let newVA: number[] = []
        this.vertexArray.forEach((v, i) => {
            let t = 0;
            switch (i%3) {
                case 0: {t = vec.x; break}
                case 1: {t = vec.y; break}
                case 2: {t = vec.z; break}
            }
            newVA.push(v + t)
        })
        let out = new Mesh(newVA, this.indexArray, this.faceColourArray);
        return out;
    }


    static cube() {
        let vertexArray =  [
            // Front face
            -1.0, -1.0, 1.0,    1.0, -1.0, 1.0,     1.0, 1.0, 1.0,      -1.0, 1.0, 1.0,
          
            // Back face
            -1.0, -1.0, -1.0,   -1.0, 1.0, -1.0,    1.0, 1.0, -1.0,     1.0, -1.0, -1.0,
          
            // Top face
            -1.0, 1.0, -1.0,    -1.0, 1.0, 1.0,     1.0, 1.0, 1.0,      1.0, 1.0, -1.0,
          
            // Bottom face
            -1.0, -1.0, -1.0,   1.0, -1.0, -1.0,    1.0, -1.0, 1.0,     -1.0, -1.0, 1.0,
          
            // Right face
            1.0, -1.0, -1.0,    1.0, 1.0, -1.0,     1.0, 1.0, 1.0,      1.0, -1.0, 1.0,
          
            // Left face
            -1.0, -1.0, -1.0,   -1.0, -1.0, 1.0,    -1.0, 1.0, 1.0,     -1.0, 1.0, -1.0,
          ];
        let indexArray = [
            0, 1, 2, 0, 2, 3, // front
            4, 5, 6, 4, 6, 7, // back
            8, 9, 10, 8, 10, 11, // top
            12, 13, 14, 12, 14, 15, // bottom
            16, 17, 18, 16, 18, 19, // right
            20, 21, 22, 20, 22, 23, // left
          ];
        let faceColourArray: number[] = [];
        for (let i = 0; i < 6; i++) {
            let c = [Math.random(), Math.random(), Math.random(), 1.0]
            faceColourArray = faceColourArray.concat(c, c, c, c)
            /*
            c1 c1 c1 c1     r g b a  r g b a  r g b a  r g b a 
            c2 c2 c2 c2
                ...
            c6 c6 c6 c6
            */
        }
        //console.log("AAA", faceColourArray)
        let mesh = new Mesh(vertexArray, indexArray, faceColourArray);
        return mesh;
    }

    static plane() {
        let vertexArray = [
            -1.2, 0.0, -1.2,
            1.2, 0.0, -1.2,
            1.2, 0.0, 1.2,
            -1.2, 0.0, 1.2
        ]
        let indexArray = [
            0, 1, 2, 0, 2, 3
        ];
        let c = [Math.random(), Math.random(), Math.random(), 1.0]
        let faceColourArray: number[] = Array().concat(c, c, c, c);
        let mesh = new Mesh(vertexArray, indexArray, faceColourArray);
        return mesh;
    }
}
