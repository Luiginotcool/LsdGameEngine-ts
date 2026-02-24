export class Maze {
    data: Cell[][];
    width: number;
    height: number;

    constructor(width: number, height: number) {
        let data = []
        for (let y = 0; y < height; y++) {
            data.push(new Array(width).fill(0).map((e, x) => {return new Cell(x, y)}));
        }

        this.data = data;
        this.width = width;
        this.height = height;
    }

    static createMaze(width: number, height: number, startX?: number, startY?: number) {
        let newMaze = new Maze(width, height);
        let stack: Cell[] = [];
        if (startX != 0 && startY != 0) {startX = undefined}
        if (startX === undefined) {
            startX = Math.round(Math.random() * width);
            startY = 0
        } 
        if (startY === undefined) {
            startY = Math.round(Math.random() * height);
            startX = 0;
        }



        let initialCell = newMaze.getCell(startX, startY, true);
        if (startX == 0) {initialCell.removeWall("W")}
        else if (startX == width-1) {initialCell.removeWall("E");}
        else if (startY == 0) {initialCell.removeWall("N")}
        else if (startY == height-1) {initialCell.removeWall("S")}
        initialCell.visited = true;
        stack.push(initialCell);

        while (stack.length > 0) {
            let currentCell = stack.pop() as Cell;
            let unvisitedNeighbours = newMaze.getUnvisitedNeighbours(currentCell);
            let unvisitedDirections = Object.keys(unvisitedNeighbours);
            if (unvisitedDirections.length > 0) {
                stack.push(currentCell);
                let randomUnvisitedDirection = unvisitedDirections[unvisitedDirections.length * Math.random() | 0];
                let [nx, ny] = Maze.directionToCoordinate(currentCell.x, currentCell.y, randomUnvisitedDirection);
                let chosenCell = newMaze.getCell(nx, ny);
                currentCell.removeWall(randomUnvisitedDirection);
                chosenCell.removeWall(Maze.opposite(randomUnvisitedDirection))
                chosenCell.visited = true;
                stack.push(chosenCell);
            }
        }



        return newMaze;
    }


    getCell(x: number, y: number, initial: boolean = false) {
        if (!this.isCoordinateValid(x, y, initial)) {
            return Cell.invalid();
        }
        return this.data[y][x]
    }

    static directionToCoordinate(x: number, y: number, direction: string) {
        switch (direction) {
            case "N":
                return [x, y-1];
            case "E":
                return [x+1, y];
            case "S":
                return [x, y+1];
            case "W":
                return [x-1, y];
            default:
                return [-1, -1]
        }
    }

    static opposite(direction: string) {
        switch (direction) {
            case "N":
                return "S"
            case "E":
                return "W"
            case "S":
                return "N"
            case "W":
                return "E"
            default:
                console.log("Invalid Direction");
                return "N";
        }
    }

    getNeighbours(cell: Cell) {
        let x = cell.x;
        let y = cell.y;

        return {
            N: this.getCell(x,y-1),
	        E: this.getCell(x+1,y),
	        S: this.getCell(x,y+1),
	        W: this.getCell(x-1,y),
        }
    }

    isCoordinateValid(x: number, y: number, initial:boolean = false) {
        if (initial) {
            if (
            x < 0 ||
            y < 0 ||
            x >= this.width ||
            y >= this.height
            ) {return false}
            else {return true}
        } else {
        if (
            x < 0 ||
            y < 0 ||
            x >= this.width-0 ||
            y >= this.height-0
        ) {return false}
        else { return true}}
    }

    getUnvisitedNeighbours(cell: Cell) {
        let neighboursObj = this.getNeighbours(cell);
        let neighbours = Object.entries(neighboursObj)
        let unvisitedKV: [string, Cell][] = [] 
        neighbours.forEach(kv => {
            if ( !kv[1].visited && !kv[1].invalid) {
                unvisitedKV.push(kv)
            }
        })
        let unvisited = Object.fromEntries(unvisitedKV);
        return unvisited;
    }

    toString() {
        /*
        for each row
            WALL ROW: CORNER, col1 N wall, WALL, col2 N wall, ... , CORNER
            CELL ROW: col1 W wall, CELL, ... , col n W wall, Cell,     col n E wall
            WALL ROW: WALL, col1 S wall, WALL, ... , col n S wall, WALL
            ...
            CELL ROW: col1, W wall, CELL, ..., col n W wall, CELL, col n E wall
            WALL ROW: CORNER, col1 S wall, WALL, ..., col n S wall, CORNER  

        Each row of cells = 2x rows of drawing + 1
        */ 

        let mazeString = ""

        // Top walls
        let rowString = "#"
        this.data[0].forEach(cell => {
            rowString += cell.N ? "##" : " #"
        })
        rowString += "\n"
        mazeString += rowString;

        for (let rowIndex = 0; rowIndex < this.height; rowIndex ++) {
            let cellString = ""
            let wallString = "#"
            let row = this.data[rowIndex];
  
            row.forEach(cell => {
                cellString += cell.W ? "#_" : " _"
                wallString += cell.S ? "##" : " #"
            })
            cellString += row.slice(-1)[0].E ? "#\n" : " \n";
            wallString += "\n";

            mazeString = mazeString.concat(cellString, wallString);
        }
        return mazeString;
    }

    toPixelArray(scale: number) {
        let height = this.height * 2 + 1
        let width = this.width * 2 + 1
        let outWidth = width * scale;
        let outHeight = height * scale;
        let buffer = new Uint8ClampedArray(outWidth * outHeight * 4);
        let mazeString = this.toString();
        let rowArray = mazeString.split("\n");
        let mazeArray: string[][] = []
        rowArray.forEach(row => {mazeArray.push(row.split(""))})


        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let v = mazeArray[y][x] == "#" ? 0 : 255;

                for (let dy = 0; dy < scale; dy++) {
                    for (let dx = 0; dx < scale; dx++) {
                        let outX = x * scale + dx;
                        let outY = y * scale + dy;
                        let pos = (outY * outWidth + outX) * 4;
                        buffer[pos] = v;
                        buffer[pos + 1] = v;
                        buffer[pos + 2] = v;
                        buffer[pos + 3] = 255;
                    }
                }
            }
        }

        return {"pxArray": buffer, "width": outWidth, "height": outHeight};
    }

    toDataURL(scale: number) {
        let {pxArray, width, height} = this.toPixelArray(scale);
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = width
        canvas.height = height
        if (ctx !== null) {
            var idata = ctx.createImageData(canvas.width, canvas.height);

            // set our buffer as source
            idata.data.set(pxArray);

            // update canvas with new data
            ctx.putImageData(idata, 0, 0);
            var dataUri = canvas.toDataURL(); 
            return dataUri;
        }
    }

    
}

export class Cell {
    N: boolean = true;
    E: boolean = true;
    S: boolean = true;
    W: boolean = true;
    visited: boolean = false;
    x: number;
    y: number;
    invalid: boolean = false;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static invalid() {
        let c =  new Cell(-1, -1);
        c.invalid = true;
        return c;
    }

    removeWall(direction: string) {
        switch (direction) {
            case "N":
                this.N = false;
                return;
            case "E":
                this.E = false;
                return;
            case "S":
                this.S = false;
                return;
            case "W":
                this.W = false;
                return;
            default:
                console.log("Invalid Direction");
                return;

        }
    }
}