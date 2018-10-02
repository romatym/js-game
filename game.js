'use strict';

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    plus(newVector) {
        if (!(newVector instanceof Vector)) {
            throw new Error('Неправильный тип объекта newVector');
        }
        return new Vector(newVector.x + this.x, newVector.y + this.y);
    }
    times(multiplier) {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }
}

class Actor {
    constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
        if (!(pos instanceof Vector)) {
            throw new Error('Неправильный тип объекта pos');
        }
        if (!(size instanceof Vector)) {
            throw new Error('Неправильный тип объекта size');
        }
        if (!(speed instanceof Vector)) {
            throw new Error('Неправильный тип объекта speed');
        }
        this.pos = pos;
        this.size = size;
        this.speed = speed;
//    if (arguments[3] !== undefined) {
//       //this.type = arguments[3];
//    }
    }
    
    act() {

    }
    get left() {
        return this.pos.x;
    }
    get right() {
        return this.pos.x + this.size.x;
    }
    get top() {
        return this.pos.y;// + this.size.y;
    }
    get bottom() {
        return this.pos.y + this.size.y;
    }
    get type() {
        //if (arguments[3] === undefined) {
        return 'actor';
//    }
//    else {
//       return arguments[3];
//    }
    }

    isIntersect(otherActor) {
        if (!(otherActor instanceof Actor)) {
            throw new Error('Неправильный тип объекта otherActor');
        }
        if (otherActor === undefined) {
            throw new Error('Не задан тип объекта otherActor');
        }
        if (otherActor === this) {
            return false;
        }

        //переведем в координаты
        let this1 = this.pos.plus(this.size);
        let otherActor1 = otherActor.pos.plus(otherActor.size);

        let a = this.pos;
        a.x1 = this1.x;
        a.y1 = this1.y;

        let b = otherActor.pos;
        b.x1 = otherActor1.x;
        b.y1 = otherActor1.y;

        //проверим по пересечению диагоналей прямоугольников
        let res1 = IntersectionDiagonal(a.x, a.y, a.x1, a.y1, b.x, b.y, b.x1, b.y1);
        let res2 = IntersectionDiagonal(a.x, a.y1, a.x1, a.y, b.x, b.y, b.x1, b.y1);

        if (res1 || res2) {
            //есть пересечение по диагоналям
            return true;
        }

        // а теперь проверим на один прямоугольник внутри другого
        if (
                (this.left < otherActor.right && otherActor.right < this.right
                        || this.left < otherActor.left && otherActor.left < this.right)
                &&
                (this.top < otherActor.top && otherActor.top < this.bottom
                        || this.top < otherActor.bottom && otherActor.bottom < this.bottom)
                ) {
            return true;
        } else
            return false;
    }
}

function IntersectionDiagonal(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    let v1, v2, v3, v4;
    v1 = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1);
    v2 = (bx2 - bx1) * (ay2 - by1) - (by2 - by1) * (ax2 - bx1);
    v3 = (ax2 - ax1) * (by1 - ay1) - (ay2 - ay1) * (bx1 - ax1);
    v4 = (ax2 - ax1) * (by2 - ay1) - (ay2 - ay1) * (bx2 - ax1);
    return (v1 * v2 < 0) && (v3 * v4 < 0);
}

class Level {
    constructor(grid, actors) {
        this.grid = grid;
        this.actors = actors;
        if (actors !== undefined) {
            let player = undefined;
            this.actors.forEach(function (item, i, arr) {
                if (item.type === 'player') {
                    player = item;
                }
            });
            this.player = player;
        }
        if (grid === undefined) {
            this.height = 0;
            this.width = 0;
        } else {
            this.height = grid.length;
            this.width = grid.reduce(function (max, current) {
                return Math.max(max, current.length);
            }, 0);
        }
        this.status = null;
        this.finishDelay = 1;
    }

    isFinished() {
        if (this.status !== null && this.finishDelay < 0) {
            return true;
        }
        return false;
    }
    actorAt(actorCheck) {
        if (!(actorCheck instanceof Actor)) {
            throw new Error('Неправильный тип объекта Actor');
        }
        if (actorCheck === undefined) {
            throw new Error('Не задан тип объекта Actor');
        }
        if (this.actors === undefined) {
            return undefined;
        }

        for (let item of this.actors) {
            if (actorCheck.isIntersect(item)) {
                return item;
            }
        }
    }
    obstacleAt(vectorPos, vectorSize) {
        if (!(vectorPos instanceof Vector)) {
            throw new Error('Неправильный тип объекта vectorAt');
        }
        if (!(vectorSize instanceof Vector)) {
            throw new Error('Неправильный тип объекта vectorSize');
        }

        if (vectorPos.x < 0) {
            //|| vectorPos.x > this.grid[0].length) {
            return 'wall';
        } else if (vectorPos.y > this.grid.length) {
            return 'wall';
        } else if (vectorPos.y < 0) {
            return 'wall';
        }
        let newPositionVector = vectorPos.plus(vectorSize);
        if (newPositionVector.y < 0) {
            return 'lava';
        } else if (newPositionVector.y > this.grid.length) {
            return 'lava';
        }
        if (!Number.isInteger(newPositionVector.y) && !Number.isInteger(newPositionVector.x)) {
            //дробное число
            if(this.grid[Math.ceil(newPositionVector.y-1)][Math.ceil(newPositionVector.x-1)] === 'wall'
                || this.grid[Math.floor(newPositionVector.y-1)][Math.floor(newPositionVector.x-1)] === 'wall') {
                    return 'wall';
                }
                
        } else if (this.grid[newPositionVector.y] === undefined) {
            return 'lava';
        } else if (newPositionVector.y > this.grid[newPositionVector.y].length) {
            return 'wall';
        } else if (newPositionVector.x > this.grid[0].length) {
            return 'wall';
        } else if (this.grid[newPositionVector.y][newPositionVector.x] !== undefined) {
            return this.grid[newPositionVector.y][newPositionVector.x];
            //return undefined;
//        }
//                &&
//                this.grid[Math.ceil(newPositionVector.y-1)][Math.ceil(newPositionVector.x-1)] === 'wall'
//                || this.grid[Math.floor(newPositionVector.y-1)][Math.floor(newPositionVector.x-1)] === 'wall'
//                ) {
//            return 'wall';
        } else if (this.grid[newPositionVector.y] === undefined) {
            return 'lava';
        } else if (newPositionVector.y > this.grid[newPositionVector.y].length) {
            return 'wall';
        } else if (newPositionVector.x > this.grid[0].length) {
            return 'wall';
        } else if (this.grid[newPositionVector.y][newPositionVector.x] !== undefined) {
            return this.grid[newPositionVector.y][newPositionVector.x];
            //return undefined;
        }
    }
    removeActor(deleteActor) {
        this.actors.forEach(function (item, i, arr) {
            if (item === deleteActor) {
                delete arr[i];
                return;
            }
        });
    }

    noMoreActors(actorType) {
        if (this.actors === undefined) {
            return true;
        }
        let result = true;
        this.actors.forEach(function (item, i, arr) {
            if (item.type === actorType) {
                result = false;
                return;
            }
        });
        return result;
    }

    playerTouched(objectType, objectActor) {
        if (this.status !== null) {
            return;
        }
        if (objectType === 'lava' || objectType === 'fireball') {
            this.status = 'lost';
            return;
        }
        if (objectType === 'coin') {
            this.removeActor(objectActor);
        }
        if (this.noMoreActors('coin')) {
            this.status = 'won';
        }
    }
}

class LevelParser {
    constructor(symbolsVocabulary) {
        this.vocabulary = symbolsVocabulary;
    }
    actorFromSymbol(strActor) {
        if (strActor === undefined) {
            return undefined;
        }
        return this.vocabulary[strActor];
    }
    obstacleFromSymbol(strObstacle) {
        if (strObstacle === 'x')
            return 'wall';
        else if (strObstacle === '!')
            return 'lava';
    }
    createGrid(strArray) {
        let grid = [];
        for (let row of strArray) {
            let newRow = [];
            for (let cell of row) {
                newRow.push(this.obstacleFromSymbol(cell));
            }
            grid.push(newRow);
        }
        return grid;
    }
    createActors(strArray) {
        if (this.vocabulary === undefined) {
            return [];
        }
        if (strArray.length === 0) {
            return [];
        }
        
        let actors = [];
        //for (let row of strArray) {
        for(let z=0; z < strArray.length; z++) {
            let row = strArray[z];
            //for (let cell of row) {
            for(let i=0; i < row.length; i++) {
                let cell = row[i];
                let prototypeConstructor = this.actorFromSymbol(cell);
                if (prototypeConstructor === undefined 
                        || !(typeof prototypeConstructor === "function")
                        || !(new prototypeConstructor instanceof Actor)
                        ) {

                } else {
                    let newObj = new prototypeConstructor(new Vector(i, z));
                    actors.push(newObj);
                }
            }
        }
        return actors;
    }
    parse(strArray) {
        let grid = this.createGrid(strArray);
        let actors = this.createActors(strArray);
        return new Level(grid, actors);
    }
}

class Fireball extends Actor {
    constructor(pos, speed) {
        super(pos, new Vector(1, 1), speed);
    }
    getNextPosition(time = 1) {
        let speedTime = new Vector(this.speed.x, this.speed.y).times(time);
        return new Vector(this.pos.x, this.pos.y).plus(speedTime);
    }
    handleObstacle() {
        this.speed = this.speed.times(-1);
    }
    act(time, gameField) {
        let nextPosition = this.getNextPosition(time);

        if (gameField.obstacleAt(this.pos, this.size) === undefined) {
            this.pos = nextPosition;
        } else {
            this.handleObstacle();
        }
//        if (!(gameField.obstacleAt(this.pos, this.size) === undefined)) {
//            this.handleObstacle();
//        }
    }
    get type() {
        return 'fireball';
    }
}

class HorizontalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(2, 0));
    }
}

class VerticalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 2));
        this.size = new Vector(1, 1);
    }
}

class FireRain extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 3));
        this.size = new Vector(1, 1);
        this.basePosition = this.pos;
    }
    handleObstacle() {
        this.speed = this.speed.times(1);
        this.pos = this.basePosition;
    }    
}

class Coin extends Actor {
    constructor(pos) {
        super(pos, new Vector(0.6, 0.6), new Vector());
        this.pos = this.pos.plus(new Vector(0.2, 0.1));
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = Math.random() * 2 * (Math.PI);
        this.basePosition = this.pos;
    }
    updateSpring(time = 1) {
        this.spring = this.spring + this.springSpeed * time;
    }
    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }
    getNextPosition(time = 1) {
        //return this.pos.plus(getSpringVector);
        this.updateSpring(time);
        return this.basePosition.plus(this.getSpringVector());
    }
    act(time) {
        this.pos = this.getNextPosition(time);
    }
    get type() {
        return 'coin';
    }
}

class Player extends Actor {
    constructor(pos = new Vector(0, 0)) {
        super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector(), 'player');
    }
    get type() {
        return 'player';
    }
}

console.log("Проверка связи");

//const grid = [
//  Array(4),
//  Array(4),
//  Array(4),
//  Array(4).fill('wall')
//];
//const level = new Level(grid);
//const position = new Vector(2.1, 1.5);
//const size = new Vector(0.8, 1.5);
//const nothing = level.obstacleAt(position, size);
//expect(nothing).to.be.undefined;
const grid = [
  Array(4).fill('wall'),
  Array(4),
  Array(4),
  Array(4)
];
const level = new Level(grid);
const position = new Vector(2.1, 1);
const size = new Vector(0.8, 1.5);
const nothing = level.obstacleAt(position, size);
//expect(nothing).to.be.undefined;