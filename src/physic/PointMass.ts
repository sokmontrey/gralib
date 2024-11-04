import Vec2 from "../utils/math/Vector.ts";

export interface PointMassParams {
	position?: Vec2,
	velocity?: Vec2,
	constant_acceleration?: Vec2,
	initial_force?: Vec2,
	mass?: number,
	is_static?: boolean,
};

export default class PointMass {
	private curr_pos: Vec2;
	private prev_pos: Vec2;
	private const_acc: Vec2;
	private net_force: Vec2;
	private mass: number;
	private is_static: boolean;

	constructor({
		position = Vec2.zero(),
		velocity = Vec2.zero(),
		mass = 1,
		is_static = false,
		constant_acceleration = Vec2.zero(),
		initial_force = Vec2.zero(),
	}: PointMassParams = {}) {

		this.curr_pos = position;
		this.prev_pos = position.sub(velocity);
		this.mass = mass;
		this.is_static = is_static;
		this.net_force = initial_force;
		this.const_acc = constant_acceleration;
	}

	getTotalAcceleration() {
		return this.net_force
			.div(this.mass)			//	 net force / mass
			.add(this.const_acc);	// + constant acceleration
	}

	enableStatic() { this.is_static = true; return this; }
	disableStatic() { this.is_static = false; return this; }

	applyForce(force: Vec2) {
		this.net_force = this.net_force.add(force);
		return this;
	}

	setConstantAcceleration(acc: Vec2) {
		this.const_acc = acc;
		return this;
	}

	// Move the pointmass to a specific coordinate 
	//		while reserve its velocity
	changePosition(position: Vec2) {
		const vel = this.curr_pos.sub(this.prev_pos);
		this.curr_pos = position;
		this.prev_pos = position.sub(vel);
		return this;
	}

	// Update current position and keep its previous position
	//		allow the pointmass to response to this movement (position-based dynamic)
	setPosition(position: Vec2) {
		this.curr_pos = position;
		return this;
	}

	// Using verlet integration
	//		for position-based integration
	update(delta_time: number) {
		if (this.is_static) return this;
		const acc = this.getTotalAcceleration();
		const vel = this.curr_pos
			.sub(this.prev_pos)
			.div(delta_time)
			.add(acc.mul(delta_time));
		this.prev_pos = this.curr_pos.copy();
		this.curr_pos = this.curr_pos.add(vel.mul(delta_time));
		return this;
	}
}
