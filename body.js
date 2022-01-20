export class Circle{
	constructor(x,y,radius,sides=16){
		var i;

		const vertices = [];
		for(i=0; i<sides; i++){
			vertices.push({
				x: radius * Math.cos(i * 2 * Math.PI / sides), 
				y: radius * Math.sin(i * 2 * Math.PI / sides)
			});
		}

		return {
			type: 'circle',
			position: {x: x, y:y},
			radius: radius,
			
			vertices: vertices,
		}
	}
}
export class Point{
	constructor(x,y,size){
		return {
			type: 'point',
			position: {x: x, y:y},
			size: size,

			vertices: [{x: 0, y: 0}],
		};
	}
}
export class Rectangle{
	constructor(x,y,width,height){
		var vertices = [
			{x:-width/2 , y:-height/2},
			{x:-width/2 , y: height/2},
			{x: width/2 , y: height/2},
			{x: width/2 , y:-height/2},
		];

		return {
			type: 'rectangle',
			position: {x: x, y:y},
			width: width,
			height: height,

			vertices: vertices,
		}
	}
}
export class Triangle{
	constructor(x1,y1, x2,y2, x3,y3){
		var position = {x: (x1+x2+x3)/3, y:(y1+y2+y3)/3} 
		var vertices = [
			{x: x1-position.x, y: y1-position.y},
			{x: x2-position.x, y: y2-position.y},
			{x: x3-position.x, y: y3-position.y},
		];

		return {
			type: 'triangle',
			position: position,

			vertices: vertices,
		};
	}
}
