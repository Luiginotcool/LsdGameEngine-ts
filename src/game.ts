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

    static setup(): void {
        let texture = Render.loadTexture("cubetexture.png");
        let cube = new GameObject();
        let scene = new Scene();


        cube.mesh = Mesh.cube();
        cube.transform = new Transform();
        //cube.transform.set(vec3.fromValues(1,0,-4))
        cube.texture = texture;
        Game.player = new GameObject();
        Game.player.camera = new Camera(0, 0, 0, 0, 0, 45);
        Game.player.transform.set(vec3.fromValues(0, 2, 4));
        scene.addGameObject(cube);
        Game.scenes.push(scene);
        Game.globals.texture = Render.loadTexture("cubetexture.png");

    }

    static gameLoop(dt: number): void {
        Game.frames+=1;

        let scene = Game.scenes[0];
        let player = Game.player;
        player.handleInput(dt);

        Engine.drawScene(scene, player.camera!)
    }

    static draw(): void {

    }
}