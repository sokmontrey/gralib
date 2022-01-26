import Renderer from './render.js';
import { Dot, Rectangle, Circle } from './body.js';
import Enginer from './engine.js';

const canvasContainer = document.createElement('div');
document.body.appendChild(canvasContainer);

const text = document.createElement('h3');
document.body.appendChild(text);

const Render = new Renderer();
Render.init(canvasContainer, 600,600);
Render.setWireFrame(false);
Render.setShowBounds(false);

const rect = new Rectangle(0,40,100,100);
const circle = new Circle(-150,0,50, 16);
const rect2 = new Rectangle(0,-200,500,20, -Math.PI/7);

const Engine = new Enginer();
Engine.init(Render, [circle,rect], [rect2]);
Engine.run();
Render.layer['0'].canvas.addEventListener('mousemove', (e) => {
	var i;
	var hw = 300,
		hh = 300;
	const mouseX = e.offsetX - hw;
	const mouseY = -e.offsetY + hh;
	const body = circle.position
	body.x = mouseX;
	body.y = mouseY;

});
Engine.stop = false;
