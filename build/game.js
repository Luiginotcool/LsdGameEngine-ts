import { Camera, GameObject, Mesh, Scene } from "./engine.js";
import { Input } from "./input.js";
import { Vec3 } from "./math.js";
export class Game {
    static init(render) {
        this.cam = new Camera(2, 0, -5, 0, 0);
        this.render = render;
        let scene = new Scene();
        this.sceneArray = [scene];
        this.cubes = [];
        for (let i = 0; i < 3000; i++) {
            let randomVec = Vec3.random(new Vec3(15, 0, 15), new Vec3(0, 0, 0));
            console.log(randomVec);
            let newCube = new GameObject();
            newCube.mesh = Mesh.cube().translate(randomVec);
            this.cubes.push(newCube);
        }
    }
    static loop(dt) {
        this.handleInput(dt);
        let render = this.render;
        this.cubes.forEach((cube, i) => {
            let newCube = new GameObject();
            if (cube.mesh === null) {
                return;
            }
            newCube.mesh = cube.mesh.translate(new Vec3(0, Math.sin(Game.frames / (100000 / i) + (i * 12426 % Math.PI * 2)) * 5, 0));
            this.sceneArray[0].gameObjectArray[i] = newCube;
        });
        let buffers = render.initBuffers(this.sceneArray[0]);
        if (buffers === null) {
            alert("Buffers are null");
            return;
        }
        render.drawScene(render.programInfo, buffers, this.cam);
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
