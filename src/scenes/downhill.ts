import { vec3 } from "gl-matrix";
import { PlaneCollider, Scene, Skybox } from "../engine";
import { Plane } from "../gameObjects/plane";
import { Player } from "../gameObjects/player";
import { Cube } from "../gameObjects/cube";
import { Arrow } from "../gameObjects/arrow";

export class Downhill extends Scene {
    init() {
        // Plane that goes downhill
        // Player
        let planePos = vec3.fromValues(0, 0, 0);
        let planeDim = vec3.fromValues(1000, 1, 1000);
        let planeRot = vec3.fromValues(0, 0, 0);
        let planeCentre = vec3.fromValues(0, 0, 0);
        let floor = new Plane("floor", planePos, planeDim, planeRot, planeCentre);
        floor.setTexture("/snow.png")
        let playerPos = vec3.fromValues(0, 2, 10);
        let player = new Player("player", playerPos);

        let normalDim = vec3.fromValues(0.1, 1, 0.1);
        let normalPos = vec3.fromValues(0, 1, 0)
        //
        //let normal = new Cube("normal", normalPos, normalDim, planeRot)
        let normal = new Arrow("normal")
        normal.setColourTexture(0, 100, 255);
        //normal.setTexture("/cubetexture.png")

        let box = new Cube("box")



        let a = 0;
        let b = 2;
        let c = 10;
        floor.transform.setRotate(-0.4, 0, 0);
        floor.transform.centre = vec3.fromValues(0, 0, 10)
        let xr = floor.transform.rotate[0]
        let zr = floor.transform.rotate[2]
        let n = vec3.fromValues(-Math.sin(zr), Math.cos(xr)*Math.cos(zr), Math.sin(xr)*Math.cos(zr))


        let numTrees = 1000;
        let treeRange = 500
        let trees = [];

        for (let i = 0; i < numTrees; i++) {
            let x = (Math.random()-0.5)*treeRange*2
            let z = (Math.random()-0.5)*treeRange*2;
            let y = -2 + b + (n[0]*(a-x) + n[2]*(c-z))/n[1]
            let treePos = vec3.fromValues(x,y,z);
            let treeScale = vec3.fromValues(4, (Math.random()+0.2)*5, 4)
            let tree = new Arrow("tree"+i, treePos, treeScale)
            trees.push(tree);
        }


        

        this.addGameObjects([floor, player, normal, box]);
        this.addGameObjects(trees);
        this.addSkybox(new Skybox());
    }

    update(dt: number, t: number): void {
        let player = this.gameObjects.player;
        let floor = this.gameObjects.floor;
        let normal = this.gameObjects.normal;
        let box = this.gameObjects.box;
        let g = 0.5  
        player.handleInput(dt);

        normal.transform.set(floor.transform.pos, undefined, floor.transform.rotate);
        //normal.transform.setPos(0, 0, 0)
        floor.transform.setRotate(-0.4, 0, 0);
        floor.transform.centre = vec3.fromValues(0, 0, 10)
        let xr = floor.transform.rotate[0]
        let zr = floor.transform.rotate[2]
        let n = vec3.fromValues(-Math.sin(zr), Math.cos(xr)*Math.cos(zr), Math.sin(xr)*Math.cos(zr))
        box.transform.set(floor.transform.centre);
        box.transform.setScale(0.1, 0.1, 0.1)
        // player gravity
        let pos = player.transform.pos 
        // player bounds on floor
        //      get current floor position
        /*
            n : normal
            (x,y,z): player position
            (a,b,c): point on the plane
            y = b + (nx(a-x) + nz(c-z))/ny

        */


        let a = 0;
        let b = 2;
        let c = 10;

        let grad = vec3.fromValues(-n[0]*g/n[1], g, -n[2]*g/n[1])
        vec3.sub(pos, pos, grad)

        let x = pos[0];
        let z = pos[2];

        let y = b + (n[0]*(a-x) + n[2]*(c-z))/n[1]
        
        player.transform.setPos(x, y, z)




    }
}