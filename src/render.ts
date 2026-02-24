import { glMatrix, mat4, vec3 } from "gl-matrix";
import { Buffers, FaceInfo, ProgramInfo, SkyboxBuffers, SkyboxProgramInfo } from "./types";
import { InitBuffers } from "./buffers"

export class Render {
    static vsSource: string;
    static fsSource: string;
    static vsSkybox: string;
    static fsSkybox: string;
    static gl: WebGLRenderingContext
    static width: number;
    static height: number;
    static programInfo: ProgramInfo;
    static skyboxProgramInfo: SkyboxProgramInfo;
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

        this.vsSkybox = `
        attribute vec4 a_position;
        varying vec4 v_position;
        void main() {
            v_position = a_position;
            gl_Position = a_position;
            gl_Position.z = 1.0;
        }
        `

        this.fsSkybox = `
        precision mediump float;
        
        uniform samplerCube u_skybox;
        uniform mat4 u_viewDirectionProjectionInverse;
        
        varying vec4 v_position;
        void main() {
            vec4 t = u_viewDirectionProjectionInverse * v_position;
            gl_FragColor = textureCube(u_skybox, normalize(t.xyz / t.w));
        }
        `

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

        const skyboxShaderProgram = Render.initShaderProgram(Render.vsSkybox, Render.fsSkybox);
        if (skyboxShaderProgram === null ) { alert("no shader program"); return null;}
        Render.skyboxProgramInfo = {
            program: skyboxShaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(skyboxShaderProgram, "a_position"),
            },
            uniformLocations: {
                uSkybox: gl.getUniformLocation(skyboxShaderProgram, "u_skybox"),
                uViewDirectionProjectionInverse: gl.getUniformLocation(skyboxShaderProgram, "u_viewDirectionProjectionInverse"),
            },
        };

        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        //Render.buffers = Buffer.initBuffers(gl);

        // Load texture
        //Render.texture = Render.loadTexture("cubetexture.png");
        // Flip image pixels into the bottom-to-top order that WebGL expects.
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);


    }

    static initShaderProgram(vsSource: string, fsSource: string) {
        let gl = Render.gl;
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
        if (vertexShader === null || fragmentShader === null) {alert("no shader"); return null;}
        console.log(vertexShader, fragmentShader)
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

    static cubeMapTexture(faceInfos: FaceInfo[]) {
        let gl = Render.gl;
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        faceInfos = [
            {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: '/pos_x.png',
            },
            {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: '/neg_x.png',
            },
            {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: '/neg_y.png',
            },
            {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: '/pos_y.png',
            },
            {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: '/pos_z.png',
            },
            {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: '/neg_z.png',
            },
        ]; // test
        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;

            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 512;
            const height = 512;
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;
            gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null); 
            const image = new Image();
            image.src = url;
            image.addEventListener('load', function() {
                // Now that the image has loaded make copy it to the texture.
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.texImage2D(target, level, internalFormat, format, type, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            });
        })
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        return texture;
    }

    static createViewMatrix(
        camPos: vec3, camRotate: vec3
    ) {
        const viewMatrix = mat4.create();

        // Camera transform
        mat4.rotateX(viewMatrix, viewMatrix, -camRotate[0]);
        mat4.rotateY(viewMatrix, viewMatrix, -camRotate[1]);
        mat4.rotateZ(viewMatrix, viewMatrix, -camRotate[2]);
        mat4.translate(viewMatrix, viewMatrix, [-camPos[0], -camPos[1], -camPos[2]]);

        return viewMatrix;
    }

    static createModelViewMatrix(
        modelPos: vec3, modelRotate: vec3, modelScale: vec3, modelCentre: vec3,
        camPos: vec3, camRotate: vec3,
    ) {
        const mv = mat4.create();

        // Camera transform
        mat4.rotateX(mv, mv, -camRotate[0]);
        mat4.rotateY(mv, mv, -camRotate[1]);
        mat4.rotateZ(mv, mv, -camRotate[2]);
        mat4.translate(mv, mv, [-camPos[0], -camPos[1], -camPos[2]]);

        // Model transform
        mat4.translate(mv, mv, modelPos);
        mat4.translate(mv, mv, modelCentre);
        mat4.rotateX(mv, mv, modelRotate[0]);
        mat4.rotateY(mv, mv, modelRotate[1]);
        mat4.rotateZ(mv, mv, modelRotate[2]);
        mat4.translate(mv, mv, [-modelCentre[0], -modelCentre[1], -modelCentre[2]]);
        mat4.scale(mv, mv, modelScale);

        return mv;
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


    static drawSkyboxBuffers(
        programInfo: SkyboxProgramInfo,
        buffers: SkyboxBuffers,
        viewMatrix: mat4,
        projectionMatrix: mat4,
        texture: WebGLTexture,
    ) {
        let gl = Render.gl;
        gl.useProgram(programInfo.program);

        Render.setSkyboxPositionAttribute(buffers, programInfo);

        let viewDirectionProjectionInverse = mat4.create();
        mat4.multiply(viewDirectionProjectionInverse, projectionMatrix, viewMatrix);
        mat4.invert(viewDirectionProjectionInverse, viewDirectionProjectionInverse);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.uViewDirectionProjectionInverse, false, viewDirectionProjectionInverse
        )

        gl.uniform1i(programInfo.uniformLocations.uSkybox, 0);

        gl.depthFunc(gl.LEQUAL);

        // Draw the geometry.
        gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    }

    

    static drawBuffers(
        programInfo: ProgramInfo,
        buffers: Buffers, 
        modelViewMatrix: mat4,
        projectionMatrix: mat4,   
        vertexCount: number,
        texture: WebGLTexture,  
        wireframe?: boolean,
    ) {
        let gl = Render.gl;
        gl.clearColor(0.0, 0.5, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        
        //console.log("CLEAR")

 


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
            if (wireframe) {gl.drawElements(gl.LINES, vertexCount, type, offset)}
        }
    }

    static setSkyboxPositionAttribute(buffers: SkyboxBuffers, programInfo: SkyboxProgramInfo) {
        let gl = Render.gl;
        const size = 2;
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set of values to the next
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            size,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
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