'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(newVector) {
    if (!newVector instanceof Vector) {
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
    if (!pos instanceof Vector) {
      throw new Error('Неправильный тип объекта pos');
    }
    if (!size instanceof Vector) {
      throw new Error('Неправильный тип объекта size');
    }
    if (!speed instanceof Vector) {
      throw new Error('Неправильный тип объекта speed');
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }
  act () {
      
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
    if (arguments[3] === undefined)
      return 'actor';
    else
      return arguments[3];
  }

  isIntersect(otherActor) {
    if (!otherActor instanceof Actor) {
      throw new Error('Неправильный тип объекта otherActor');
    }
    if (otherActor === undefined) {
      throw new Error('Не задан тип объекта otherActor');
    }
    if (otherActor === this) {
      return false;
    }
    if (
      (this.left <= otherActor.right && otherActor.right <= this.right
        || this.left <= otherActor.left && otherActor.left <= this.right)
      &&
      (this.bottom <= otherActor.top && otherActor.top <= this.top
        || this.bottom <= otherActor.bottom && otherActor.bottom <= this.top)
    ) {
      return true;
    } else
      return false;
  }
}

class Level {
  constructor(grid, actors) {
    this.grid = grid;
    this.actors = actors;
    if (!actors === undefined) {
      let player = actors.filter(actor => actor.type === actor);
      this.player = player[0];
    }
    if (!grid === undefined) {
      this.height = grid.length;
      this.width = grid.reduce(function (max, current) {
        return Math.max(max, current.length);
      }, 0);
    }
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    if (!status === null && finishDelay < 0) {
      return true;
    }
    return false;
  }
  actorAt(actorCheck) {
    if (!actorCheck instanceof Actor) {
      throw new Error('Неправильный тип объекта Actor');
    }
    if (actorCheck === undefined) {
      throw new Error('Не задан тип объекта Actor');
    }
    for (let item of this.actors) {
      if (actorCheck.isIntersect(item)) {
        return item;
      }
    }
  }
  obstacleAt(vectorPos, vectorSize) {
    if (!vectorPos instanceof Vector) {
      throw new Error('Неправильный тип объекта vectorAt');
    }
    if (!vectorSize instanceof Vector) {
      throw new Error('Неправильный тип объекта vectorSize');
    }
    
        let newPositionVector = vectorPos.plus(vectorSize);
        if (newPositionVector.y < 0) {
            return 'lava';
        } else if (newPositionVector.y-1 > this.grid.length) {
            return 'wall';
        } else if (newPositionVector.y > this.grid[newPositionVector.y-1].length) {
            return 'wall';
        } else if (this.grid[newPositionVector.y-1][newPositionVector.x-1] !== undefined) {
            return this.grid[newPositionVector.y-1][newPositionVector.x-1];
            //return undefined;
        }
//        for (let counterX = vectorPos.x - 1; counterX++; counterX < vectorSize.x) {
//            console.log(counterX);
//            for (let counterY = vectorPos.y - 1; counterY++; counterY < vectorSize.y) {
//                console.log(counterY);
//                if (counterY < 0) {
//                    return 'lava';
//                } else if (counterY > this.grid.length) {
//                    return 'wall';
//                } else if (counterX > this.grid[counterY].length) {
//                    return 'wall';
//                } else if (this.grid[counterY][counterX] !== undefined) {
//                    return this.grid[counterY][counterX];
//                    //return undefined;
//                }
//            }
//        }
  }
  removeActor(Actor) {
    this.grid.forEach(function (row) {
      row.forEach(function (cell) {
        if (this.grid[row][cell] === Actor) {
          this.grid[row][cell] = undefined;
          return;
        }
      });
    });
  }

  noMoreActors(actorType) {
    this.grid.forEach(function (row, indexY, arrY) {
      row.forEach(function (cell, indexX, arrX) {
        if (cell !== undefined && cell.type === actorType) {
          return false;
        }
      });
    });
    return true;
  }

  playerTouched(objectType, objectActor) {
    if (this.status === null) {
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
    //super();
  }
  actorFromSymbol(strActor) {
    if (strActor === '@') {
      return Player;
    }
    else if (strActor === 'o') {
      return Coin;
    }
    else if (strActor === '=') {
      return HorizontalFireball;
    }
    else if (strActor === '|') {
      return VerticalFireball;
    }
    else if (strActor === 'v') {
      return FireRain;
    }
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
    let actors = [];
    for (let row of strArray) {
      //let newRow = [];
      for (let cell of row) {
        let prototypeConstructor = this.actorFromSymbol(cell);
        if (prototypeConstructor === undefined) {

        } else {
          let newObj = new prototypeConstructor(new Vector(row.indexOf(cell), strArray.indexOf(row)));
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
    super(pos, new Vector(1, 1), speed, 'fireball');
  }
  getNextPosition(time = 1) {
    let speedTime = new Vector(this.speed.x, this.speed.y).times(time);
    return new Vector(this.pos.x, this.pos.y).plus(speedTime);
  }
  handleObstacle() {
    this.speed = this.speed.times(-1);
  }
  act(time, gameField) {
    this.getNextPosition(time);

    if (gameField.obstacleAt(this.speed, this.size) === undefined) {
      this.handleObstacle();
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(1, 1), new Vector(2, 0));
  }
}
class VerticalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(1, 1), new Vector(0, 2));
  }
}
class FireRain extends Fireball {
  constructor(pos) {
    super(pos, new Vector(1, 1), new Vector(0, 3));
  }
}
class Сoin extends Actor {
  constructor(pos) {
    super(pos, new Vector(0.6, 0.6), new Vector(), 'coin');
    this.pos.plus(new Vector(0.2, 0.1));
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
    return this.basePosition.plus(getSpringVector);
  }
  act(time) {
    this.pos = this.getNextPosition(time);
  }
}
class Player extends Actor {
  constructor(pos) {
    super(pos.plus(0, -0.5), new Vector(0.8, 1.5), new Vector(), 'player');
  }
}

console.log("Проверка связи");