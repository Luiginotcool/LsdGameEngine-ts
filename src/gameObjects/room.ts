import { vec3 } from "gl-matrix";
import { GameObject, Mesh, Transform } from "../engine";
import { TextureManager } from "../textureManager";


export class Room extends GameObject {
    constructor(id: string, centre: vec3, dim: vec3, texture?: string) {
        super(id);
        let wallMeshArray: Mesh[] = [];
                /* To make room make 4 walls and 2 floors
                walls:
                    4 walls, N E S W (-z -x z x)
                    4 planes, rotate 90
                    N: rotate along x 90 cw
                    E: rotate along z 90 a 
                
                */
        let wallPos = centre;
        let wallScale = dim;
        
        this.mesh = Mesh.cube();
        this.transform = new Transform();
        this.transform.set(wallPos, wallScale);
        if (texture) {
            this.texture = TextureManager.loadTexture(texture);
        }
        return this;
    }
}