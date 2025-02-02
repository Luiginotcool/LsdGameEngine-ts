type ProgramInfo = {
    program: WebGLProgram;
    attribLocations: {
        vertexPosition: number;
        vertexColour: number;
    };
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation | null;
        modelViewMatrix: WebGLUniformLocation | null;
    };
};

type Buffers = {
    position: WebGLBuffer,
    colour: WebGLBuffer,
    indices: WebGLBuffer
}

type DebugText = {
    [heading: string] : string | number
}