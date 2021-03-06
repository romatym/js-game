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
        return this.pos.y;
    }
    get bottom() {
        return this.pos.y + this.size.y;
    }
    get type() {
        return 'actor';
    }

    isIntersect(otherActor) {
        if (!(otherActor instanceof Actor)) {
            throw new Error('Неправильный тип объекта otherActor');
        }
        if (otherActor === this) {
            return false;
        }

        //otherActor справа
        if(this.left >= otherActor.right) {
            return false;
        }
        //otherActor снизу
        if(this.top >= otherActor.bottom) {
            return false;
        }
        //otherActor слева
        if(this.right <= otherActor.left) {
            return false;
        }
        //otherActor сверху
        if(this.bottom <= otherActor.top) {
            return false;
        }

        return true;
    }
}
class Level {
    constructor(grid = [], actors = []) {
        this.grid = grid;
        this.actors = actors;
        this.player = this.actors.find(actor => actor.type === 'player');
        this.height = grid.length;
        this.width = grid.reduce( (max, current) => Math.max(max, current.length), 0);
        this.status = null;
        this.finishDelay = 1;
    }

    isFinished() {
        return this.status !== null && this.finishDelay < 0;
    }

    actorAt(actorCheck) {
        if (!(actorCheck instanceof Actor)) {
            throw new Error('Неправильный тип объекта Actor');
        }
        return this.actors.find(actor => actorCheck.isIntersect(actor));
    }

    obstacleAt(vectorPos, vectorSize) {
        if (!(vectorPos instanceof Vector)) {
            throw new Error('Неправильный тип объекта vectorPos');
        }
        if (!(vectorSize instanceof Vector)) {
            throw new Error('Неправильный тип объекта vectorSize');
        }
        if (vectorPos.x < 0) {
            return 'wall';
        }
        if (vectorPos.y < 0) {
            return 'wall';
        }

        const positionPlusSize = vectorPos.plus(vectorSize);
        if (positionPlusSize.y > this.height) {
            return 'lava';
        }
        if (positionPlusSize.x > this.width) {
            return 'wall';
        }

        for(let x = Math.floor(vectorPos.x); x < positionPlusSize.x; x++ ) {
            for(let y = Math.floor(vectorPos.y); y < positionPlusSize.y; y++ ) {

                const obstacle = this.grid[y][x];
                if(!(obstacle === undefined)) {
                    return obstacle;
                }
            }
        }
    }
    removeActor(deleteActor) {
        const deleteIndex = this.actors.indexOf(deleteActor);
        if(deleteIndex > -1) {
            this.actors.splice(deleteIndex, 1);
        }
    }

    noMoreActors(actorType) {
        return !(this.actors.some(actor => actor.type === actorType));
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
    constructor(symbolsVocabulary = {}) {
        this.vocabulary = symbolsVocabulary;
    }
    actorFromSymbol(strActor) {
        return this.vocabulary[strActor];
    }
    obstacleFromSymbol(strObstacle) {
        if (strObstacle === 'x') {
            return 'wall';
        }
        if (strObstacle === '!') {
            return 'lava';
        }
    }
    createGrid(strArray) {
        const grid = [];
        strArray.map(row => {
            grid.push(row.split('').map(
                    cell => {return this.obstacleFromSymbol(cell);
            }, this));
        }, this);
        return grid;
    }
    createActors(strArray) {
        const actors = [];
        for(let z=0; z < strArray.length; z++) {
            const row = strArray[z];
            for(let i=0; i < row.length; i++) {
                const prototypeConstructor = this.actorFromSymbol(row[i]);
                if (typeof prototypeConstructor === "function" && new prototypeConstructor instanceof Actor) {
                    actors.push(new prototypeConstructor(new Vector(i, z)));
                }
            }
        }
        return actors;
    }
    parse(strArray) {
        return new Level(this.createGrid(strArray), this.createActors(strArray));
    }
}

class Fireball extends Actor {
    constructor(pos, speed) {
        super(pos, new Vector(1, 1), speed);
    }
    getNextPosition(time = 1) {
        return this.pos.plus(this.speed.times(time));
    }
    handleObstacle() {
        this.speed = this.speed.times(-1);
    }
    act(time, gameField) {
        const nextPosition = this.getNextPosition(time);

        if (gameField.obstacleAt(nextPosition, this.size) === undefined) {
            this.pos = nextPosition;
        } else {
            this.handleObstacle();
        }
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
    }
}

class FireRain extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 3));
        this.basePosition = this.pos;
    }
    handleObstacle() {
        this.pos = this.basePosition;
    }    
}

class Coin extends Actor {
    constructor(pos = new Vector(0, 0)) {
        super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6), new Vector(0, 0));
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
        super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector(0, 0));
    }
    get type() {
        return 'player';
    }
}

const schemas = [
        [
            "     v                 ",
            "                       ",
            "                       ",
            "                       ",
            "                       ",
            "  |xxx       w         ",
            "  o                 o  ",
            "  x               = x  ",
            "  x          o o    x  ",
            "  x  @    *  xxxxx  x  ",
            "  xxxxx             x  ",
            "      x!!!!!!!!!!!!!x  ",
            "      xxxxxxxxxxxxxxx  ",
            "                       "
        ],
        [
            "     v                 ",
            "                       ",
            "                       ",
            "                       ",
            "                       ",
            "  |                    ",
            "  o                 o  ",
            "  x               = x  ",
            "  x          o o    x  ",
            "  x  @       xxxxx  x  ",
            "  xxxxx             x  ",
            "      x!!!!!!!!!!!!!x  ",
            "      xxxxxxxxxxxxxxx  ",
            "                       "
        ],
        [
            "        |           |  ",
            "                       ",
            "                       ",
            "                       ",
            "                       ",
            "                       ",
            "                       ",
            "                       ",
            "                       ",
            "     |                 ",
            "                       ",
            "         =      |      ",
            " @ |  o            o   ",
            "xxxxxxxxx!!!!!!!xxxxxxx",
            "                       "
        ],
        [
            "                       ",
            "                       ",
            "                       ",
            "    o                  ",
            "    x      | x!!x=     ",
            "         x             ",
            "                      x",
            "                       ",
            "                       ",
            "                       ",
            "               xxx     ",
            "                       ",
            "                       ",
            "       xxx  |          ",
            "                       ",
            " @                     ",
            "xxx                    ",
            "                       "
        ], [
            "   v         v",
            "              ",
            "         !o!  ",
            "              ",
            "              ",
            "              ",
            "              ",
            "         xxx  ",
            "          o   ",
            "        =     ",
            "  @           ",
            "  xxxx        ",
            "  |           ",
            "      xxx    x",
            "              ",
            "          !   ",
            "              ",
            "              ",
            " o       x    ",
            " x      x     ",
            "       x      ",
            "      x       ",
            "   xx         ",
            "              "
        ]
    ];

const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball
};
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
    .then(() => console.log('Вы выиграли приз!'));