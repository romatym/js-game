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

        // всё что ниже нужно переписать,
        // алгоритм следующий:
        // если объект выше, ниже, левее или правее,
        // то он не пересекается с данным
        // //////////////////////////
        // я так и сделал ниже в блоке "проверим на один прямоугольник внутри другого", но от обратного условия
        // этого оказалось недостаточно - есть примеры, когда один прямоугольник наложен на другой, и в таком случае код не проходит проверку
        // поэтому я добавил проверку на пересечение диагоналей прямоугольников
        // обе проверки в сумме дают правильный результат
        // /////////////////////////
        //переведем в координаты
        let this1 = this.pos.plus(this.size);
        let otherActor1 = otherActor.pos.plus(otherActor.size);

        let a = this.pos;
        a.x1 = this1.x;
        a.y1 = this1.y;

        let b = otherActor.pos;
        b.x1 = otherActor1.x;
        b.y1 = otherActor1.y;

        function IntersectionDiagonal(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
            let v1, v2, v3, v4;
            v1 = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1);
            v2 = (bx2 - bx1) * (ay2 - by1) - (by2 - by1) * (ax2 - bx1);
            v3 = (ax2 - ax1) * (by1 - ay1) - (ay2 - ay1) * (bx1 - ax1);
            v4 = (ax2 - ax1) * (by2 - ay1) - (ay2 - ay1) * (bx2 - ax1);
            return (v1 * v2 < 0) && (v3 * v4 < 0);
        }

        //проверим по пересечению диагоналей прямоугольников
        const res1 = IntersectionDiagonal(a.x, a.y, a.x1, a.y1, b.x, b.y, b.x1, b.y1);
        const res2 = IntersectionDiagonal(a.x, a.y1, a.x1, a.y, b.x, b.y, b.x1, b.y1);

        if (res1 || res2) {
            //есть пересечение по диагоналям
            return true;
        }

        // а теперь проверим на один прямоугольник внутри другого
        return (
            (this.left < otherActor.right && otherActor.right < this.right
                || this.left < otherActor.left && otherActor.left < this.right)
            &&
            (this.top < otherActor.top && otherActor.top < this.bottom
                || this.top < otherActor.bottom && otherActor.bottom < this.bottom)
        );
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
        if (vectorPos.y > this.grid.length) {
            return 'wall';
        }
        if (vectorPos.y < 0) {
            return 'wall';
        }
        if (vectorPos.x + vectorSize.x > this.grid[0].length) {
            return 'wall';
        }
        
        let positionPlusSize = vectorPos.plus(vectorSize);
        
        const startPosX = Math.min(vectorPos.x, positionPlusSize.x);
        const finishPosX = Math.max(vectorPos.x, positionPlusSize.x);
        const startPosY = Math.min(vectorPos.y, positionPlusSize.y);
        const finishPosY = Math.max(vectorPos.y, positionPlusSize.y);
        
        for(let x = startPosX; x < finishPosX; x++ ) {
            for(let y = startPosY; y < finishPosY; y++ ) {
                
                let integerX = Math.floor(x);
                let integerY = Math.floor(y);
                
                if (this.grid[integerY] === undefined) {
                    return 'lava';
                }
                if (y > this.grid[integerY].length) {
                    return 'wall';
                }
                if (x > this.grid[0].length) {
                    return 'wall';
                }
                if (y > this.grid[integerY].length) {
                    return 'wall';
                }
                if (x > this.grid[0].length) {
                    return 'wall';
                }
                
                let obstacle = this.grid[integerY + 1][integerX + 1];
                if(!(obstacle === undefined)) {
                    return obstacle;
                }
            }
        }
    }
    removeActor(deleteActor) {
        this.actors.splice(this.actors.indexOf(deleteActor), 1);
    }

    noMoreActors(actorType) {
        return (this.actors.find(actor => actor.type === actorType) === undefined);
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
        let grid = [];
        strArray.map(row => {
            grid.push(row.split('').map(
                    (cell) => {return this.obstacleFromSymbol(cell);
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
        return new Vector(this.pos.x, this.pos.y).plus(new Vector(this.speed.x, this.speed.y).times(time));
    }
    handleObstacle() {
        this.speed = this.speed.times(-1);
    }
    act(time, gameField) {
        let nextPosition = this.getNextPosition(time);

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
    constructor(pos) {
        super(pos, new Vector(0.6, 0.6), new Vector(0, 0));
        // pos должно задаваться через вызов родительского конструктора
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
        super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector(0, 0), 'player');
    }
    get type() {
        return 'player';
    }
}

console.log("Проверка связи");

const schemas = [
    [
        '         ',
        '         ',
        '    =    ',
        '       o ',
        '     !xxx',
        ' @       ',
        'xxx!     ',
        '         '
    ],
    [
        '      v  ',
        '    v    ',
        '  v      ',
        '        o',
        '        x',
        '@   x    ',
        'x        ',
        '         '
    ]
];
const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin
};
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
    .then(() => console.log('Вы выиграли приз!'));