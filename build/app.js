"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const input_js_1 = require("./input.js");
const game_js_1 = require("./game.js");
const render_js_1 = require("./render.js");
class App {
    static init() {
        App.canvas = document.getElementById("canvas");
        App.width = window.innerWidth;
        App.height = window.innerHeight;
        App.canvas.width = App.width;
        App.canvas.height = App.height;
        App.frames = 0;
        App.oldTimeStamp = 0;
        App.noLoop = false;
        let gl = App.canvas.getContext("webgl");
        if (gl === null) {
            alert("NO webgl :(");
            return;
        }
        render_js_1.Render.init(gl, App.width, App.height);
        input_js_1.Input.init();
        console.log(input_js_1.Input.keys);
        game_js_1.Game.init();
        window.requestAnimationFrame(App.gameLoop);
    }
    static gameLoop(timeStamp) {
        if (App.noLoop) {
            window.requestAnimationFrame(App.gameLoop);
        }
        else {
            App.dt = (timeStamp - App.oldTimeStamp);
            App.oldTimeStamp = timeStamp;
            let fps = Math.round(1000 / (App.dt < 1000 / 60 ? 1000 / 60 : App.dt));
            App.frames++;
            App.noLoop = false;
            window.requestAnimationFrame(App.gameLoop);
        }
    }
}
App.init();
