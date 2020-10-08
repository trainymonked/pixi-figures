const Loader = PIXI.Loader.shared;

PIXI.utils.skipHello();
const app = new PIXI.Application({
  width: 800,
  height: 600,
  antialias: true,
  backgroundColor: 0xeeddaa
});

(() => {
  const dvW = window.innerWidth - 20, dvH = window.innerHeight - 20;
  let scrW = dvW, scrH = dvH;
  if (dvW >= app.view.width && dvH >= app.view.height) {
    return;
  }
  if (dvH/dvW < app.view.height/app.view.width) {
    scrW = (scrH*app.view.width)/app.view.height;
  } else {
    scrH = (scrW*app.view.height)/app.view.width;
  }
  app.renderer.resize(scrW, scrH);
})();

document.getElementById('figures').appendChild(app.view);

const { width, height } = app.view, rad = height / 10;
const targetCircleSizes = [width/2, height - rad - 20, rad];
const targetSquareSizes = [width - width/5 - rad, height - rad*2 - 20, rad*2];
const targetTrianglePath = [
  width/5 + (rad*2)/Math.sqrt(3), height - 20,
  width/5 - (rad*2)/Math.sqrt(3), height - 20,
  width/5, height - 20 - rad*2
];
let figuresAmount = 0;

Loader.load(() => {
  const container = new PIXI.Container();
  createTargets(container);
  createRandomFigures(container);
  app.stage.addChild(container);

  const border = new PIXI.Graphics();
  border.lineStyle(2, 0x000000);
  border.drawPolygon([0, 0, width, 0, width, height, 0, height]);
  app.stage.addChild(border);

  const line = new PIXI.Graphics();
  line.lineStyle(1, 0x000000);
  line.moveTo(0, height - rad*3);
  line.lineTo(width, height - rad*3);
  app.stage.addChild(line);
});

function onDrag(event) {
  this.alpha = 0.5;
  this.dragging = true;
  this.data = event.data;
  this.startPosX = this.position.x;
  this.startPosY = this.position.y;
}

function onDragEnd() {
  const { x, y } = this.data.getLocalPosition(this.parent);
  let minX, maxX, minY, maxY;

  if (this.figureType === 'triangle') {
    minX = Math.min(
      targetTrianglePath[0], targetTrianglePath[2], targetTrianglePath[4]);
    maxX = Math.max(
      targetTrianglePath[0], targetTrianglePath[2], targetTrianglePath[4]);
    minY = Math.min(
      targetTrianglePath[1], targetTrianglePath[3], targetTrianglePath[5]);
    maxY = Math.max(
      targetTrianglePath[1], targetTrianglePath[3], targetTrianglePath[5]);
  } else if (this.figureType === 'square') {
    minX = targetSquareSizes[0];
    maxX = targetSquareSizes[0] + targetSquareSizes[2];
    minY = targetSquareSizes[1];
    maxY = targetSquareSizes[1] + targetSquareSizes[2];
  } else {
    minX = targetCircleSizes[0] - targetCircleSizes[2];
    maxX = targetCircleSizes[0] + targetCircleSizes[2];
    minY = targetCircleSizes[1] - targetCircleSizes[2];
    maxY = targetCircleSizes[1] + targetCircleSizes[2];
  }

  const isRightTarget = x >= minX && x <= maxX && y >= minY && y <= maxY;
  if (isRightTarget) {
    this.parent.removeChild(this);
    figuresAmount--;
    if (figuresAmount === 0) {
      gameOver();
    }
  } else {
    this.position.x = this.startPosX;
    this.position.y = this.startPosY;
  }

  this.alpha = 1;
  this.dragging = false;
  this.data = null;
}

function onDragMove() {
  if (this.dragging) {
    const { x, y } = this.data.getLocalPosition(this.parent);
    this.position.x = x;
    this.position.y = y;
  }
}

function gameOver() {
  const text = new PIXI.Text('GAME OVER', {
    fontFamily: 'Impact',
    fontSize: rad*2,
    fill: 0xffffff,
    stroke: 0x000000,
    strokeThickness: 3,
    align: 'center'
  });
  text.pivot.set(text.width/2, text.height/2);
  text.position.set(width/2, height/2 - rad);
  app.stage.addChild(text);
}

function createRandomFigures(container) {
  const figures = [];
  for (let i = 0, max = getRandom(4, 10); i < max; i++) {
    const figureType = getRandom(0, 2);
    if (figureType === 0) {
      figures[i] = createRandomTriangle();
    } else if (figureType === 1) {
      figures[i] = createRandomCircle();
    } else {
      figures[i] = createRandomSquare();
    }
    figures[i].interactive = true;
    figures[i].cursor = 'pointer';
    figures[i]
      .on('mousedown', onDrag)
      .on('mousemove', onDragMove)
      .on('mouseup', onDragEnd)
      .on('mouseupoutside', onDragEnd)
      .on('touchstart', onDrag)
      .on('touchmove', onDragMove)
      .on('touchend', onDragEnd)
      .on('touchendoutside', onDragEnd);
    container.addChild(figures[i]);
    figuresAmount++;
  }
}

function createTargets(container) {
  const triangle = createTriangle(targetTrianglePath, 0xffffff);
  container.addChild(triangle);
  const circle = createCircle(...targetCircleSizes, 0xffffff);
  container.addChild(circle);
  const square = createSquare(...targetSquareSizes, 0xffffff);
  container.addChild(square);
}

function createSquare(x, y, s, color) {
  const gr = new PIXI.Graphics();
  gr.lineStyle(1, 0x000000);
  gr.beginFill(color);
  gr.drawRect(x, y, s, s);
  gr.endFill();
  return gr;
}

function createRandomSquare() {
  const s = getRandom(rad/1.5, rad*2.5);
  const x = getRandom(s/1.5, width - s/1.5);
  const y = getRandom(s/1.5, height - rad*3 - s/1.5);
  const gr = createSquare(x, y, s, getRandom(0, 0xffffff));
  gr.pivot.set(x + s/2, y + s/2);
  gr.position.set(x, y);
  gr.rotation = getRandom(0, 360)/360;
  gr.figureType = 'square';
  return gr;
}

function createCircle(x, y, r, color) {
  const gr = new PIXI.Graphics();
  gr.lineStyle(1, 0x000000);
  gr.beginFill(color);
  gr.drawCircle(x, y, r);
  gr.endFill();
  return gr;
}

function createRandomCircle() {
  const r = getRandom(rad/2, rad*1.25);
  const x = getRandom(r, width - r);
  const y = getRandom(r, height - rad*3 - r);
  const gr = createCircle(x, y, r, getRandom(0, 0xffffff));
  gr.pivot.set(x, y);
  gr.position.set(x, y);
  gr.figureType = 'circle';
  return gr;
}

function createTriangle(path, color) {
  const gr = new PIXI.Graphics();
  gr.beginFill(color);
  gr.lineStyle(1, 0x000000);
  gr.drawPolygon(path);
  gr.closePath();
  return gr;
}

function createRandomTriangle() {
  const path = [
    rad, rad,
    getRandom(rad*2, rad*3.5), rad,
    getRandom(rad*2, rad*3.5), getRandom(rad*2, rad*3.5)
  ];
  const gr = createTriangle(path, getRandom(0, 0xffffff));
  const maxX = Math.max(path[0], path[2], path[4]);
  const maxY = Math.max(path[1], path[3], path[5]);
  gr.pivot.set(maxX/2, maxY/2);
  gr.position.set(
    getRandom(rad/2, width - rad*1.7),
    getRandom(rad, height - rad*2.5 - maxY)
  );
  gr.rotation = getRandom(0, 360)/360;
  gr.figureType = 'triangle';
  return gr;
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}
