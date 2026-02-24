import { Camera, Body, GameObject, Mesh, Scene, Transform, BoxCollider, PhysicsSystem, PlaneCollider, Colour } from "./engine.js";
import { Input } from "./input.js";
import { Vec3 } from "./math.js";
export class Game {
    static init(render) {
        this.globals = {};
        this.frames = 0;
        this.render = render;
        this.scenes = [];
        //this.rotationCubes_setup();
        this.collides_setup();
    }
    static loop(dt) {
        //this.rotationCubes_loop(dt);
        this.collides_loop(dt);
        this.render.debug = false;
    }
    static collides_setup() {
        let scene = new Scene();
        let plane = new GameObject();
        let box1 = new GameObject();
        let box2 = new GameObject();
        let player = new GameObject();
        let ps = new PhysicsSystem();
        player = new GameObject();
        player.camera = new Camera(0, 0, 0, 0, 0, 60);
        player.transform.set(new Vec3(0, 2, 4));
        plane.mesh = Mesh.plane();
        plane.transform.set(undefined, new Vec3(10, 1, 10), undefined);
        plane.body = new Body(plane.transform.pos, 1);
        plane.body.collider = new PlaneCollider(0, plane.transform.pos, plane.transform.scale);
        box1.mesh = Mesh.cube();
        box1.transform.set(new Vec3(3, 0, 0), Vec3.one(), new Vec3(this.frames, 0, 0));
        box1.body = new Body(box1.transform.pos);
        box1.body.collider = new BoxCollider(Vec3.zero(), Vec3.one(), Vec3.zero());
        box1.body.mass = 1;
        //box1.body.impulse = box1.body.gravity(0.0001);
        box2.mesh = Mesh.cube();
        box2.transform.set(new Vec3(-1, 2, -5));
        ps.addBody(box1);
        ps.addBody(plane);
        scene.addGameObject(plane);
        scene.addGameObject(box1);
        scene.addPhysicsSystem(ps);
        //scene.addGameObject(box2);
        this.globals.scene = scene;
        this.globals.player = player;
    }
    static collides_loop(dt) {
        let player = this.globals.player;
        let scene = this.globals.scene;
        let box = scene.gameObjectArray[1];
        let body = box.body;
        let camera = player.camera;
        let ps = scene.physicsSystemArray[0];
        player.handleInput(dt);
        if (Input.keys.p) {
            body.impulse = body.impulse.add(new Vec3(0, 0, 10));
        }
        box.transform.rotate = new Vec3(Game.frames / 1000, 0, Game.frames * 0);
        //body.impulse = body.impulse.add(body.gravity(9.8));
        this.render.clearScene();
        if (!box.hasMesh()) {
            return;
        }
        let mesh = box.mesh;
        let edgeList = [];
        let col = box.body.collider;
        let pos1 = col.pos;
        console.log("the posiiton of the collider is ", col.transform, pos1, box.transform);
        let dim = box.body.collider.dim;
        let pos = pos1.subtract(dim);
        let pos2 = pos1.add(dim);
        let dx = new Vec3(2 * dim.x, 0, 0);
        let dy = new Vec3(0, 2 * dim.y, 0);
        let dz = new Vec3(0, 0, 2 * dim.z);
        let vertecies = [
            pos, pos.add(dx), pos.add(dy), pos.add(dz),
            pos2, pos2.subtract(dx), pos2.subtract(dy), pos2.subtract(dz)
        ];
        vertecies = vertecies.map(v => { return v.transform(col.transform); });
        console.log(vertecies, col.transform);
        //console.log("col transform", box.body?.collider?.transform)
        edgeList = [
            [vertecies[0], vertecies[1]],
            [vertecies[0], vertecies[2]],
            [vertecies[0], vertecies[3]],
            [vertecies[1], vertecies[7]],
            [vertecies[1], vertecies[6]],
            [vertecies[2], vertecies[7]],
            [vertecies[2], vertecies[5]],
            [vertecies[3], vertecies[5]],
            [vertecies[3], vertecies[6]],
            [vertecies[4], vertecies[5]],
            [vertecies[4], vertecies[7]],
            [vertecies[4], vertecies[6]]
        ];
        //console.log(edgeList.length)
        edgeList.forEach(edge => {
            Game.render.drawVector(edge[0], edge[1], camera, Colour.BLUE);
        });
        //Game.render.drawVector(edgeList[0][0], edgeList[0][1], camera, Colour.BLUE)
        //this.render.drawPoint(new Vec3(1, 1, 1), camera);
        //this.render.drawVector(Vec3.zero(), new Vec3(2, 2, 2), camera);
        //this.render.drawScene(scene, camera!, false, false)
        ps.drawColliders(this.render, camera);
        //box.update(dt);
        scene.update(dt);
    }
    static planeBox_setup() {
        this.globals.player = new GameObject();
        this.globals.player.camera = new Camera(0, 2, -6, 0, 0, 60);
        let scene = new Scene();
        let plane = new GameObject();
        let box = new GameObject();
        box.mesh = Mesh.cube();
        this.globals.player.transform.pos = new Vec3(0, 2, -6);
        this.globals.box = box;
        plane.mesh = Mesh.plane();
        box.transform = new Transform().set(new Vec3(0, 3.5001, 0), new Vec3(1.5, 0.5, 1), undefined);
        plane.transform = new Transform().set(new Vec3(0, 0, 0), new Vec3(10, 1, 10), undefined);
        scene.addGameObject(plane);
        scene.addGameObject(box);
        this.globals.scene = scene;
    }
    static planeBox_loop(dt) {
        let player = this.globals.player;
        let render = this.render;
        let scene = this.globals.scene;
        let cam = this.globals.player.camera;
        let box = scene.gameObjectArray[1];
        //let collider: Collider = box.collider!;
        player.handleInput(dt);
        render.drawScene(scene, cam);
        //console.log("From outside the class, here is the velocity", box.collider!.vel);
        //collider.acc = player.transform.pos.subtract(collider.pos).scale(0.00000025).add(new Vec3(0, -0.000001, 0))
        //collider.update(dt);
        //box.transform.pos = collider.pos;
        //collider.showCollider(render, cam);
    }
    static handleInput(dt) {
        let sensitivity = 0.001;
        let speed = 0.01 * dt;
        let cam = this.globals.player.camera;
        let pos = this.globals.player.transform.pos;
        // Update camera rotation based on mouse movement
        if (Input.mouseLocked) {
            if (Input.mouseX) {
                cam.heading += Input.mouseDx * sensitivity;
                cam.pitch -= Input.mouseDy * sensitivity;
                if (Math.abs(cam.pitch) > Math.PI / 2) {
                    cam.pitch = Math.sign(cam.pitch) * Math.PI / 2;
                }
                Input.mouseX = 0;
                Input.mouseY = 0;
            }
            else {
                Input.mouseX = 0;
            }
        }
        // Calculate forward direction
        let vx = speed * -Math.sin(cam.heading);
        let vz = speed * Math.cos(cam.heading);
        if (Input.keys.up) {
            pos.x -= vx;
            pos.z += vz;
        }
        if (Input.keys.down) {
            pos.x += vx;
            pos.z -= vz;
        }
        if (Input.keys.left) {
            pos.x -= vz;
            pos.z -= vx;
        }
        if (Input.keys.right) {
            pos.x += vz;
            pos.z += vx;
        }
        if (Input.keys.space) {
            pos.y += speed;
        }
        if (Input.keys.shift) {
            pos.y -= speed;
        }
        this.globals.player.transform.pos = pos;
        this.globals.player.camera.pos = pos;
    }
    static rotationCubes_setup() {
        this.globals.cam = new Camera(2, 0, -5, 0, 0, 45);
        this.globals.player = new GameObject();
        let scene = new Scene();
        let scene2 = new Scene();
        this.scenes.push(scene);
        this.globals.cubes = [];
        for (let i = 0; i < 100; i++) {
            let randomVec = Vec3.random(new Vec3(10, 10, 10), new Vec3(0, 0, 0));
            let newCube = new GameObject();
            newCube.mesh = Mesh.cube(); //.translate(randomVec);
            newCube.transform = new Transform();
            newCube.transform.pos = randomVec;
            this.globals.cubes.push(newCube);
        }
    }
    static rotationCubes_loop(dt) {
        this.handleInput(dt);
        let render = this.render;
        let cubes = this.globals.cubes;
        let scene = this.scenes[0];
        cubes.forEach((cube, i) => {
            //cube.transform!.pos = new Vec3(this.frames / 300, 0, this.frames / 500)
            cube.transform.rotate = new Vec3(this.frames / (cube.transform.pos.x * 100), 0, this.frames / (cube.transform.pos.x * 200));
            scene.gameObjectArray = cubes;
        });
        render.drawScene(scene, this.globals.cam);
    }
}
