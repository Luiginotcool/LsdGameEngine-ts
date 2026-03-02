import { Game } from "./game.js";
import { vec3 } from "gl-matrix";
import { Input } from "./input.js";
import { Render } from "./render.js";
import { Buffers, keyFunctions } from "./types.js";
import { InitBuffers } from "./buffers.js";
import { TextureManager } from "./textureManager.js";
import { Plane } from "./gameObjects/plane.js";

export class Engine{

    static drawScene(scene: Scene, camera: Camera) {
        /*
        For each Object in the scene:
            Create buffers, attatch to object. variable model view matrix
        Draw Scene: Scene
            For each object in the scene:
                if no buffers:
                    create buffers, attatch to object
                create model view matrix from object transform and camera transform
                set buffer attributes
                draw elements         
            If skybox:

        */
        Render.gl.clear(Render.gl.COLOR_BUFFER_BIT | Render.gl.DEPTH_BUFFER_BIT);
        let projectionMatrix = Render.createProjectionMatrix(camera.fov, camera.zFar);

        for (let key in scene.gameObjects) {
            let gameObject = scene.gameObjects[key]
            if (!gameObject.hasMesh()) {
                console.log(key, " skipped")
                continue;
            } 
            //console.log(key)
            if (!gameObject.hasBuffers()) {
                // If no buffers, create buffers
                let mesh = gameObject.mesh!
                let vertexArray = mesh.vertexArray;
                let indexArray = mesh.indexArray;
                let textureCoordArray = mesh.textureCoordArray;
                let buffers = InitBuffers.initBuffers(
                    Render.gl,
                    vertexArray,
                    indexArray,
                    textureCoordArray,
                )
                gameObject.buffers = buffers;
            }
            let t: Transform;
            if (!gameObject.hasTransform()) {
                t = new Transform()
            } else {
                t = gameObject.transform;
            }
            if (!gameObject.hasTexture()) {
                gameObject.texture = Render.colourTexture(50, 0, 0)
            }
            let modelViewMatrix = Render.createModelViewMatrix(
                t.pos, t.rotate, t.scale, 
                t.centre, camera.pos, vec3.fromValues(camera.pitch, camera.heading, 0)
            )
            let vertexCount = gameObject.mesh!.indexArray.length;
            Render.drawBuffers(
                Render.programInfo,
                gameObject.buffers!,
                modelViewMatrix,
                projectionMatrix,
                vertexCount,
                gameObject.texture!,
                true
            )
        }

        if (scene.skybox !== null) {
            // Skybox
            // Init skybox buffer
            // Create skybox texture
            // Compute projection and view matrix
            // Call drawSkyboxBuffers
            let skyboxPositionBuffer = InitBuffers.initSkyboxPositionBuffer(Render.gl);
            let skyboxTexture = scene.skybox.texture;
            let viewMatrix = Render.createViewMatrix(vec3.fromValues(0,0,0), vec3.fromValues(camera.pitch, camera.heading, 0));
            Render.drawSkyboxBuffers(
                Render.skyboxProgramInfo,
                skyboxPositionBuffer,
                viewMatrix,
                projectionMatrix,
                skyboxTexture
            )
        }

    }

}

export class Camera {
    pos: vec3
    heading: number;
    pitch: number;
    fov: number;
    zFar: number;
    constructor(x: number,y:number,z:number, heading:number, pitch:number, fov:number, zFar=500) {
        this.pos = vec3.fromValues(x,y,z);
        this.heading = heading
        this.pitch = pitch;
        this.fov = fov;
        this.zFar = zFar;
    }
}


export class Scene {
    [x: string]: any;
    gameObjects: {[key: string]: GameObject}
    skybox: Skybox | null
    constructor() {
        this.gameObjects = {};
        this.skybox = null;
    }

    update(dt: number, t: number) {

    }

    addGameObject(gameObject: GameObject) {
        this.gameObjects[gameObject.id] = gameObject;
    }

    addGameObjects(gameObjects: GameObject[]) {
        gameObjects.forEach(gameObject => {
            this.gameObjects[gameObject.id] = gameObject;
        })
    }

    addSkybox(skybox: Skybox) {
        this.skybox = skybox;
    }
}

export class Skybox {
    texture: WebGLTexture
    constructor() {
        let skyboxTexture = Render.cubeMapTexture([]); 
        this.texture = skyboxTexture;
    }
}

export class GameObject {
    id: string;
    mesh: Mesh | null
    transform: Transform
    controller: Controller | null
    camera: Camera | null
    body: Body | null
    buffers: Buffers | null
    texture: WebGLTexture | null
    constructor(id: string) {
        this.id = id;
        this.mesh = null;
        this.transform = new Transform();
        this.controller = null;
        this.camera = null;
        this.body = null;
        this.buffers = null;
        this.texture = null;
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

    hasBuffers() {
        return this.buffers !== null;
    }

    hasTexture() {
        return this.texture !== null;
    }

    setTexture(url: string) {
        this.texture = TextureManager.loadTexture(url)
    }

    setColourTexture(r: number, g: number, b: number) {
        this.texture = TextureManager.colourTexture(r, g, b);
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
                if (true) {
                    let dx = Input.mouseDx;
                    let dy = Input.mouseDy;

                    cam.heading -= dx * sensitivity;
                    cam.pitch -= dy * sensitivity;


                    //cam.heading += Input.mouseX * sensitivity;
                    //cam.pitch -= Input.mouseY * sensitivity;
                    if (Math.abs(cam.pitch) > Math.PI/2) {
                        cam.pitch = Math.sign(cam.pitch) * Math.PI/2;
                    }
                    Input.mouseDx = 0;
                    Input.mouseDy = 0;
                } else {    
                    //Input.mouseX = 0;
                }
            }

            
            // Calculate forward direction
            let vx = speed * Math.sin(cam.heading);
            let vz = speed * Math.cos(cam.heading);
            if (Input.keys.down) {
                pos[0] += vx
                pos[2] += vz;
            }
            if (Input.keys.up) {
                pos[0] -= vx;
                pos[2] -= vz;
            }
            if (Input.keys.right) {
                pos[0] += vz;
                pos[2] -= vx;
            }
            if (Input.keys.left) {
                pos[0] -= vz;
                pos[2] += vx;
            }
    
            if (Input.keys.space) {
                //pos[1] += speed
            }
    
            if (Input.keys.shift) {
                pos[1] -= speed;
            }
            this.transform.pos = pos;
            this.camera!.pos = pos;
    
        }

}



export class BoxCollider {
    pos: vec3;
    dim: vec3;
    type: string

    constructor(pos: vec3, dim: vec3) {
        this.pos = pos; // -ve axis corner
        this.dim = dim;
        this.type = "BoxCollider"
    }

    collides(_collider: BoxCollider) {

        if (_collider.type == "BoxCollider") {
            let collider = <BoxCollider>_collider;
            let p1 = this.pos;
            let p2 = vec3.add(this.pos, this.dim, this.pos);
            let q1 = collider.pos;
            let q2 = vec3.add(collider.pos, collider.pos, collider.dim)
            return (
                BoxCollider.intervalOverlap(p1[0], p2[0], q1[0], q2[0]) &&
                BoxCollider.intervalOverlap(p1[1], p2[1], q1[1], q2[1]) &&
                BoxCollider.intervalOverlap(p1[2], p2[2], q1[2], q2[2])
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
        let bboxObj = new GameObject("");
        bboxObj.mesh = Mesh.cube();
        bboxObj.transform.scale = vec3.scale(this.dim, this.dim, 1/2 + 0.01 );
        bboxObj.transform.pos = this.pos;
        scene.addGameObject(bboxObj);
        //render.drawScene(scene, camera, true);
    }
}

export class Body {
    collider: BoxCollider | null;
    pos: vec3;
    vel: vec3;
    acc: vec3;

    constructor(pos: vec3) {
        this.collider = null;
        this.pos = pos;
        this.vel = vec3.fromValues(0,0,0);
        this.acc = vec3.fromValues(0,0,0);
    }

    update(dt: number) {

        if (this.hasCollider()) {

        }

        if (Number.isNaN(dt)) {
            dt = 1;
        }

        //console.log("The velocity of the body",this.vel.add(this.acc.scale(dt)))
        vec3.scaleAndAdd(this.vel, this.vel, this.acc, dt);
        vec3.scaleAndAdd(this.pos, this.pos, this.vel, dt);

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
    pos: vec3
    scale: vec3
    rotate: vec3
    centre: vec3
    constructor() {
        this.pos = vec3.fromValues(0,0,0);
        this.scale = vec3.fromValues(1,1,1);
        this.rotate = vec3.fromValues(0,0,0);
        this.centre = vec3.fromValues(0,0,0);
    }

    setPos(x: number, y: number, z: number) {
        this.pos = vec3.fromValues(x,y,z);
    }

    setScale(x: number, y: number, z: number) {
        let scale = vec3.fromValues(x,y,z);
        if (scale[0] == 0 || scale[1] == 0 || scale[2] == 0) {
                scale = vec3.fromValues(1,1,1);
                console.log("Scale has a zero!")
            } else {
                this.scale = scale;
            }
    }

    setRotate(x: number, y: number, z: number) {
        this.rotate = vec3.fromValues(x,y,z);
    }

    setCentre(x: number, y: number, z: number) {
        this.centre = vec3.fromValues(x,y,z);
    }

    set(pos?: vec3, scale?: vec3, rotate?: vec3, centre?: vec3) {
        if (pos !== undefined) {
            this.setPos(pos[0], pos[1], pos[2]);
        }
        if (scale !== undefined) {
            this.setScale(scale[0], scale[1], scale[2]);
        }
        if (rotate !== undefined) {
            this.setRotate(rotate[0], rotate[1], rotate[2]);
        }
        if (centre !== undefined) {
            this.setCentre(centre[0], centre[1], centre[2])
        }
        return this;
    }
}

export class Mesh {
    vertexArray: number[]
    indexArray: number[]
    textureCoordArray: number[]
    constructor(vertexArray: number[] = [], indexArray: number[] = [], textureCoordArray: number[] = []) {
        this.vertexArray = vertexArray;
        this.indexArray = indexArray;
        this.textureCoordArray = textureCoordArray;
        //console.log("Filling arrays", faceColourArray.length, 4 * indexArray.length / 3,  4 * indexArray.length / 3 - faceColourArray.length)
        let numFaces = indexArray.length / 3;
    }

    translate(vec: vec3): Mesh {
        let newVA: number[] = []
        this.vertexArray.forEach((v, i) => {
            let t = 0;
            t = vec[i%3];
            newVA.push(v + t)
        })
        let out = new Mesh(newVA, this.indexArray, this.textureCoordArray);
        return out;
    }

    scale(dim: vec3, centre?: vec3): Mesh {
        let newVA: number[] = [];
        if (centre === undefined) {
            centre = vec3.fromValues(0,0,0);
        }
        let s = 0;
        let c = 0;
        this.vertexArray.forEach((v, i) => {
            // (v - c)s + c
            s = dim[i%3];
            c = centre[i%3];
            newVA.push((v-c)*s + c)
        })
        let out = new Mesh(newVA, this.indexArray, this.textureCoordArray);
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

        let textureCoordArray = [
            // Front
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Back
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Top
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Bottom
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Right
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Left
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        ]
        //console.log("AAA", faceColourArray)
        let mesh = new Mesh(vertexArray, indexArray, textureCoordArray);
        return mesh;
    }

    static plane() {
        let vertexArray = [
            -1.0, 0.0, -1.0,
            1.0, 0.0, -1.0,
            1.0, 0.0, 1.0,
            -1.0, 0.0, 1.0
        ]
        let indexArray = [
            0, 1, 2, 0, 2, 3
        ];
        let textureCoordArray = [
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
        ]
        let c = [Math.random(), Math.random(), Math.random(), 1.0]
        let mesh = new Mesh(vertexArray, indexArray, textureCoordArray);
        return mesh;
    }
    static pyramid() {
        let vertexArray = [
            // Front face (triangle)
            -1.0, -1.0,  1.0,   // 0  base left
            1.0, -1.0,  1.0,   // 1  base right
            0.0,  1.0,  0.0,   // 2  apex

            // Right face (triangle)
            1.0, -1.0,  1.0,   // 3
            1.0, -1.0, -1.0,   // 4
            0.0,  1.0,  0.0,   // 5

            // Back face (triangle)
            1.0, -1.0, -1.0,   // 6
            -1.0, -1.0, -1.0,   // 7
            0.0,  1.0,  0.0,   // 8

            // Left face (triangle)
            -1.0, -1.0, -1.0,   // 9
            -1.0, -1.0,  1.0,   // 10
            0.0,  1.0,  0.0,   // 11

            // Bottom face (square)
            -1.0, -1.0,  1.0,   // 12
            1.0, -1.0,  1.0,   // 13
            1.0, -1.0, -1.0,   // 14
            -1.0, -1.0, -1.0,   // 15
        ];

        let indexArray = [
            0, 1, 2,        // front
            3, 4, 5,        // right
            6, 7, 8,        // back
            9,10,11,        // left
            12,13,14,       // bottom triangle 1
            12,14,15        // bottom triangle 2
        ];


        let textureCoordArray = [
            // Front
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0,

            // Right
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0,

            // Back
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0,

            // Left
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0,

            // Bottom
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ];

        let mesh = new Mesh(vertexArray, indexArray, textureCoordArray);
        return mesh;
    }

    static union(m1: Mesh, m2: Mesh): Mesh {
        let vertexArray = m1.vertexArray.concat(m2.vertexArray);
        let indexOffset = m1.vertexArray.length / 3;
        let indexArray = m1.indexArray.concat(m2.indexArray.map(i => i + indexOffset));
        let textureCoordArray = m1.textureCoordArray.concat(m2.textureCoordArray);
        return new Mesh(vertexArray, indexArray, textureCoordArray);
    }
}
