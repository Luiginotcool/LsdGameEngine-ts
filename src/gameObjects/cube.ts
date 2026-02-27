import { vec3 } from "gl-matrix";
import { GameObject, Mesh, Transform } from "../engine";
import { TextureManager } from "../textureManager";


export class Cube extends GameObject {
    constructor(id: string, pos?: vec3, dim?: vec3, rot?: vec3, texture?: string) {
        super(id);
        let mesh = Mesh.cube()
        let transform = new Transform()
        transform.set(pos, dim, rot);
        this.mesh = mesh;
        this.transform = transform;
        if (texture) {
            this.texture = TextureManager.loadTexture(texture);
        }
    }
}