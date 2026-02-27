import { Render } from "./render"

export class TextureManager {
    static loadTexture(url: string): WebGLTexture {
        return Render.loadTexture(url);
    }

    static colourTexture(r: number, g: number, b: number): WebGLTexture {
        return Render.colourTexture(r,g,b);
    }

    static cubeMapTexture(url: string): WebGLTexture {
        return Render.cubeMapTexture([]) // FINISH
    }
}