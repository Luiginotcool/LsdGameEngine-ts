"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix");
// Create two 3D vectors
const a = gl_matrix_1.vec3.fromValues(1, 2, 3);
const b = gl_matrix_1.vec3.fromValues(4, 5, 6);
// Add vectors
const sum = gl_matrix_1.vec3.create();
gl_matrix_1.vec3.add(sum, a, b);
console.log("Sum of vectors:", sum);
// Dot product
const dot = gl_matrix_1.vec3.dot(a, b);
console.log("Dot product:", dot);
// Cross product
const cross = gl_matrix_1.vec3.create();
gl_matrix_1.vec3.cross(cross, a, b);
console.log("Cross product:", cross);
// Create a 4x4 identity matrix
const matrix = gl_matrix_1.mat4.create();
console.log("Identity matrix:", matrix);
// Apply translation
gl_matrix_1.mat4.translate(matrix, matrix, [1, 2, 3]);
console.log("Translated matrix:", matrix);
// Apply rotation around Z axis (90 degrees)
gl_matrix_1.mat4.rotateZ(matrix, matrix, Math.PI / 2);
console.log("Rotated matrix:", matrix);
//# sourceMappingURL=index.js.map