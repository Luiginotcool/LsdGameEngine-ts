import { glMatrix, mat4, vec3 } from "gl-matrix";
import { Buffers, ProgramInfo } from "./types";
import { readBuilderProgram } from "typescript";
import { InitBuffers } from "./buffers"

export class Render {
    static vsSource: string;
    static fsSource: string;
    static gl: WebGLRenderingContext
    static width: number;
    static height: number;
    static programInfo: ProgramInfo;
    static texture: WebGLTexture;
    static buffers: Buffers;


    static init(gl: WebGLRenderingContext, width: number, height: number) {
        Render.width = width;
        Render.height = height;
        Render.gl = gl;
        this.vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying highp vec2 vTextureCoord;

        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vTextureCoord = aTextureCoord;
        }
        `;

        // Fragment shader program

        this.fsSource = `
        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
        `;


        // Set clear color to black, fully opaque
        gl.clearColor(0.5, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);

        const shaderProgram = Render.initShaderProgram(Render.vsSource, Render.fsSource);
        if (shaderProgram === null ) { alert("no shader program"); return null;}

        // Collect all the info needed to use the shader program.
        // Look up which attributes our shader program is using
        // for aVertexPosition, aVertexColor and also
        // look up uniform locations.
        Render.programInfo = {
            program: shaderProgram,
            attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
            },
            uniformLocations: {
            projectionMatrix: gl.getUniformLocation(
                shaderProgram,
                "uProjectionMatrix"
            ),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
            },
        };

        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        //Render.buffers = Buffer.initBuffers(gl);

        // Load texture
        Render.texture = Render.loadTexture("cubetexture.png");
        // Flip image pixels into the bottom-to-top order that WebGL expects.
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);


    }

    static initShaderProgram(vsSource: string, fsSource: string) {
        let gl = Render.gl;
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
        if (vertexShader === null || fragmentShader === null) {alert("no shader"); return null;}

        // Create the shader program

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram
            )}`
            );
            return null;
        }

        return shaderProgram;
    }

    static loadShader(type: number, source: string) {
        let gl = Render.gl;
        const shader = gl.createShader(type);
        if (shader === null) {alert("no shader"); return null;}
        // Send the source to the shader object

        gl.shaderSource(shader, source);

        // Compile the shader program

        gl.compileShader(shader);

        // See if it compiled successfully

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
            );
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    static loadTexture(url: string) {
        let gl = Render.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel
        );

        const image = new Image();
        image.crossOrigin = "anonymous";
        function isPowerOf2(value: number) {
            return (value & (value - 1)) === 0;
        }
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image
            );
            console.log("Texture loaded")

            // WebGL1 has different requirements for power of 2 images
            // vs non power of 2 images so check if the image is a
            // power of 2 in both dimensions.
            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
            } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };
        image.src = url;

        return texture;
    }

    static colourTexture(r: number, g: number, b: number) {
        /*r,g,b: [0-255]*/
        let gl = Render.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([r, g, b, 255]); // opaque blue
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel
        );
        return texture;
    }

    static createModelViewMatrix(
        modelPos: vec3, modelRotate: vec3, modelScale: vec3, modelCentre: vec3,
        camPos: vec3, camRotate: vec3,
    ) {
        const modelViewMatrix = mat4.create();

        // Now move the drawing position a bit to where we want to
        // start drawing the square.
        mat4.translate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to translate
            modelPos
        ); // amount to translate

        mat4.translate(
            modelViewMatrix,
            modelViewMatrix,
            vec3.fromValues(-modelCentre[0], -modelCentre[1], -modelCentre[2])
        )

        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            modelRotate[2], // amount to rotate in radians
            [0, 0, 1]
        ); // axis to rotate around (Z)
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            modelRotate[1], // amount to rotate in radians
            [0, 1, 0]
        ); // axis to rotate around (Y)
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            modelRotate[0], // amount to rotate in radians
            [1, 0, 0]
        ); // axis to rotate around (X)

        mat4.scale(
            modelViewMatrix,
            modelViewMatrix,
            modelScale,
        )
        let negCamPos = vec3.create();
        let negCamRotate = vec3.create();
        vec3.negate(negCamPos, camPos);
        vec3.negate(negCamRotate, camRotate);
        mat4.translate(
            modelViewMatrix,
            modelViewMatrix,
            negCamPos
        )
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            negCamRotate[2], // amount to rotate in radians
            [0, 0, 1]
        ); // axis to rotate around (Z)
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            negCamRotate[1], // amount to rotate in radians
            [0, 1, 0]
        ); // axis to rotate around (Y)
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            negCamRotate[0], // amount to rotate in radians
            [1, 0, 0]
        ); // axis to rotate around (X)

        return modelViewMatrix;
    }

    static createProjectionMatrix(fov: number) {
        const fieldOfView = (fov * Math.PI) / 180; // in radians
        const aspect = Render.width / Render.height;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        return projectionMatrix;
    }

    

    static drawBuffers(
        programInfo: ProgramInfo,
        buffers: Buffers, 
        modelViewMatrix: mat4,
        projectionMatrix: mat4,   
        vertexCount: number,
        texture: WebGLTexture,  
    ) {
        let gl = Render.gl;
        gl.clearColor(0.0, 0.5, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        console.log("CLEAR")

 


        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        Render.setPositionAttribute(buffers, programInfo);

        Render.setTextureAttribute(buffers, programInfo);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);

        // Set the shader uniforms
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        );
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );

        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

        {
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
    }

    static setPositionAttribute(buffers: Buffers, programInfo: ProgramInfo) {
        let gl = Render.gl;
        const numComponents = 3;
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    static setTextureAttribute(buffers: Buffers, programInfo: ProgramInfo) {
        let gl = Render.gl;
        const num = 2; // every coordinate composed of 2 values
        const type = gl.FLOAT; // the data in the buffer is 32-bit float
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set to the next
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            num,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
        }
}