import { Camera, GameObject, Mesh, Scene, Transform } from "./engine.js";
import { Input } from "./input.js";
import { Vec3 } from "./math.js";
export class Game {
    static init(render) {
        this.cam = new Camera(2, 0, -5, 0, 0, 45);
        this.render = render;
        let scene = new Scene();
        let scene2 = new Scene();
        this.sceneArray = [scene, scene2];
        this.cubes = [];
        for (let i = 0; i < 100; i++) {
            let randomVec = Vec3.random(new Vec3(10, 10, 10), new Vec3(0, 0, 0));
            //console.log(randomVec)
            let newCube = new GameObject();
            newCube.mesh = Mesh.cube(); //.translate(randomVec);
            newCube.transform = new Transform();
            newCube.transform.pos = randomVec;
            this.cubes.push(newCube);
        }
    }
    static loop(dt) {
        this.handleInput(dt);
        let render = this.render;
        this.cubes.forEach((cube, i) => {
            //cube.transform!.pos = new Vec3(this.frames / 300, 0, this.frames / 500)
            cube.transform.rotate = new Vec3(this.frames / (cube.transform.pos.x * 100), 0, this.frames / (cube.transform.pos.x * 200));
            this.sceneArray[0].gameObjectArray = this.cubes;
        });
        render.drawScene(render.programInfo, this.sceneArray[0], this.cam);
    }
    static handleInput(dt) {
        let sensitivity = 0.001;
        let speed = 0.01 * dt;
        // Update camera rotation based on mouse movement
        if (this.mouseLocked) {
            if (Input.mouseX) {
                this.cam.heading += Input.mouseDx * sensitivity;
                this.cam.pitch -= Input.mouseDy * sensitivity;
                if (Math.abs(this.cam.pitch) > Math.PI / 2) {
                    this.cam.pitch = Math.sign(this.cam.pitch) * Math.PI / 2;
                }
                Input.mouseX = 0;
                Input.mouseY = 0;
            }
            else {
                Input.mouseX = 0;
            }
        }
        // Calculate forward direction
        let vx = speed * -Math.sin(this.cam.heading);
        let vz = speed * Math.cos(this.cam.heading);
        if (Input.keys.up) {
            this.cam.pos.x -= vx;
            this.cam.pos.z += vz;
        }
        if (Input.keys.down) {
            this.cam.pos.x += vx;
            this.cam.pos.z -= vz;
        }
        if (Input.keys.left) {
            this.cam.pos.x -= vz;
            this.cam.pos.z -= vx;
        }
        if (Input.keys.right) {
            this.cam.pos.x += vz;
            this.cam.pos.z += vx;
        }
        if (Input.keys.space) {
            this.cam.pos.y += speed;
        }
        if (Input.keys.shift) {
            this.cam.pos.y -= speed;
        }
    }
}
