import { Camera, GameObject, Scene, Mesh } from "./engine.js";
import { Game } from "./game.js";
import { Mat4, Vec3 } from "./math.js";

export class Render {
    private vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColour;
    attribute mat4 aModelMatrix;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColour;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aModelMatrix  * aVertexPosition;
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
    private isInit: boolean;
    public debug: boolean;

    constructor(gl: WebGLRenderingContext, public width: number, public height: number) {
        this.gl = gl;
        this.debug = true;
        let shaderProgram = this.initShaderProgram(this.vsSource, this.fsSource);

        if (shaderProgram === null) {
            throw "The shader program could not be created";
        }

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                vertexColour: gl.getAttribLocation(shaderProgram, "aVertexColour"),
                modelMatrix: gl.getAttribLocation(shaderProgram, "aModelMatrix"),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
            },
        };
        console.log(this.programInfo)
        this.gl.viewport(0, 0, width, height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.isInit = true;
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
        if (program === null) {
            return null;
        }
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

    clear(r: number, g: number, b: number, a: number) {
        let gl = this.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    createProjectionMatrix(camera: Camera, zNear: number, zFar: number) {
        let fov = (camera.fov * Math.PI) / 180;
        let aspect = this.width / this.height;
        let projectionMatrix = Mat4.perspective(fov, aspect, zNear, zFar);
        return projectionMatrix;
    }

    createModelViewMatrix(camera: Camera, gameObject: GameObject) {
        let modelViewMatrix = new Mat4();
        let scaleMatrix = new Mat4();
        let rotationMatrix = new Mat4();
        let translationMatrix = new Mat4();

        if (gameObject.hasTransform()) {
            let s: Vec3 = gameObject.transform!.scale;
            let r: Vec3 = gameObject.transform!.rotate;
            let p: Vec3 = gameObject.transform!.pos;
            scaleMatrix.data.set([
                s.x, 0, 0, 0,
                0, s.y, 0, 0,
                0, 0, s.z, 0,
                0, 0, 0, 1
            ])
            rotationMatrix.rotate(r.x, [1, 0, 0]);
            rotationMatrix.rotate(r.y, [0, 1, 0]);
            rotationMatrix.rotate(r.z, [0, 0, 1]);
            translationMatrix.data.set([
                1, 0, 0, p.x,
                0, 1, 0, p.y,
                0, 0, 1, p.z,
                0, 0, 0, 1
            ])
            modelViewMatrix.multiply(scaleMatrix);
            modelViewMatrix.multiply(translationMatrix);
            modelViewMatrix.multiply(rotationMatrix);

        }

        let rightVector = (new Vec3(-1, 0, 0)).rotateAroundAxis([0, 1, 0], camera.heading);
        let forward = new Vec3(
            Math.sin(camera.heading),
            0,
            Math.cos(camera.heading),
        ).rotateAroundAxis(rightVector, camera.pitch);
        let target = camera.pos.add(forward);
        let upVector = (new Vec3(0, 1, 0)).rotateAroundAxis(rightVector, camera.pitch)
        let viewMatrix = new Mat4();
        viewMatrix = Mat4.lookAt(
            [-camera.pos.x, camera.pos.y, camera.pos.z],
            [-target.x, target.y, target.z], 
            [-upVector.x, upVector.y, upVector.z]
        )

        modelViewMatrix.multiply(viewMatrix);

        
        

        return modelViewMatrix;
    }

    createModelMatrix(gameObject: GameObject) {
        let modelMatrix = new Mat4();
        let scaleMatrix = new Mat4();
        let rotationMatrix = new Mat4();
        let translationMatrix = new Mat4();
        let originMatrix = new Mat4();

        if (gameObject.hasTransform()) {
            let s: Vec3 = gameObject.transform!.scale;
            let r: Vec3 = gameObject.transform!.rotate;
            let p: Vec3 = gameObject.transform!.pos;
            s.x = s.x == 0 ? 0.01 : s.x;
            s.y = s.y == 0 ? 0.01 : s.y;
            s.z = s.z == 0 ? 0.01 : s.z;
            scaleMatrix.data.set([
                s.x, 0, 0, 0,
                0, s.y, 0, 0,
                0, 0, s.z, 0,
                0, 0, 0, 1
            ])
            rotationMatrix.rotate(r.x, [1, 0, 0]);
            rotationMatrix.rotate(r.y, [0, 1, 0]);
            rotationMatrix.rotate(r.z, [0, 0, 1]);
            translationMatrix.data.set([
                1, 0, 0, p.x,
                0, 1, 0, p.y,
                0, 0, 1, p.z,
                0, 0, 0, 1
            ])

            modelMatrix.multiply(translationMatrix);
            modelMatrix.multiply(scaleMatrix);
            modelMatrix.multiply(rotationMatrix);
            //modelMatrix.multiply()


        }

        //let id = new Mat4();

        //console.log("equals", modelMatrix.equals(id), modelMatrix, id)
        
        

        return modelMatrix.transpose();
    }

    createViewMatrix(camera: Camera) {
        let rightVector = (new Vec3(-1, 0, 0)).rotateAroundAxis([0, 1, 0], camera.heading);
        let forward = new Vec3(
            Math.sin(camera.heading),
            0,
            Math.cos(camera.heading),
        ).rotateAroundAxis(rightVector, camera.pitch);
        let target = camera.pos.add(forward);
        let upVector = (new Vec3(0, 1, 0)).rotateAroundAxis(rightVector, camera.pitch)
        let viewMatrix = new Mat4();
        viewMatrix = Mat4.lookAt(
            [-camera.pos.x, camera.pos.y, camera.pos.z],
            [-target.x, target.y, target.z], 
            [-upVector.x, upVector.y, upVector.z]
        )
        return viewMatrix;
    }

    
    drawScene(scene: Scene, camera: Camera) {
        // Clear screen
        // Create the buffers for the scene
        // Create the view matrix
        // Render scene

        if (!this.isInit) {
            return;
        }

        let programInfo = this.programInfo;

        let zNear = 0.1;
        let zFar = 100;
        let gl = this.gl;
        let vertexCount = 0;
        scene.gameObjectArray.forEach((gameObject) => {
            vertexCount += gameObject.hasMesh() ? gameObject.mesh!.indexArray.length : 0;
        })





        this.clear(0, 0, 0, 1);
        //console.log("This is drawScene3", programInfo.attribLocations.modelMatrix)

        let buffers = this.initBuffers(scene);
        if (buffers === null) {
            return;
        }

        if (this.debug) {
            console.log("vertexCount", vertexCount);
            console.log("buffers", buffers);
        }

        let projectionMatrix = this.createProjectionMatrix(camera, zNear, zFar);
        let viewMatrix = this.createViewMatrix(camera);
        this.setColourAttribute(programInfo, buffers);
        this.setPositionAttribute(programInfo, buffers);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.modelMatrix);

        const modelMatrixLocation = programInfo.attribLocations.modelMatrix;
        gl.vertexAttribPointer(modelMatrixLocation, 4, gl.FLOAT, false, 16 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(modelMatrixLocation);

        // You would then need to repeat this process for the other 3 rows of the matrix
        gl.vertexAttribPointer(modelMatrixLocation + 1, 4, gl.FLOAT, false, 16 * Float32Array.BYTES_PER_ELEMENT, 4 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(modelMatrixLocation + 1);

        gl.vertexAttribPointer(modelMatrixLocation + 2, 4, gl.FLOAT, false, 16 * Float32Array.BYTES_PER_ELEMENT, 8 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(modelMatrixLocation + 2);

        gl.vertexAttribPointer(modelMatrixLocation + 3, 4, gl.FLOAT, false, 16 * Float32Array.BYTES_PER_ELEMENT, 12 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(modelMatrixLocation + 3);
        gl.enableVertexAttribArray(programInfo.attribLocations.modelMatrix);
        gl.useProgram(programInfo.program)
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix.data,
        );
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            viewMatrix.data,
        );
        {
            let type = gl.UNSIGNED_SHORT;
            let offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            //console.log(vertexCount)
        }
    }

    initBuffers(scene: Scene) {
        let gl = this.gl;
        let positionBuffer = this.initPositionBuffer(scene);
        let colourBuffer = this.initColourBuffer(scene);
        let indexBuffer = this.initIndexBuffer(scene);
        let modelMatrixBuffer = this.initModelMatrixBuffer(scene);
        if (positionBuffer === null || 
            colourBuffer === null ||
            indexBuffer === null ||
            modelMatrixBuffer === null
        ) {
            return null;
        }
        return {
            position: positionBuffer,
            colour: colourBuffer,
            indices: indexBuffer,
            modelMatrix: modelMatrixBuffer,
        };
    }


    initPositionBuffer(scene: Scene) {
        let gl = this.gl;
        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        let positions: number[] = []
        scene.gameObjectArray.forEach((gameObject) => {
            if (gameObject.mesh != null) {
                //console.log("GO mesh", gameObject.mesh)
                gameObject.mesh.vertexArray.forEach((v)=>{positions.push(v)})
            }
        })

        if (this.debug) {
            console.log("Positions", positions)
            console.log("number of positions", positions.length / 3);

        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        return positionBuffer
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
                    indices.push(index + indexOffset);
                })
                indexOffset += gameObject.mesh.vertexArray.length / 3;
            }
        })
        if (this.debug) {
            console.log("indices", indices)
            console.log("indicies length", indices.length);

        }


        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        return indexBuffer;
    }

    initColourBuffer(scene: Scene) {
        let gl = this.gl;
        let colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    
        let faceColours: number[] = [];
        scene.gameObjectArray.forEach((gameObject) => {
            if (gameObject.hasMesh()) {
                gameObject.mesh!.faceColourArray.forEach((fc) => {faceColours.push(fc)})
                //console.log("facec", gameObject.mesh!.faceColourArray);
            }
        });

        if (this.debug) {

        }

    
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faceColours), gl.STATIC_DRAW);
        return colorBuffer;
    }

    initModelMatrixBuffer(scene: Scene) {
        let gl = this.gl;
        let modelMatrixBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelMatrixBuffer);

        let modelMatrixArray: Mat4[] = [];
        scene.gameObjectArray.forEach((gameObject => {
            //modelMatrixArray.push(this.createModelMatrix(gameObject));
            let mm = this.createModelMatrix(gameObject)

            if (gameObject.hasMesh()) {
                let numPositions = gameObject.mesh!.vertexArray.length / 3;
                if (this.debug) {
                    console.log("model matrix", mm.asObject());
                    console.log("number of positions", numPositions);
                }
                for (let i = 0; i < numPositions; i++) {
                    modelMatrixArray.push(mm)
                }
            }
        }))


        if (this.debug) {
            console.log("model matrix array", modelMatrixArray.map((mmArr) => {return mmArr.asObject()}))
            console.log("model matrix length: ", modelMatrixArray.length)
            console.log("game object array", scene.gameObjectArray)

        }


        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Mat4.flattenMat4Array(modelMatrixArray)), gl.STATIC_DRAW);
        return modelMatrixBuffer;
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
}