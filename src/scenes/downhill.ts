import { vec3, mat3 } from "gl-matrix";
import { Body, Camera, Scene, Skybox } from "../engine";
import { Plane } from "../gameObjects/plane";
import { Player } from "../gameObjects/player";
import { Cube } from "../gameObjects/cube";
import { Arrow } from "../gameObjects/arrow";
import { Input } from "../input";
import { PlaneCollider } from "../colliders/PlaneCollider";

export enum PlayerState {
    sliding,
    jumping,
    falling,
    none
}

export class Downhill extends Scene {
    floorY?: number;
    impact?: vec3;
    t?: number;
    init() {

        // Plane that goes downhill
        let floorPos = vec3.fromValues(0, 0, 0);
        let floorDim = vec3.fromValues(1000, 1, 1000);
        let floorRot = vec3.fromValues(-0.001, 0, -0.0);
        let floorCentre = vec3.fromValues(0, 0, 10);
        let floor = new Plane("floor", floorPos, floorDim, floorRot, floorCentre);
        let floorNormal = PlaneCollider.normalFromRotation(floorRot);
        floor.collider = new PlaneCollider(floorNormal, floorCentre)
        floor.setTexture("/snow.png")


        // Player
        let playerPos = vec3.fromValues(0, 2, 10);
        let player = new DownhillPlayer(playerPos);

        


        //let normal = new Cube("normal", normalPos, normalDim, planeRot)
        //let normal = new Arrow("normal")
        //normal.setColourTexture(0, 100, 255);
        //normal.setTexture("/cubetexture.png")

        //let box = new Cube("box")




        let numTrees = 1000;
        let treeRange = 500
        let trees = [];

        for (let i = 0; i < numTrees; i++) {
            let x = (Math.random()-0.5)*treeRange*2
            let z = (Math.random()-0.5)*treeRange*2;
            let y = floor.collider.getY(x, z);
            let treePos = vec3.fromValues(x,y,z);
            let treeScale = vec3.fromValues(4, (Math.random()+0.2)*5, 4)
            let tree = new Arrow("tree"+i, treePos, treeScale)
            trees.push(tree);
        }



        

        this.addGameObjects([floor, player]);
        this.addGameObjects(trees);
        this.addSkybox(new Skybox());
    }

    update(dt: number): void {
        let player = this.gameObjects.player as DownhillPlayer;
        let floor = this.gameObjects.floor as Plane;
        floor.collider = floor.collider!;
        player.body = player.body!
        player.handleInput(dt);
        vec3.copy(player.body.pos, player.transform.pos)
        let pos = player.body.pos;
        let vel = player.body.vel;
        let acc = vec3.create();
        let newPos = vec3.create();
        let floorNormal = floor.collider.normal;
        let [nx,ny,nz] = floorNormal;
        let floorY = floor.collider.getY(pos[0], pos[2])
        this.floorY = floorY;

        let friction = 1;
        let g = 3;
        let j = 3;
        let grad = vec3.fromValues(-nx/ny, 1, -nz/ny);
        let jumpSpeed = 5;
        let bounded = false;


        switch (player.state) {
            case PlayerState.none:
                if (vel[1] > 0) {
                    player.state = PlayerState.jumping
                    break;
                }
                if (pos[1] > floorY) {
                    player.state = PlayerState.falling;
                    break;
                }
                player.state = PlayerState.sliding;
                bounded = true;
                break;
            
            case PlayerState.sliding:
                vec3.scale(acc, grad, -g/friction);
                bounded = true; 

                if (Input.keys.space) {
                    // jump
                    vec3.scaleAndAdd(vel, vel, floorNormal, jumpSpeed);
                    vel[1] = jumpSpeed
                    player.state = PlayerState.jumping;
                }
                break;

            case PlayerState.falling:
                acc = vec3.fromValues(0, -g, 0);

                if (pos[1] <= floorY) {
                    bounded = true;
                    player.state = PlayerState.sliding;
                }
                break;
                
            case PlayerState.jumping:
                acc = vec3.fromValues(0, -g/j, 0);
                let [q, r] = floor.collider.getSpan();
                let [qx,qy,qz] = q;
                let [rx,ry,rz] = r;
                let [vx,vy,vz] = vel;
                let [px,py,pz] = pos;
                
                let D = vec3.create();
                let coefs = vec3.create();
                vec3.sub(D, pos, floor.collider.origin);
                let M = mat3.fromValues(
                    vx, qx, rx,
                    vy, qy, ry,
                    vz, qz, rz
                )
                console.log(M.toLocaleString())
                let Minv = vec3.create();
                vec3.inverse(Minv, M);
                console.log(M.toString())

                vec3.transformMat3(coefs, D, M);
                let t = -coefs[0]
                
                if (t > 0 || pos[1] < floorY) {
                    // falling
                    player.state = PlayerState.falling;
                }
                this.t = t;
                this.impact = vec3.create();
                vec3.scaleAndAdd(this.impact, pos, vel, t)
                
                
                if (vel[1] < 0) {
                }
                break;
        }

        vec3.scaleAndAdd(vel, vel, acc, dt/1000);
        vec3.scaleAndAdd(pos, pos, vel, dt/1000);
        if (bounded) {
            pos[1] = floorY
        }
        player.transform.pos = vec3.fromValues(pos[0], pos[1], pos[2])
        player.camera!.pos = vec3.fromValues(pos[0], pos[1]+2, pos[2])

        /*

        get floor y level

        if sliding:
            acc = scale * gradient
            new y pos = floor y

            if spacebar: jumping
        if falling:
            acc = gravity

            if ypos < floor y: sliding
        if jumping:
            acc = gravity / j
        
            if yvel < 0: falling
        */
    }

    update2(dt: number, t: number): void {
        let player = this.gameObjects.player as Player;
        let floor = this.gameObjects.floor as Plane;
        floor.collider = floor.collider!;
        player.handleInput(dt);

        


        let n = floor.collider.normal;
        // player gravity
        let pos = player.transform.pos 
        let vel = player.body!.vel
        // player bounds on floor
        //      get current floor position
        /*
            n : normal
            (x,y,z): player position
            (a,b,c): point on the plane
            y = b + (nx(a-x) + nz(c-z))/ny

        */

        let force = 1
        let jumpForce = 4;
        let g = 0.003


        let a = 0;
        let b = 2;
        let c = 10;

        //let vel = vec3.scale(vec3.create(), grad, force)
        //let yv = vel[1];

        //vel[1] = yv-g;
        //vec3.add(pos, pos, vel)

        //vel[1] = vel[1]-g

        let x = pos[0];
        let z = pos[2];

        let y = b + (n[0]*(a-x) + n[2]*(c-z))/n[1]
        this.y = y;

        let ynew = pos[1]

        let grad = vec3.fromValues(-n[0]/n[1], 0.5, -n[2]/n[1]);

        switch (this.playerState) {
            case PlayerState.sliding:
                if (pos[1] <= y+0.1) {
                    vec3.scale(vel, grad, -force*g*dt);
                    vec3.add(pos, pos, vel)
                    pos[1] = y;


                    //vel[1] = 0
                }
                if (Input.keys.space) {
                    this.playerState = PlayerState.jumping
                    let jump = vec3.create();
                    vec3.scale(jump, n, jumpForce);
                    vec3.add(vel, vel, jump);
                    vec3.add(pos, pos, vel)
                }
                break;
            case PlayerState.jumping:
                vel[1] = vel[1] - g*dt
                if (pos[1] <= y && vel[1]<0) {
                    ynew = y;
                    this.playerState = PlayerState.sliding
                }
                vec3.add(pos, pos, vel)
                break;
        }




        
        player.transform.set(pos)




    }
}

export class DownhillPlayer extends Player {
    state: PlayerState
    noclip: Boolean
    body: Body

    constructor(pos: vec3) {
        super("player", pos)
        this.body = new Body(pos);
        this.state = PlayerState.none
        this.noclip = false;
    }

    handleInput(dt: number): void {
        let sensitivity = 0.001;
        let dv = 0.01 * dt;
        let cam = this.camera;
        let pos = this.transform.pos;
        let vel = this.body.vel;

        if (cam == null || pos == null) {
            return
        }
        
        // Update camera rotation based on mouse movement
        if (Input.mouseLocked) {
            if (true) {
                let dx = Input.mouseDx;
                let dy = Input.mouseDy;

                cam.heading -= dx * sensitivity;
                cam.pitch -= dy * sensitivity;


                //cam.heading += Input.mouseX * sensitivity;
                //cam.pitch -= Input.mouseY * sensitivity;
                if (Math.abs(cam.pitch) > Math.PI/2) {
                    cam.pitch = Math.sign(cam.pitch) * Math.PI/2;
                }
                Input.mouseDx = 0;
                Input.mouseDy = 0;
            } else {    
                //Input.mouseX = 0;
            }
        }

        
        // Calculate forward direction
        let vx = dv * Math.sin(cam.heading);
        let vz = dv * Math.cos(cam.heading);
        if (Input.keys.down) {
            vel[0] += vx
            vel[2] += vz;
        }
        if (Input.keys.up) {
            vel[0] -= vx;
            vel[2] -= vz;
        }
        if (Input.keys.right) {
            vel[0] += vz;
            vel[2] -= vx;
        }
        if (Input.keys.left) {
            vel[0] -= vz;
            vel[2] += vx;
        }

        if (Input.keys.space) {
            //pos[1] += speed
        }

        if (Input.keys.shift) {
            //vel[1] -= speed;
        }
        this.body.vel = vel;
        this.camera!.pos = pos;
    }

    update(dt: number): void {



        // do bounds

        switch (this.state) {
            case PlayerState.none:
                break;
            case PlayerState.sliding:
                break;
            case PlayerState.jumping:
                break;
            case PlayerState.falling:
                break;
        }
    }
}