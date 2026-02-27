import { vec3 } from "gl-matrix";
import { Controller, GameObject, Mesh, Transform } from "../engine";


export class Arrow extends GameObject {
    constructor(id: string, pos?:vec3, scale?: vec3, rot?: vec3) {
        super(id);
        let t = vec3.fromValues(0, 1, 0);
        let tip = Mesh.pyramid()
        tip = tip.translate(vec3.fromValues(0, 3, 0))
        tip = tip.scale(vec3.fromValues(0.3, 0.5, 0.3), vec3.fromValues(0, 2, 0))
        let line = Mesh.cube();
        line = line.translate(t);
        line = line.scale(vec3.fromValues(0.1, 1, 0.1)); 
        
        let mesh = Mesh.union(tip, line);
        this.mesh = mesh;
        this.transform = new Transform();
        this.transform.set(pos, scale, rot)
    }
}