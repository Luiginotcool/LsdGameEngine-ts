"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const render_js_1 = require("./render.js");
class Game {
    static init() {
        let cubeRotation = 0.0;
        let deltaTime = 0;
    }
    static gameLoop(dt) {
        render_js_1.Render.drawScene(render_js_1.Render.programInfo, render_js_1.Render.buffers, render_js_1.Render.texture, 0);
    }
    static draw() {
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map