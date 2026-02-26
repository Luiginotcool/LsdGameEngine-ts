import { vec3 } from "gl-matrix";
import { Camera, Engine, GameObject, Mesh, Scene, Skybox, Transform } from "./engine";
import { Render } from "./render";
import { Globals } from "./types";
import { Maze } from "./maze";


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
        player.handleInput(dt);
        let cube = scene.gameObjectArray[2];
        cube.transform.rotate = vec3.fromValues(0, Game.frames/100, 0)
        cube.transform.setPos(vec3.fromValues(-2, -1 + 0.5*Math.sin(Game.frames/25), -5))

        Engine.drawScene(scene, player.camera!)
    }

    static createScene() {
        // Scene with a floor, walls and a cube
        let scene = new Scene();
        let room = new GameObject();
        let cube = new GameObject();
        let player = new GameObject();


        // Room
        let roomCentre = vec3.fromValues(-2, -1, -5);
        let roomDim = vec3.fromValues(8, 3, 15);
        room = this.room(roomCentre, roomDim);

        room.texture = Render.loadTexture("/bg.png");

        // Player
        player.camera = new Camera(0, 0, 0, 0, 0, 45);
        player.transform.set(vec3.fromValues(0, 0, 4));
        

        // Cube
        cube.mesh = Mesh.cube();
        cube.transform.set(vec3.fromValues(-2, -1, -5))
        cube.texture = Render.loadTexture("/cubetexture.png")

        // Scene
        scene.addGameObjects([room, player, cube])
        Game.player = player;
        scene.addSkybox(new Skybox());

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

       let wall = new GameObject();
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