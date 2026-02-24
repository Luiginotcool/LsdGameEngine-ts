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
    physicsSystemArray: PhysicsSystem[]
    constructor() {
        this.gameObjectArray = [];
        this.physicsSystemArray = []
    }

    addGameObject(gameObject: GameObject) {
        //gameObject.id = this.gameObjectArray.length;
        this.gameObjectArray.push(gameObject);
    }

    addPhysicsSystem(physicsSystem: PhysicsSystem) {
        this.physicsSystemArray.push(physicsSystem);
    }

    update(dt: number) {
        this.physicsSystemArray.forEach(ps => {
            let psBodyArray = ps.update(dt);
        })
        this.gameObjectArray.forEach(gameObject => {
            gameObject.update(dt);
        })
    }
}

export class GameObject {
    mesh: Mesh | null
    transform: Transform
    controller: Controller | null
    camera: Camera | null
    body: Body | null
    id: number
    constructor() {
        this.mesh = null;
        this.transform = new Transform();
        this.controller = null;
        this.camera = null;
        this.body = null;
        this.id = -1;
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
    planeType: number;
    pos: Vec3;
    dim: Vec3;
    transform: Transform;
    static AXIS = 0;
    static POINTS = 1;

    constructor(planeType: number = PlaneCollider.AXIS, pos: Vec3, dim: Vec3) {
        this.type = "PlaneCollider"
        this.planeType = planeType;
        this.pos = pos;
        this.dim = dim;
        this.transform = new Transform();
    }

    collides(_collider: BoxCollider | PlaneCollider) {
        if (_collider.type == "PlaneCollider") {
            let collider = <PlaneCollider>_collider;
        }

        if (_collider.type == "BoxCollider") {
            let collider = <BoxCollider>_collider;
        }

    }

    showCollider(render: Render, camera: Camera) {
        let scene = new Scene();
        let bboxObj = new GameObject();
        bboxObj.mesh = Mesh.cube();
        bboxObj.transform.scale = this.dim.scale(1);
        bboxObj.transform.scale.y = 0.1
        bboxObj.transform.pos = this.pos;
        scene.addGameObject(bboxObj);
        render.drawScene(scene, camera, true);
    }

}

export class BoxCollider {
    pos: Vec3;
    dim: Vec3;
    transform: Transform
    type: string

    constructor(pos: Vec3, dim: Vec3, rot: Vec3 = Vec3.zero()) {
        this.pos = pos; // -ve axis corner
        this.dim = dim; // center to side length
        this.transform = new Transform()
        this.type = "BoxCollider"
    }

    collides(_collider: BoxCollider | PlaneCollider) {
        if (_collider.type == "PlaneCollider") {
            let collider = <PlaneCollider>_collider;
            let p1 = this.pos;
            let p2 = this.pos.add(this.dim);
            let q1 = collider.pos.add(collider.dim.scale(-1));
            let q2 = collider.pos.add(collider.dim);
            q1.y = collider.pos.y;
            q2.y = collider.pos.y;
            return (
                BoxCollider.intervalOverlap(p1.x, p2.x, q1.x, q2.x) &&
                BoxCollider.intervalOverlap(p1.y, p2.y, q1.y, q2.y) &&
                BoxCollider.intervalOverlap(p1.z, p2.z, q1.z, q2.z)
            )
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
        bboxObj.transform.scale = this.dim.scale(1.01);
        bboxObj.transform.pos = this.pos.add(this.transform.pos);
        bboxObj.transform.rotate = this.transform.rotate;
        console.log("THis colliders position is ", this.pos)
        scene.addGameObject(bboxObj);
        render.drawScene(scene, camera, true);
    }
}

export class PhysicsSystem {
    private bodyArray: GameObject[];

    constructor() {
        this.bodyArray = [];
    }

    addBody(body: GameObject) {
        if (!body.hasBody()) {return false;}
        this.bodyArray.push(body);
    }

    update(dt: number) {
        this.bodyArray.forEach(body => {
            body.body!.update(dt);
            body.body!.collider!.transform = body.transform;
        })
        this.handleCollisions();
        return this.bodyArray;
    }

    drawColliders(render: Render, camera: Camera) {
        this.bodyArray.forEach(gameObject => {
            if (!gameObject.hasBody()) {return;}
            if (!gameObject.body!.hasCollider()) {return;}
            gameObject.body!.collider!.showCollider(render, camera)
        })
    }

    planeLineIntersect(p1: Vec3, p2: Vec3, a: Vec3, n: Vec3): [Vec3, number] {
        let d = a.dot(n);
        let lambda = (d - n.dot(p1)) / (n.dot(p2.subtract(p1)));
        let intersect = p1.add(p2.subtract(p1).scale(lambda));
        //console.log(d - n.dot(p1), (p1.dot(new Vec3(-1, 1, 1)) + p2.dot(new Vec3(1, -1, -1))))

        return [intersect, lambda];
    }

    normalVectorFromPoints(a: Vec3, b: Vec3, c: Vec3) {
        let det = (b.x*c.y - b.y*c.x);
        let nz = det
        let nx = (b.y*c.z - b.z*c.y);
        let ny = (b.z*c.x - b.x*c.z);
        return new Vec3(nx, ny, nz);
    }

    collideBoxBox(box1: GameObject, box2: GameObject) {
        console.log("Box Box collision")
    }

    collidePlanePlane(plane1: GameObject, plane2: GameObject) {
        console.log("Plane Plane collision")
    }

    collideBoxPlane(box: GameObject, plane: GameObject) {
        console.log("Box Plane collision")
        let p1 = new Vec3(2, 2, 2);
        let p2 = new Vec3(1, -1, 3);
        let n = this.normalVectorFromPoints(
            new Vec3(0, 0, 0),
            new Vec3(1, 0, 1),
            new Vec3(2, 0, 1),
        )
        let a = new Vec3(1,0,1);
        let [intersect, lambda] = this.planeLineIntersect(p1, p2, a, n);
        //console.log(intersect);
        let render = Game.render;
        let cam: Camera = Game.globals.player.camera;
        render.drawPoint(intersect, cam)
        render.drawPoint(p1, cam, Colour.WHITE)
        render.drawPoint(p2, cam, Colour.WHITE  );
        render.drawVector(p1, p2, cam, Colour.RED)
        render.drawVector(a, a.add(n), cam, Colour.CYAN)

        // START OF COLLISION CODE



        // Get centre of collision point
        // If the box is moving, move backwards along that vector until
        // there is no collision

        // For each edge on the cube
        //      write as vector equation
        //      solve equation using plane eq
        //      if collision is inside all bounds:
        //          note the point down
        // calculate the average point
        

    }

    handleCollisions() {
        for (let i = 0; i < this.bodyArray.length; i++) {
            if (!this.bodyArray[i].hasBody()) { continue; }
            let body = this.bodyArray[i].body!;
            if (body.hasCollider()) {
                for (let j = i+1; j < this.bodyArray.length; j++) {
                    if (!this.bodyArray[j].hasBody()) { continue; }
                    let cbody = this.bodyArray[j].body!;
                    this.collideBoxPlane(this.bodyArray[i], this.bodyArray[j])
                    if (cbody.hasCollider()) {
                        console.log(body.collider!.type + " " + cbody.collider!.type)
                        if (body.collider!.collides(cbody.collider!)) {
                            console.log(body.collider!, cbody.collider!)
                            let types = body.collider!.type + " " + cbody.collider!.type;
                            switch (types) {
                                case "BoxCollider BoxCollider":
                                    this.collideBoxBox(this.bodyArray[i], this.bodyArray[j])
                                    break;
                                case "BoxCollider PlaneCollider":
                                    this.collideBoxPlane(this.bodyArray[i], this.bodyArray[j])
                                    break;
                                case "PlaneCollider BoxCollider":
                                    this.collideBoxPlane(this.bodyArray[j], this.bodyArray[i])
                                    break;
                                case "PlaneCollider PlaneCollider":
                                    this.collidePlanePlane(this.bodyArray[i], this.bodyArray[j])
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }
}

export class Colour {
    r: number
    g: number
    b: number
    static RED = new Colour(1, 0, 0);
    static GREEN = new Colour(0, 1, 0);
    static BLUE = new Colour(0, 0, 1);
    static CYAN = new Colour(0, 1, 1);
    static YELLOW = new Colour(1, 1, 0);
    static MAGENTA = new Colour(1, 0, 1);
    static BLACK = new Colour(0, 0, 0);
    static WHITE = new Colour(1, 1, 1);
    constructor(r = 0, g = 0, b = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

export class Body {
    collider: BoxCollider | PlaneCollider | null;
    pos: Vec3;
    vel: Vec3;
    acc: Vec3;
    mass: number
    impulse: Vec3;

    constructor(pos: Vec3, mass = 1) {
        this.collider = null;
        this.pos = pos;
        this.vel = Vec3.zero();
        this.acc = Vec3.zero();
        this.mass = mass;
        this.impulse = Vec3.zero();
    }

    update(dt: number) {

        if (this.hasCollider()) {
            // Check if this is colliding with any other colliders
            // if it is, move it away

        }
        if (Number.isNaN(dt)) {
            dt = 1;
        }

        this.acc = this.impulse.scale(1/this.mass);

        this.vel = this.vel.add(this.acc.scale(dt/1000));
        this.pos = this.pos.add(this.vel.scale(dt/1000));

        if (this.hasCollider()) {
            //this.collider!.pos = this.pos
        }
        this.impulse = Vec3.zero();
        //this.bbox.pos = this.pos
    }


    hasCollider() {
        return (this.collider !== null)
    }

    gravity(g: number) {
        let gravityForce = Vec3.zero()
        gravityForce.y = -this.mass * g;
        return gravityForce;
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

    transform(t: Transform) {

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
            -1, 0.0, -1,
            1, 0.0, -1,
            1, 0.0, 1,
            -1, 0.0, 1
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
