import { vec3 } from "gl-matrix";
import { Controller, GameObject, Mesh } from "../engine";


export class Plane extends GameObject {
    constructor(
        id: string,
        pos?: vec3, 
        dim?: vec3, 
        rot?: vec3, 
        centre?: vec3,
        texture?: string
    ) {
        super(id);
        let mesh = Mesh.plane()
        this.mesh = mesh
        this.transform.set(pos, dim, rot);
        if (centre) {this.transform.centre = centre;}
        if (texture) {
            this.setTexture(texture);
        }
    }
}