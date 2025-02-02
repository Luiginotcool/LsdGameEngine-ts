export class Mat4 {
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
    translate(translation) {
        let mat = new Mat4();
        mat.identity();
        mat.data[12] = translation[0];
        mat.data[13] = translation[1];
        mat.data[14] = translation[2];
        return this.multiply(mat);
    }
    rotate(angle, axis) {
        let mat = new Mat4();
        let [x, y, z] = axis;
        let len = Math.sqrt(x * x + y * y + z * z);
        if (len > 0) {
            x /= len;
            y /= len;
            z /= len;
        }
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let oneMinusCos = 1 - cos;
        mat.data.set([
            cos + x * x * oneMinusCos, x * y * oneMinusCos - z * sin, x * z * oneMinusCos + y * sin, 0,
            y * x * oneMinusCos + z * sin, cos + y * y * oneMinusCos, y * z * oneMinusCos - x * sin, 0,
            z * x * oneMinusCos - y * sin, z * y * oneMinusCos + x * sin, cos + z * z * oneMinusCos, 0,
            0, 0, 0, 1
        ]);
        return this.multiply(mat);
    }
    transformVector(vec) {
        let m = this.data; // Assuming `this.m` is a flat 4x4 column-major array
        let x = vec.x, y = vec.x, z = vec.z;
        return new Vec3(x * m[0] + y * m[1] + z * m[2], // New X
        x * m[4] + y * m[5] + z * m[6], // New Y
        x * m[8] + y * m[9] + z * m[10] // New Z
        );
    }
    ;
}
export class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    // Add another Vec3 to this Vec3
    add(vec) {
        return new Vec3(this.x + vec.x, this.y + vec.y, this.z + vec.z);
    }
    // Subtract another Vec3 from this Vec3
    subtract(vec) {
        return new Vec3(this.x - vec.x, this.y - vec.y, this.z - vec.z);
    }
    // Scale this Vec3 by a scalar value
    scale(scalar) {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
    // Normalize the Vec3 to unit length
    normalize() {
        let length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length > 0) {
            return this.scale(1 / length);
        }
        return new Vec3(0, 0, 0); // Prevent divide by zero
    }
    static random(range, offset) {
        let randomVec = new Vec3(Math.random() * range.x, Math.random() * range.y, Math.random() * range.z).add(offset).subtract(range.scale(1 / 2));
        return randomVec;
    }
    rotateAroundAxis(axis, angle) {
        // Angle in radians
        let ax, ay, az;
        // Check if the axis is a Vec3 or an array
        if (axis instanceof Vec3) {
            ax = axis.x;
            ay = axis.y;
            az = axis.z;
        }
        else if (Array.isArray(axis)) {
            if (axis.length !== 3) {
                throw new Error("Axis array must have exactly 3 elements [x, y, z].");
            }
            [ax, ay, az] = axis;
        }
        else {
            throw new Error("Axis must be either a Vec3 or a number array.");
        }
        // Normalize the axis vector
        const length = Math.sqrt(ax * ax + ay * ay + az * az);
        if (length === 0) {
            throw new Error("Axis vector cannot be zero.");
        }
        ax /= length;
        ay /= length;
        az /= length;
        // Convert angle to radians
        const theta = angle;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        // Dot product of the vector and the axis
        const dotProduct = this.x * ax + this.y * ay + this.z * az;
        // Apply Rodrigues' rotation formula
        const x = this.x * cosTheta +
            (ay * this.z - az * this.y) * sinTheta +
            ax * dotProduct * (1 - cosTheta);
        const y = this.y * cosTheta +
            (az * this.x - ax * this.z) * sinTheta +
            ay * dotProduct * (1 - cosTheta);
        const z = this.z * cosTheta +
            (ax * this.y - ay * this.x) * sinTheta +
            az * dotProduct * (1 - cosTheta);
        return new Vec3(x, y, z);
    }
    toArray() {
        return [this.x, this.y, this.z];
    }
}
