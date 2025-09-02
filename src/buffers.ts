import { Scene } from "./engine";

export class InitBuffers {
    static initBuffers(gl: WebGLRenderingContext, vertexArray: number[], indexArray: number[], textureCoordArray: number[]) {
        const positionBuffer = InitBuffers.initPositionBuffer(gl, vertexArray);

        const textureCoordBuffer = InitBuffers.initTextureBuffer(gl, textureCoordArray);

        const indexBuffer = InitBuffers.initIndexBuffer(gl, indexArray);

        return {
            position: positionBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        };
    }

    static initPositionBuffer(gl: WebGLRenderingContext, vertexArray: number[]) {
        // Create a buffer for the square's positions.
        const positionBuffer = gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);



        let positions: number[] = []
        vertexArray.forEach((v)=>{positions.push(v)})


        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        return positionBuffer;
    }


    static initIndexBuffer(gl: WebGLRenderingContext, indexArray: number[]) {
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.

        let indices: number[] = [];
        indexArray.forEach((index) => {indices.push(index);})

        // Now send the element array to GL

        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            gl.STATIC_DRAW
        );

        return indexBuffer;
        }

    static initTextureBuffer(gl: WebGLRenderingContext, textureCoordArray: number[]) {
        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        /*
        const textureCoordinates = [
            // Front
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Back
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Top
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Bottom
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Right
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Left
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        ];
        */
        let textureCoordinates: number[] = []
        textureCoordArray.forEach((texCoord) => {textureCoordArray.push(texCoord)})

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(textureCoordinates),
            gl.STATIC_DRAW
        );
        return textureCoordBuffer;
    }
}