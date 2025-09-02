import { Input } from "./input.js";
import { Game } from "./game.js";
import { Render} from "./render.js"

class App {
    static canvas: HTMLCanvasElement;
    static width: number;
    static height: number;
    static frames: number;
    static oldTimeStamp: number;
    static noLoop: boolean;
    static dt: number;

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

            App.frames++;
    
            App.noLoop = false;
            window.requestAnimationFrame(App.gameLoop);
        }
    }
}

App.init();