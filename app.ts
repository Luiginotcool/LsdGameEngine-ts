import {Render} from "./render.js"
import {Scene, GameObject, Camera, Mesh} from "./engine.js"
import { Input } from "./input.js";
import { Game } from "./game.js";

class App {
    static canvas: HTMLCanvasElement;
    static overlay: HTMLDivElement;
    static gl: WebGLRenderingContext;
    static width: number;
    static height: number;
    static render: Render;
    static noLoop: boolean;
    static dt: number;
    static dtArray: number[];
    private static oldTimeStamp: DOMHighResTimeStamp;
    static frames: number;

    static init() {
        if (!this.loadWebGL()) {
            return;
        }
        App.width = window.innerWidth;
        App.height = window.innerHeight;
        App.canvas.width = App.width
        App.canvas.height = App.height;
        App.frames = 0;
        App.dtArray = Array(30).fill(1);
        let overlay = document.getElementById("overlay");
        if (overlay !== null) {
            this.overlay = overlay as HTMLDivElement;
        }

        this.render = new Render(this.gl, App.width, App.height);
        console.log("Done")

        App.canvas.onclick = function() {
            App.canvas.requestPointerLock();
        }

        Input.init();
        Game.init(this.render);
        window.requestAnimationFrame(this.gameLoop);
    }

    static loadWebGL(): Boolean {
        let canvasNull = document.getElementById("canvas");
        if (canvasNull !== null) {
            this.canvas = canvasNull as HTMLCanvasElement;
        } else {
            alert("Could not load canvas");
            return false;
        }
        let glNull = this.canvas.getContext("webgl");
        if (glNull !== null) {
            this.gl = glNull as WebGLRenderingContext;
        } else {
            alert("Webgl not supported");
            return false;
        }

        return true;
    }

    static testRender() {
        let render = this.render
        let scene = new Scene();
        let gobj = new GameObject();
        gobj.mesh = Mesh.cube()
        scene.addGameObject(gobj);
        let cam = new Camera(0,0, -5, 0.9, 0.5, 45);
        render.drawScene(scene, cam);

    }

    static gameLoop(timeStamp: DOMHighResTimeStamp): void {
        if (App.noLoop) {
            window.requestAnimationFrame(App.gameLoop);
        } else {
            App.dt = (timeStamp - App.oldTimeStamp);
            App.dtArray.push(Number.isNaN(App.dt) ? 1 : App.dt);
            App.dtArray.shift();
            let dtAvg = 0;
            App.dtArray.forEach(dt => {dtAvg += dt / App.dtArray.length;});
            App.oldTimeStamp = timeStamp;
            let fps = Math.round(1000 / (App.dt < 1000/60 ? 1000/60: App.dt));
            
            Game.mouseLocked = (document.pointerLockElement === App.canvas);
            Game.loop(App.dt);
            App.frames++;
            Game.frames = App.frames;

            let debugString = {
                "Fps": fps,
                "dt avg.": `${Math.trunc(dtAvg)}ms`,
                "x": Game.globals.cam.pos.x,
                "y": Game.globals.cam.pos.y,
                "z": Game.globals.cam.pos.z,
                "heading": Game.globals.cam.heading,
                "pitch": Game.globals.cam.pitch,
            }
            App.displayDebug(debugString)
    
            App.noLoop = false;
            window.requestAnimationFrame(App.gameLoop);
        }
    }

    static displayDebug(text: DebugText) {
        let displayString = ""
        for (const key in text){
            let entry = text[key];
            if (typeof entry == "number") {
                entry = entry.toFixed(1);
            }
            displayString += `${key}: ${entry}\n`
        }
        let displayHTML = displayString.split("\n").join("<br>");
        App.overlay.innerHTML = displayHTML;
    }
}

window.onload = function() {
    App.init();
}
