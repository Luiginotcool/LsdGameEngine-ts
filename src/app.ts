import { Input } from "./input";
import { Game } from "./game";
import { Render} from "./render"
import { DebugText } from "./types";

export class App {
    static canvas: HTMLCanvasElement;
    static width: number;
    static height: number;
    static frames: number;
    static oldTimeStamp: number;
    static noLoop: boolean;
    static dt: number;
    static overlay: HTMLDivElement;

    static init(): void {
        App.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        App.width = window.innerWidth;
        App.height = window.innerHeight;
        App.canvas.width = App.width;
        App.canvas.height = App.height;
        App.frames = 0;
        App.oldTimeStamp = 0;

        App.noLoop = false;

        let gl = App.canvas.getContext("webgl");
        if (gl === null) {alert("NO webgl :("); return;}
        Render.init(gl, App.width, App.height)

        App.canvas.onclick = function() {
            App.canvas.requestPointerLock();
        }
        let overlay = document.getElementById("overlay");
        if (overlay !== null) {
            this.overlay = overlay as HTMLDivElement;
        }

        
        Input.init();
        console.log(Input.keys)

        Game.init();

        window.requestAnimationFrame(App.gameLoop);
    }

    static gameLoop(timeStamp: DOMHighResTimeStamp): void {
        if (App.noLoop) {
            window.requestAnimationFrame(App.gameLoop);
        } else {
            App.dt = (timeStamp - App.oldTimeStamp);
            App.oldTimeStamp = timeStamp;
            let fps = Math.round(1000 / (App.dt < 1000/60 ? 1000/60: App.dt));
            Game.gameLoop(App.dt);
            App.frames++;
            Input.mouseLocked = (document.pointerLockElement === App.canvas);

            let debugString = {
                "Fps": fps,
                "mouseX": Input.mouseX
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

