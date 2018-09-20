'use strict';

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(newVector) {
        if(!newVector instanceof Vector) {
            throw 'Неправильный тип объекта newVector';
        }
        return new Vector(newVector.x + this.x, newVector.y + this.y);
    }

    times(multiplier) {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }
}

const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);

class Actor {
    constructor(pos, size, speed) {
        if(!pos instanceof Vector) {
            throw 'Неправильный тип объекта pos';
        }
        if(!size instanceof Vector) {
            throw 'Неправильный тип объекта size';
        }
        if(!speed instanceof Vector) {
            throw 'Неправильный тип объекта speed';
        }

        if(pos === undefined) {
            this.pos = new Vector(0,0);
        } else {
            this.pos = pos;
        }
        if(size === undefined) {
            this.size = new Vector(1,1);
        } else {
            this.size = size;
        }
        if(speed === undefined) {
            this.speed = new Vector(0,0);
        } else {
            this.speed = speed;
        }
    }

    act() {

    }

    Object.defineProperty(this, 'left', {
        writable: false,
        value: generateId()
    });


    isIntersect() {

    }
}

const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
    return ['left', 'top', 'right', 'bottom']
        .map(side => `${side}: ${item[side]}`)
        .join(', ');
}

function movePlayer(x, y) {
    player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
    console.log(`${title}: ${position(item)}`);
    if (player.isIntersect(item)) {
        console.log(`Игрок подобрал ${title}`);
    }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);