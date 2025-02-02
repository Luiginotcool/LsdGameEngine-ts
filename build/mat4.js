"use strict";
class Mat4 {
    constructor() {
        this.data = new Float32Array(16);
        this.identity();
    }
    identity() {
        this.data.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }
    multiply(mat) {
        let a = this.data;
        let b = mat.data;
        let result = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] =
                    a[i * 4] * b[j] +
                        a[i * 4 + 1] * b[j + 4] +
                        a[i * 4 + 2] * b[j + 8] +
                        a[i * 4 + 3] * b[j + 12];
            }
        }
        this.data.set(result);
        return this;
    }
    static perspective(fov, aspect, near, far) {
        let out = new Mat4();
        let f = 1.0 / Math.tan(fov / 2);
        let nf = 1 / (near - far);
        out.data.set([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, (2 * far * near) * nf, 0
        ]);
        return out;
    }
    static lookAt(eye, target, up) {
        let out = new Mat4();
        let zAxis = Mat4.normalize(Mat4.subtract(eye, target));
        let xAxis = Mat4.normalize(Mat4.cross(up, zAxis));
        let yAxis = Mat4.cross(zAxis, xAxis);
        out.data.set([
            xAxis[0], yAxis[0], zAxis[0], 0,
            xAxis[1], yAxis[1], zAxis[1], 0,
            xAxis[2], yAxis[2], zAxis[2], 0,
            -Mat4.dot(xAxis, eye), -Mat4.dot(yAxis, eye), -Mat4.dot(zAxis, eye), 1
        ]);
        return out;
    }
    static subtract(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }
    static normalize(v) {
        let len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
    }
    static cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }
    static dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
}
