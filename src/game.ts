import { vec3 } from "gl-matrix";
import { Camera, Engine, GameObject, Mesh, Scene, Transform } from "./engine";
import { Render } from "./render";
import { Globals } from "./types";


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
    }

    static gameLoop(dt: number) {
        Game.frames+=1;

        let scene = Game.scenes[0];
        let player = Game.player;
        player.handleInput(dt);

        Engine.drawScene(scene, player.camera!)
    }

    static setupLewis(): void {
        let texture = Render.loadTexture("cubetexture.png");
 
        let scene = new Scene();
        let cube = new GameObject();
        cube.mesh = Mesh.cube();
        cube.transform = new Transform();
            //cube.transform.set(vec3.fromValues(Math.random()*5-2.5, 0, Math.random()*10 - 15))
        cube.transform.set(vec3.fromValues(0, 0, -5))
        cube.texture = texture;

        let cubes: GameObject[] = [];
        let translates: vec3[] = [];
        let phases: number[] = [];

        for (let i = 0; i < 50; i++) {
            let c = new GameObject();
            c.mesh = Mesh.cube();
            c.transform = new Transform();
            let scale = Math.random()*0.3 + 0.01
            let translate = vec3.fromValues(Math.random()*20-10, Math.random()*4 - 2, Math.random()*30 - 15)
            let phase = Math.random() * Math.PI * 2;

            
            c.transform.set(vec3.fromValues(0,0,0), vec3.fromValues(scale, scale, scale), vec3.fromValues(0,0,0))
            c.texture = texture;
            cubes.push(c);
            translates.push(translate);
            phases.push(phase);
        }


        Game.player = new GameObject();
        Game.player.camera = new Camera(0, 0, 0, 0, 0, 45);
        Game.player.transform.set(vec3.fromValues(0, 2, 4));
        scene.addGameObjects(cubes);
        Game.scenes.push(scene);
        Game.globals.texture = Render.loadTexture("cubetexture.png");
        Game.globals.translates = translates;
        Game.globals.phases = phases;

    }

    static gameLoopLewis(dt: number): void {
        Game.frames+=1;
        let translates: vec3[] = Game.globals.translates;
        let phases: number[] = Game.globals.phases;

        let scene = Game.scenes[0];
        let player = Game.player;
        player.handleInput(dt);
        scene.gameObjectArray.forEach((gameObject, i) => {
            let translate = translates[i];
            let phase = phases[i];
            let t = vec3.fromValues(0, Math.sin(Game.frames / 100 + phase), Math.cos(Game.frames / 120 + phase));
            console.log(i, t, translate, phase, gameObject);
            vec3.add(t, t, translate);
            
            gameObject.transform.set(t)
        })

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

        room.texture = Render.loadTexture("cubetexture.png");

        // Player
        player.camera = new Camera(0, 0, 0, 0, 0, 45);
        player.transform.set(vec3.fromValues(0, 0, 4));
        

        // Cube
        cube.mesh = Mesh.cube();
        cube.transform.set(vec3.fromValues(-2, -1, -5))

        // Scene
        scene.addGameObjects([room, player, cube])
        Game.player = player;

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

    static draw(): void {

    }


}