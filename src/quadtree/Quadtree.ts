import BoundingBox from "../utils/math/BoundingBox";
import Vec2, { vec2 } from "../utils/math/Vector";
import Point from "./Point";

export interface QuadtreeParams {
	capacity?: number;
}

/**
* Basic implementation follow Wikipedia pseudo code
* https://www.wikiwand.com/en/articles/Quadtree#Pseudocode
**/
export default class Quadtree<T> {
	private readonly capacity: number;
	private bound_box: BoundingBox;
	private points: Point<T>[];

	/**
	* Four Quadrants
	* Q1 | Q2
	* --------
	* Q3 | Q4
	**/
	private Q1?: Quadtree<T> | null = null;
	private Q2?: Quadtree<T> | null = null;
	private Q3?: Quadtree<T> | null = null;
	private Q4?: Quadtree<T> | null = null;

	constructor(center: Vec2, half_dim: Vec2, {
		capacity = 5,
	}: QuadtreeParams = {}) {
		this.bound_box = new BoundingBox(center, half_dim);
		this.capacity = capacity;
		this.points = [];
	}

	insert(point: Point<T>) {
		if (!this.bound_box.isContainsPoint(point)) return false;

		if (this.points.length < this.capacity && this.Q1 === null) {
			this.points.push(point);
			return true;
		}

		if (this.Q1 === null) this.subdivide();

		if (this.Q1!.insert(point)) return true;
		if (this.Q2!.insert(point)) return true;
		if (this.Q3!.insert(point)) return true;
		if (this.Q4!.insert(point)) return true;

		return false;
	}

	subdivide() {
		const center = this.bound_box.center;
		// new half width and half height for the sub quadtree
		const sub_half = this.bound_box.half_dim.div(2.0);
		this.Q1 = new Quadtree<T>(center.sub(sub_half), sub_half);
		this.Q2 = new Quadtree<T>(center.add(vec2(sub_half.x, -sub_half.y)), sub_half);
		this.Q3 = new Quadtree<T>(center.add(sub_half), sub_half);
		this.Q4 = new Quadtree<T>(center.add(vec2(-sub_half.x, sub_half.y)), sub_half);
	}

	queryRange(range: BoundingBox) {

	}
}
