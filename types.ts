type ProgramInfo = {
    program: WebGLProgram;
    attribLocations: {
        vertexPosition: number;
        vertexColour: number;
        modelMatrix: number;
    };
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation | null;
        modelViewMatrix: WebGLUniformLocation | null;
    };
};

type Buffers = {
    position: WebGLBuffer,
    colour: WebGLBuffer,
    indices: WebGLBuffer,
    modelMatrix: WebGLBuffer,
}

type DebugText = {
    [heading: string] : string | number
}

type keyFunctions = {
    [key: string] : Function
}

type Globals = {
    [key: string] : any
}