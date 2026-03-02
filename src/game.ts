import { vec3 } from "gl-matrix";
import { Camera, Engine, GameObject, Mesh, Scene, Skybox, Transform } from "./engine";
import { Render } from "./render";
import { Globals } from "./types";
import { Maze } from "./maze";
import { TestScene } from "./scenes/testScene";
import { Downhill } from "./scenes/downhill";


export class Game {
    static scenes: Scene[];
    static mouseLocked: boolean;
    static frames: number;
    static globals: Globals;
    static player: GameObject;

    static init(): void {
        Game.frames = 0;
        Game.scenes = [];
        Game.globals = {}

        Game.setup();
    }


    static setup() {
        let texture = Render.loadTexture("cubetexture.png");
        let scene = this.createScene();
        Game.scenes.push(scene);

        let maze = Maze.createMaze(40, 40, 0, 0);
        //console.log(maze);
        //document.onclick = () => {window.open(maze.toDataURL(10), '_blank')!.focus();}
    }

    static gameLoop(dt: number) {
        Game.frames+=1;

        let scene = Game.scenes[0];
        let player = Game.player;
        scene.update(dt, Game.frames);
        Engine.drawScene(scene, player.camera!)
    }

    static createScene() {
        // Scene with a floor, walls and a cube
        let scene = new Downhill();
        scene.init();
        Game.player = scene.gameObjects.player

        for (let key in scene.gameObjects) {
            //console.log(key)
        }

        return scene;
    }

    static room(centre: vec3, dim: vec3) {
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

       let wall = new GameObject("room");
       wall.mesh = Mesh.cube();
       wall.transform = new Transform();
       wall.transform.set(wallPos, wallScale);
       return wall;
    }

    static mazeToGameObjects(maze: Maze) {
        /*
        for each row:
            for each cell:
                create floor and ceiling, add to respective arrays
                create N and W walls where needed, add to wall array
            add E wall to the last cell if needed, add to wall array
        for each cell in the bottom row:
            add S wall where needed, add to wall array
        
        for each mesh in floor, ceiling and wall array, union and apply texture
        

        */
    }




    static draw(): void {

    }


}