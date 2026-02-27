import { vec3 } from "gl-matrix";
import { Camera, GameObject } from "../engine";


export class Player extends GameObject {
    constructor(id: string, pos: vec3) {
        super(id);
        this.camera = new Camera(0, 0, 0, 0, 0, 45);
        this.transform.set(pos);
    }
}