import PointMass from "../core-physic/PointMass";
import RigidConstraint from "../core-physic/RigidConstraint";
import Point from "../quadtree/Point";
import Quadtree from "../quadtree/Quadtree";
import Vec2, { vec2 } from "../utils/math/Vector";

type Constraint = RigidConstraint;

export interface BodyHierarchy {
	pointmasses: PointMass[];
	constraints: Constraint[];
}

export default class SpatialQuery {
	private body_hierarchy: BodyHierarchy;

	private center: Vec2;
	private half_dim: Vec2;
	private pointmass_quadtree!: Quadtree<PointMass>;

	constructor(width: number, height: number) {
		this.body_hierarchy = {
			pointmasses: [],
			constraints: [],
		};
		this.center = Vec2.zero();
		this.half_dim = vec2(width, height).div(2);
		this.resetPointMassQuadtree();
	}
}
