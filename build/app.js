import { Render } from "./render.js";
import { Scene, GameObject, Camera, Mesh } from "./engine.js";
import { Input } from "./input.js";
import { Game } from "./game.js";
class App {
    static init() {
        let canvasNull = document.getElementById("canvas");
        if (canvasNull !== null) {
            this.canvas = canvasNull;
        }
        else {
            alert("Could not load canvas");
            return;
        }
        let glNull = this.canvas.getContext("webgl");
        if (glNull !== null) {
            this.gl = glNull;
        }
        else {
            alert("Webgl not supported");
            return;
        }
        App.width = window.innerWidth;
        App.height = window.innerHeight;
        App.canvas.width = App.width;
        App.canvas.height = App.height;
        this.gl.viewport(0, 0, App.width, App.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.render = new Render(this.gl, App.width, App.height);
        console.log("Done");
        Input.init();
        Game.init(this.render);
        window.requestAnimationFrame(this.gameLoop);
    }
    static testRender() {
        let render = this.render;
        let scene = new Scene();
        let gobj = new GameObject();
        gobj.mesh = Mesh.cube();
        scene.addGameObject(gobj);
        let cam = new Camera(0, 0, -5, 0.9, 0.5);
        let buffers = render.initBuffers(scene);
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
            Game.loop(App.dt);
            App.frames++;
            App.noLoop = false;
            window.requestAnimationFrame(App.gameLoop);
        }
    }
}
window.onload = function () {
    App.init();
};
