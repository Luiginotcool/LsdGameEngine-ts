import { Render } from "./render.js";

export class Game {
    static init(): void {
        let cubeRotation = 0.0;
        let deltaTime = 0;

    }

    static gameLoop(dt: number): void {
        Render.drawScene(Render.programInfo, Render.buffers, Render.texture, 0);
    }

    static draw(): void {

    }
}