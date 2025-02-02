import { Vec3 } from "./math.js";
export class Engine {
}
export class Camera {
    constructor(x, y, z, heading, pitch) {
        this.pos = new Vec3(x, y, z);
        this.heading = heading;
        this.pitch = pitch;
    }
    headingVector() {
        let camDir = new Vec3(0, 0, 1);
        camDir = camDir.rotateY(this.heading);
        return camDir;
    }
}
export class Scene {
    constructor() {
        this.gameObjectArray = [];
    }
    addGameObject(gameObject) {
        this.gameObjectArray.push(gameObject);
    }
}
export class GameObject {
    constructor() {
        this.mesh = null;
    }
}
export class Mesh {
    constructor(vertexArray = [], indexArray = [], faceColourArray = []) {
        this.vertexArray = vertexArray;
        this.indexArray = indexArray;
        if (faceColourArray.length < indexArray.length / 3) {
            console.log("Filling faceColourArray", faceColourArray);
            for (let i = faceColourArray.length * 3; i <= indexArray.length; i += 3) {
                faceColourArray.push(Math.random(), Math.random(), Math.random(), 1.0);
            }
        }
        console.log(faceColourArray);
        this.faceColourArray = faceColourArray;
    }
    static cube() {
        let vertexArray = [
            // Front face
            -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
            // Back face
            -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
            // Top face
            -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
            // Right face
            1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
            // Left face
            -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
        ];
        let indexArray = [
            0,
            1,
            2,
            0,
            2,
            3, // front
            4,
            5,
            6,
            4,
            6,
            7, // back
            8,
            9,
            10,
            8,
            10,
            11, // top
            12,
            13,
            14,
            12,
            14,
            15, // bottom
            16,
            17,
            18,
            16,
            18,
            19, // right
            20,
            21,
            22,
            20,
            22,
            23, // left
        ];
        let faceColourArray = [
            [1.0, 1.0, 1.0, 1.0], // Front face: white
            [1.0, 0.0, 0.0, 1.0], // Back face: red
            [0.0, 1.0, 0.0, 1.0], // Top face: green
            [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
            [1.0, 1.0, 0.0, 1.0], // Right face: yellow
            [1.0, 0.0, 1.0, 1.0], // Left face: purple
        ];
        let mesh = new Mesh(vertexArray, indexArray);
        return mesh;
    }
}
