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
        return this.pos.y;// + this.size.y;
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
        // эта проверка лишняя
        if (otherActor === undefined) {
            throw new Error('Не задан тип объекта otherActor');
        }
        if (otherActor === this) {
            return false;
        }

        // всё что ниже нужно переписать,
        // алгоритм следующий:
        // если объект выше, ниже, левее или правее,
        // то он не пересекается с данным
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

// лишняя функция
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
        // лучше добавить значение по-умолчанию
        if (actors !== undefined) {
            // для поиска объектов в массиве есть специальный метод
            let player = undefined;
            this.actors.forEach(function (item, i, arr) {
                if (item.type === 'player') {
                    player = item;
                }
            });
            this.player = player;
        }
      // лучше добавить значение по-умолчанию
        if (grid === undefined) {
            this.height = 0;
            this.width = 0;
        } else {
            this.height = grid.length;
            // тут лучше использовать стрелочную функцию (будет короче)
            this.width = grid.reduce(function (max, current) {
                return Math.max(max, current.length);
            }, 0);
        }
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
        // лучше добавить значение по-умолчанию в консрукторе и убрать проверки
        if (this.actors === undefined) {
            return undefined;
        }

        // для поиска элемента в массиве есть специальный метод
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
            return 'wall';
        // если if заканчивается на return, то else можно не писать
        }
        if (vectorPos.y > this.grid.length) {
            return 'wall';
        }
        if (vectorPos.y < 0) {
            return 'wall';
        }
        let newPositionVector = vectorPos.plus(vectorSize);
        // if (newPositionVector.y < 0) {
        //     return 'lava';
        // // эта проверка уже есть выше
        // }
        // if (newPositionVector.y > this.grid.length) {
        //     return 'lava';
        // }
        // нужно переписать, алгоритм:
        // найти клетки которые занимает объект,
        // перебрать их и вернуть препятствие, если оно нашлось
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
        } else if (this.grid[newPositionVector.y] === undefined) {
            return 'lava';
        } else if (newPositionVector.y > this.grid[newPositionVector.y].length) {
            return 'wall';
        } else if (newPositionVector.x > this.grid[0].length) {
            return 'wall';
        } else if (this.grid[newPositionVector.y][newPositionVector.x] !== undefined) {
            return this.grid[newPositionVector.y][newPositionVector.x];
        }
    }
    removeActor(deleteActor) {
        // для поиска индекса элемента в массиве есть специальный метод
        this.actors.forEach(function (item, i, arr) {
            if (item === deleteActor) {
                arr.splice(i, 1);//delete arr[i];
                return;
            }
        });
    }

    noMoreActors(actorType) {
        // см. выше
        if (this.actors === undefined) {
            return true;
        }
        let result = true;
        // тут тоже можно использовать метод массива
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
        // проверка ничего не делает
        //Метод actorFromSymbol - Вернет undefined, если не передать символ - автотест ругается
        if (strActor === undefined) {
            return undefined;
        }
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
        // здесь лучше использовать метод map 2 раза
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
        // лучше добавить значение по-умолчанию
        // в конструкторе и убрать проверку
        if (this.vocabulary === undefined) {
            return [];
        }

        // если значение присваивается переменной 1 раз,
        // то лучше использовать const
        const actors = [];
        for(let z=0; z < strArray.length; z++) {
            const row = strArray[z];
            for(let i=0; i < row.length; i++) {
                //const cell = row[i];
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
        // не опускайте аргументы конструктора Vector
        super(pos, new Vector(0.6, 0.6), new Vector(0, 0));
        // pos должно задавться через вызов родительского конструктора
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
        // не опускайте аргументы конструктора Vector
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
    'v': FireRain
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
    .then(() => console.log('Вы выиграли приз!'));