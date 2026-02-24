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

export type SkyboxProgramInfo = {
    program: WebGLProgram;
    attribLocations: {
        vertexPosition: number;
    };
    uniformLocations: {
        uSkybox: WebGLUniformLocation | null;
        uViewDirectionProjectionInverse: WebGLUniformLocation | null;
    };
};

export type FaceInfo = {
    target: number;
    url: string;
}

export type Buffers = {
    position: WebGLBuffer,
    textureCoord: WebGLBuffer,
    indices: WebGLBuffer,
}

export type SkyboxBuffers = {
    position: WebGLBuffer,
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

