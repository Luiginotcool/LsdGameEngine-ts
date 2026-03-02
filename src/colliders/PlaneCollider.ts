import { vec3 } from "gl-matrix";

export class PlaneCollider{
    normal: vec3;
    origin: vec3;
    
    constructor(normal: vec3, origin: vec3) {
        this.normal = normal;
        this.origin = origin;
    }

    getY(x: number, z: number): number {
        /*
            n : normal
            (x,y,z): player position
            (a,b,c): point on the plane
            y = b + (nx(a-x) + nz(c-z))/ny

        */

        let [nx,ny,nz] = this.normal;
        let [a,b,c] = this.origin;
        console.log(nx, ny, nz);

        return b + (nx*(a-x) + nz*(c-z))/ny;
    }

    static normalFromRotation(rotation: vec3) {
        let [xr,yr,zr] = rotation;
        let n = vec3.fromValues(-Math.sin(zr), Math.cos(xr)*Math.cos(zr), Math.sin(xr)*Math.cos(zr))
        return n;
    }
}