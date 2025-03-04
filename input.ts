export class Input {
    static keys  = {
        "left": 0,
        "right": 0,
        "up": 0,
        "down": 0,
        "p": 0,
        "shift":0,
        "space":0,
    };
    static mouseX: number;
    static mouseY: number;
    static mouseDx: number;
    static mouseDy: number;
    static leftMouse: boolean;
    static rightMouse: boolean;

    static init(): void {
        document.addEventListener('keydown', function(e) { Input.changeKey(e.key, 1)});
        document.addEventListener('keyup',   function(e) { Input.changeKey(e.key, 0) });
        document.addEventListener("mousemove", function(e) { Input.setMousePos(e.clientX, e.clientY, e.movementX, e.movementY)});
        document.addEventListener("mousedown", function(e) {Input.changeMouseDown(e.button, true)});
        document.addEventListener("mouseup", function(e) {Input.changeMouseDown(e.button, false)});
        Input.mouseDx = 0;
        Input.mouseDy = 0;
    }

    static setOnMouseDown(f: Function) {
        document.addEventListener("mousedown", function(e) {f()});
    }

    static changeKey(key:string, to:number): void {
        switch (key.toLowerCase()) {
            // left, a
            case "ArrowLeft".toLowerCase(): case "a": this.keys.left = to; break;
            // right, d
            case "ArrowRight".toLowerCase(): case "d": this.keys.right = to; break;
            // up, w
            case "ArrowUp".toLowerCase(): case "w": this.keys.up = to; break;
            // down, s
            case "ArrowDown".toLowerCase(): case "s": this.keys.down = to; break;
            // p
            case "p": this.keys.p = to; break;
            // shift
            case "Shift".toLowerCase(): this.keys.shift = to; break;
            // space
            case " ": this.keys.space = to; break;
        }
    }

    static changeMouseDown(button: number, to: boolean) {
        switch (button) {
            // left mouse
            case 0: this.leftMouse = to; break;
            // right mouse
            case 2: this.rightMouse = to; break;
        } 
    }

    static setMousePos(x: number, y:number, dx: number, dy: number) {
        Input.mouseX = x;
        Input.mouseY = y;
        Input.mouseDx = dx;
        Input.mouseDy = dy;
    }

}