import { Game } from "./game.js";
import { Vec3 } from "./math.js";

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
    constructor() {
        this.mesh = null;
        this.transform = new Transform();
        this.controller = null;
    }

    update(dt: number) {
        if (this.hasController()) {

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
    constructor() {
        this.pos = new Vec3();
        this.scale = new Vec3(1, 1, 1);
        this.rotate = new Vec3();
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
