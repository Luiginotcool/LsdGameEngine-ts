type ProgramInfo = {
    program: WebGLProgram;
    attribLocations: {
        vertexPosition: number;
        textureCoord: number;
    };
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation | null;
        modelViewMatrix: WebGLUniformLocation | null;
        uSampler: WebGLUniformLocation | null;
    };
};

type Buffers = {
    position: WebGLBuffer,
    textureCoord: WebGLBuffer,
    indices: WebGLBuffer,
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

export { ProgramInfo, Buffers }