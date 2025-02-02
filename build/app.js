import { Render } from "./render.js";
import { Scene, GameObject, Camera, Mesh } from "./engine.js";
import { Input } from "./input.js";
import { Game } from "./game.js";
class App {
    static init() {
        if (!this.loadWebGL()) {
            return;
        }
        App.width = window.innerWidth;
        App.height = window.innerHeight;
        App.canvas.width = App.width;
        App.canvas.height = App.height;
        App.frames = 0;
        let overlay = document.getElementById("overlay");
        if (overlay !== null) {
            this.overlay = overlay;
        }
        this.gl.viewport(0, 0, App.width, App.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.render = new Render(this.gl, App.width, App.height);
        console.log("Done");
        App.canvas.onclick = function () {
            App.canvas.requestPointerLock();
        };
        Input.init();
        Game.init(this.render);
        window.requestAnimationFrame(this.gameLoop);
    }
    static loadWebGL() {
        let canvasNull = document.getElementById("canvas");
        if (canvasNull !== null) {
            this.canvas = canvasNull;
        }
        else {
            alert("Could not load canvas");
            return false;
        }
        let glNull = this.canvas.getContext("webgl");
        if (glNull !== null) {
            this.gl = glNull;
        }
        else {
            alert("Webgl not supported");
            return false;
        }
        return true;
    }
    static testRender() {
        let render = this.render;
        let scene = new Scene();
        let gobj = new GameObject();
        gobj.mesh = Mesh.cube();
        scene.addGameObject(gobj);
        let cam = new Camera(0, 0, -5, 0.9, 0.5);
        let buffers = render.initBuffers(scene);
        if (buffers === null) {
            alert("Buffers is null");
            return;
        }
        render.drawScene(render.programInfo, buffers, cam);
    }
    static gameLoop(timeStamp) {
        if (App.noLoop) {
            window.requestAnimationFrame(App.gameLoop);
        }
        else {
            App.dt = (timeStamp - App.oldTimeStamp);
            App.oldTimeStamp = timeStamp;
            let fps = Math.round(1000 / (App.dt < 1000 / 60 ? 1000 / 60 : App.dt));
            Game.mouseLocked = (document.pointerLockElement === App.canvas);
            Game.loop(App.dt);
            App.frames++;
            Game.frames = App.frames;
            let debugString = {
                "Fps": fps,
                "x": Game.cam.pos.x,
                "y": Game.cam.pos.y,
                "z": Game.cam.pos.z,
                "heading": Game.cam.heading,
                "pitch": Game.cam.pitch,
            };
            App.displayDebug(debugString);
            App.noLoop = false;
            window.requestAnimationFrame(App.gameLoop);
        }
    }
    static displayDebug(text) {
        let displayString = "";
        for (const key in text) {
            let entry = text[key];
            if (typeof entry == "number") {
                entry = entry.toFixed(1);
            }
            displayString += `${key}: ${entry}\n`;
        }
        let displayHTML = displayString.split("\n").join("<br>");
        App.overlay.innerHTML = displayHTML;
    }
}
window.onload = function () {
    App.init();
};
