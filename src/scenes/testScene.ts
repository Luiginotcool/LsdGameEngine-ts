import { vec3 } from "gl-matrix";
import { Scene, Skybox } from "../engine";
import { Room } from "../gameObjects/room";
import { Player } from "../gameObjects/player";
import { Cube } from "../gameObjects/cube"


export class TestScene extends Scene {
    init() {
        // make room, box, skybox
        let roomCentre = vec3.fromValues(-2, -1, -5);
        let roomDim = vec3.fromValues(8, 3, 15);
        let room = new Room("room", roomCentre, roomDim, "/bg.png");

        // Player
        let player = new Player("player", vec3.fromValues(0, 0, 4));
        
        // Cube
        let cube = new Cube("cube", vec3.fromValues(-2, -1, -5))
        cube.setTexture("/cubetexture.png") 

        // Scene
        this.addGameObjects([room, player, cube])
        this.addSkybox(new Skybox());
    }

    update(dt: number, t: number): void {
        this.gameObjects.player.handleInput(dt);
        let cube = this.gameObjects.cube
        //console.log(scene.gameObjects, cube)
        
        cube.transform.rotate = vec3.fromValues(0, t/100, 0)
        cube.transform.setPos(-2, -1 + 0.5*Math.sin(t/25), -5)
    }
}