import { Vec3 } from "./math.js";
export class Engine {
}
export class Camera {
    constructor(x, y, z, heading, pitch) {
        this.pos = new Vec3(x, y, z);
        this.heading = heading;
        this.pitch = pitch;
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
    hasMesh() {
        return this.mesh !== null;
    }
}
export class Mesh {
    constructor(vertexArray = [], indexArray = [], faceColourArray = []) {
        this.vertexArray = vertexArray;
        this.indexArray = indexArray;
        //console.log("Filling arrays", faceColourArray.length, 4 * indexArray.length / 3,  4 * indexArray.length / 3 - faceColourArray.length)
        let numFaces = indexArray.length / 3;
        if (faceColourArray.length < 4 * numFaces) {
            for (let i = 0; i <= 4 * numFaces; i += 3) {
                let c = [Math.random(), Math.random(), Math.random(), 1.0];
                faceColourArray = faceColourArray.concat(c, c, c, c);
            }
        }
        this.faceColourArray = faceColourArray;
    }
    translate(vec) {
        let newVA = [];
        this.vertexArray.forEach((v, i) => {
            let t = 0;
            switch (i % 3) {
                case 0: {
                    t = vec.x;
                    break;
                }
                case 1: {
                    t = vec.y;
                    break;
                }
                case 2: {
                    t = vec.z;
                    break;
                }
            }
            newVA.push(v + t);
        });
        let out = new Mesh(newVA, this.indexArray, this.faceColourArray);
        return out;
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
            0, 1, 2, 0, 2, 3, // front
            4, 5, 6, 4, 6, 7, // back
            8, 9, 10, 8, 10, 11, // top
            12, 13, 14, 12, 14, 15, // bottom
            16, 17, 18, 16, 18, 19, // right
            20, 21, 22, 20, 22, 23, // left
        ];
        let faceColourArray = [];
        for (let i = 0; i < 6; i++) {
            let c = [Math.random(), Math.random(), Math.random(), 1.0];
            faceColourArray = faceColourArray.concat(c, c, c, c);
        }
        //console.log("AAA", faceColourArray)
        let mesh = new Mesh(vertexArray, indexArray, faceColourArray);
        return mesh;
    }
}
