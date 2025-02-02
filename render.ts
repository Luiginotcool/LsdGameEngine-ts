import { Camera, Scene } from "./engine.js";
import { Mat4, Vec3 } from "./math.js";

export class Render {
    private vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColour;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColour;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColour = aVertexColour;
    }
    `;

    private fsSource = `
    varying lowp vec4 vColour;

    void main(void) {
      gl_FragColor = vColour;
    }
    `;

    private gl: WebGLRenderingContext;
    public programInfo: ProgramInfo;

    constructor(gl: WebGLRenderingContext, public width: number, public height: number) {
        this.gl = gl;
        let shaderProgram = this.initShaderProgram(this.vsSource, this.fsSource);

        if (shaderProgram === null) {
            throw "The shader program could not be created";
        }

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                vertexColour: gl.getAttribLocation(shaderProgram, "aVertexColour"),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
            },
        };
        console.log(this.programInfo)
    }

    initShaderProgram(vsSource: string, fsSource: string) {
        let gl = this.gl;
        let vertexShader = this.createShader(gl.VERTEX_SHADER, vsSource);
        let fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fsSource); 

        if (vertexShader === null || fragmentShader === null) {
            return null;
        }

        let program = this.createProgram(vertexShader, fragmentShader);
        return program;
    }


    compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number): WebGLShader | null {
        // Create the shader object
        var shader = gl.createShader(shaderType);

        if (shader === null) {
            return null;
        }
    
        // Set the shader source code.
        gl.shaderSource(shader, shaderSource);
    
        // Compile the shader
        gl.compileShader(shader);
    
        // Check if it compiled
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
        // Something went wrong during compilation; get the error
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
        }
    
        return shader;
    }

    createShader(type: number, source: string): WebGLShader | null {
        let gl = this.gl;
        let shader = gl.createShader(type);
        if (shader === null) {
            return null;
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
    
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
        let gl = this.gl;
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        let sucess = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (sucess) {
            return program;
        }
    
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    drawScene(programInfo: ProgramInfo, buffers: Buffers, camera: Camera) {
        let gl = this.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    
        let cubeRotation = 0.5
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        let fov = (45 * Math.PI) / 180;
        let aspect = this.width / this.height;
        let zNear = 0.1;
        let zFar = 100.0;
        let projectionMatrix = Mat4.perspective(fov, aspect, zNear, zFar);
    
        let modelViewMatrix = new Mat4();

        let viewMatrix = new Mat4();
        viewMatrix.identity();
        
        // Move the world in the opposite direction of the camera position
        viewMatrix.multiply(new Mat4().translate([-camera.pos.x, -camera.pos.y, camera.pos.z]));
        
        // Apply inverse pitch (rotate world around camera's local right axis)
        let rightVector = new Mat4().rotate(camera.heading, [0, 1, 0]).transformVector(new Vec3(-1, 0, 0));
        viewMatrix.multiply(new Mat4().rotate(-camera.pitch, rightVector));
        
        // Apply inverse heading (rotate world around the Y-axis)
        viewMatrix.multiply(new Mat4().rotate(-camera.heading, [0, 1, 0]));
        viewMatrix.multiply(new Mat4().rotate(-camera.pitch, [0, 1, 0]));
        


        
        modelViewMatrix.identity();
        
        // Rotate around the Z axis
        modelViewMatrix.multiply(new Mat4().rotate(cubeRotation, [0, 0, 1]));
        
        // Rotate around the Y axis
        modelViewMatrix.multiply(new Mat4().rotate(-0.9, [0, 1, 0]));
        
        // Rotate around the X axis
        modelViewMatrix.multiply(new Mat4().rotate(cubeRotation * 0.1, [1, 0, 0]));
        
        // Translate after rotation
        modelViewMatrix.multiply(new Mat4().translate([0.0, 0.0, -5.0]));

        modelViewMatrix.multiply(viewMatrix);


        this.setColourAttribute(programInfo, buffers);
        this.setPositionAttribute(programInfo, buffers);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    
        gl.useProgram(programInfo.program)
    
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix.data,
        );
    
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix.data,
        );
    
        {
            let vertexCount = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE) / 2; 
            let type = gl.UNSIGNED_SHORT;
            let offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            console.log(vertexCount)
        }

    }

    setPositionAttribute(programInfo: ProgramInfo, buffers: Buffers) {
        let gl = this.gl;
        let numComponents = 3;
        let type = gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset,
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    setColourAttribute(programInfo: ProgramInfo, buffers: Buffers) {
        let gl = this.gl;
        let numComponents = 4;
        let type = gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colour);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColour,
            numComponents,
            type,
            normalize,
            stride,
            offset,
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColour);
    }

    initBuffers(scene = new Scene()) {
        let gl = this.gl;
        let positionBuffer = this.initPositionBuffer(scene);
        let colourBuffer = this.initColourBuffer(scene);
        let indexBuffer = this.initIndexBuffer(scene);
        return {
            position: positionBuffer,
            colour: colourBuffer,
            indices: indexBuffer,
        };
    }

    initPositionBuffer(scene: Scene) {
        let gl = this.gl;
        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        let positions: number[] = []
        scene.gameObjectArray.forEach((gameObject) => {
            if (gameObject.mesh != null) {
                positions = positions.concat(...gameObject.mesh.vertexArray);
            }
        })
        console.log("Positions", positions)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        return positionBuffer;
    }

    initIndexBuffer(scene: Scene) {
        let gl = this.gl;
        let indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        let indices: number[] = []
        let indexOffset = 0;
        scene.gameObjectArray.forEach((gameObject) => {
            if (gameObject.mesh != null) {
                gameObject.mesh.indexArray.forEach((index) => {
                    indices = indices.concat(index);
                })
                indexOffset += gameObject.mesh.vertexArray.length;
            }
        })
        console.log("indices", indices)
    
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        return indexBuffer;
    }

    initColourBuffer(scene: Scene) {
        let gl = this.gl;
        const faceColors = [
            [1.0, 1.0, 1.0, 1.0], // Front face: white
            [1.0, 0.0, 0.0, 1.0], // Back face: red
            [0.0, 1.0, 0.0, 1.0], // Top face: green
            [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
            [1.0, 1.0, 0.0, 1.0], // Right face: yellow
            [1.0, 0.0, 1.0, 1.0], // Left face: purple
          ];
        
          // Convert the array of colors into a table for all the vertices.
        
          var colors: any = [];
        
          for (var j = 0; j < faceColors.length; ++j) {
            const c = faceColors[j];
            // Repeat each color four times for the four vertices of the face
            colors = colors.concat(c, c, c, c);
          }
        
          const colorBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        
          return colorBuffer;
    }

}

