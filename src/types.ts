export type ProgramInfo = {
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

export type Buffers = {
    position: WebGLBuffer,
    textureCoord: WebGLBuffer,
    indices: WebGLBuffer,
}

export type DebugText = {
    [heading: string] : string | number
}

export type keyFunctions = {
    [key: string] : Function
}

export type Globals = {
    [key: string] : any
}

