import { Camera, GameObject, Mesh, Scene } from "./engine.js";
import { Input } from "./input.js";
import { Vec3 } from "./math.js";
export class Game {
    static init(render) {
        this.cam = new Camera(2, 0, -5, 0, 0);
        this.render = render;
        let scene = new Scene();
        let gobj = new GameObject();
        gobj.mesh = Mesh.cube();
        scene.addGameObject(gobj);
        this.sceneArray = [scene];
        console.log("Dims, ", this.render.width, this.render.height);
    }
    static loop(dt) {
        this.handleInput();
        let render = this.render;
        let scene = this.sceneArray[0];
        let cam = this.cam;
        let buffers = render.initBuffers(scene);
        render.drawScene(render.programInfo, buffers, cam);
    }
    static handleInput() {
        let sensitivity = 0.001;
        let speed = 0.1;
        // Update camera rotation based on mouse movement
        this.cam.heading = (Input.mouseX - this.render.width / 2) * sensitivity;
        this.cam.pitch = (-Input.mouseY + this.render.height / 2) * sensitivity;
        // Calculate direction vectors
        let forward = new Vec3(Math.sin(this.cam.heading), Math.sin(this.cam.pitch), Math.cos(this.cam.heading)).normalize();
        let right = new Vec3(Math.cos(this.cam.heading), 0, Math.sin(this.cam.heading)).normalize();
        // Movement controls
        if (Input.keys.up) {
            this.cam.pos = this.cam.pos.add(forward.scale(speed));
        }
        if (Input.keys.down) {
            this.cam.pos = this.cam.pos.subtract(forward.scale(speed));
        }
        if (Input.keys.left) {
            this.cam.pos = this.cam.pos.subtract(right.scale(speed));
        }
        if (Input.keys.right) {
            this.cam.pos = this.cam.pos.add(right.scale(speed));
        }
    }
}
