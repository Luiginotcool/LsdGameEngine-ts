import { Camera, Controller, GameObject, Mesh, Scene, Transform } from "./engine.js";
import { Input } from "./input.js";
import { Vec3 } from "./math.js";
import { Render } from "./render.js";

export class Game {
    static render: Render;
    static scenes: Scene[];
    static mouseLocked: boolean;
    static frames: number;
    static globals: Globals;

    static init(render: Render) {
        this.globals = {

        }
        this.frames = 0;
        this.render = render;
        this.scenes = [];
        //this.rotationCubes_setup();
        this.planeBox_setup();
    }

    static loop(dt: number) {
        //this.rotationCubes_loop(dt);
        this.planeBox_loop(dt);
        this.render.debug = false;
    }


    static planeBox_setup() {
        this.globals.cam = new Camera(0, 2, -6, 0, 0, 60);
        let scene = new Scene();
        let plane = new GameObject();
        let box = new GameObject();
        box.mesh = Mesh.cube();

        plane.mesh = Mesh.plane();
        box.transform = new Transform().set(
            new Vec3(0, 0.5001, 0),
            new Vec3(1.5, 0.5, 1),
            undefined
        );
        plane.transform = new Transform().set(
            new Vec3(0, 0, 0),
            new Vec3(10, 1, 10),
            undefined,
        )

        //box.transform = new Transform();
        //plane.transform = new Transform();

        console.log(plane.transform)

        scene.addGameObject(plane);
        scene.addGameObject(box);

        this.globals.scene = scene;


    }


    static planeBox_loop(dt: number) {
        this.handleInput(dt);
        let render = this.render;
        let scene = this.globals.scene;
        let cam = this.globals.cam;
        render.drawScene(scene, cam);
    }

    static rotationCubes_setup() {
        this.globals.cam = new Camera(2, 0, -5, 0, 0, 45);
        this.globals.player = new GameObject();
        let scene = new Scene();
        let scene2 = new Scene();
        this.scenes.push(scene);
        this.globals.cubes = [];

        for (let i = 0; i < 100; i++) {
            let randomVec = Vec3.random(new Vec3(10, 10, 10), new Vec3(0, 0, 0));
            let newCube = new GameObject();
            newCube.mesh = Mesh.cube()//.translate(randomVec);
            newCube.transform = new Transform();
            newCube.transform.pos = randomVec;
            this.globals.cubes.push(newCube);
        }
    }

    static rotationCubes_loop(dt: number) {
        this.handleInput(dt);
        let render = this.render
        let cubes: GameObject[] = this.globals.cubes;
        let scene = this.scenes[0];

        cubes.forEach((cube, i) => {
            //cube.transform!.pos = new Vec3(this.frames / 300, 0, this.frames / 500)
            cube.transform!.rotate = new Vec3(this.frames / (cube.transform!.pos.x * 100), 0, this.frames / (cube.transform!.pos.x * 200))
            scene.gameObjectArray = cubes;
        })
        render.drawScene(scene, this.globals.cam);
        
    }

    static handleInput(dt: number) {
        let sensitivity = 0.001;
        let speed = 0.01 * dt;
        let cam = this.globals.cam;
        
        // Update camera rotation based on mouse movement
        if (this.mouseLocked) {
            if (Input.mouseX) {
                cam.heading += Input.mouseDx * sensitivity;
                cam.pitch -= Input.mouseDy * sensitivity;
                if (Math.abs(cam.pitch) > Math.PI/2) {
                    cam.pitch = Math.sign(cam.pitch) * Math.PI/2;
                }
                Input.mouseX = 0;
                Input.mouseY = 0;
            } else {
                Input.mouseX = 0;
            }
        }
        
        // Calculate forward direction
        let vx = speed * -Math.sin(cam.heading);
        let vz = speed * Math.cos(cam.heading);
        if (Input.keys.up) {
            cam.pos.x -= vx
            cam.pos.z += vz;
        }
        if (Input.keys.down) {
            cam.pos.x += vx;
            cam.pos.z -= vz;
        }
        if (Input.keys.left) {
            cam.pos.x -= vz;
            cam.pos.z -= vx;
        }
        if (Input.keys.right) {
            cam.pos.x += vz;
            cam.pos.z += vx;
        }

        if (Input.keys.space) {
            cam.pos.y += speed
        }

        if (Input.keys.shift) {
            cam.pos.y -= speed;
        }

    }
}