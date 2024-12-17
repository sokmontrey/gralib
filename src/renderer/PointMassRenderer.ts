import Draw from "../core/Draw";
import PointMass from "../core-physic/PointMass";
import ArrowStyle, {ArrowStyleProps} from "../style/ArrowStyle";
import CircleStyle, {CircleStyleProps} from "../style/CircleStyle";
import Vec2 from "../utils/Vector.ts";
import Renderer from "./Renderer.ts";
import RendererParams from "./RendererParams.ts";

export interface PointMassRendererParams extends RendererParams {
	position?: CircleStyleProps;
	static_position?: CircleStyleProps;
	velocity?: ArrowStyleProps;
	selected?: CircleStyleProps;
}

export default class PointMassRenderer implements Renderer {
	private pointmass: PointMass;

	public readonly position;
	public readonly static_position;
	public readonly velocity;
	public readonly selected: CircleStyle;

	constructor(pointmass: PointMass, {
		position = { is_stroke: false },
		static_position = { fill_color: '#bdb5b5', is_stroke: false },
		velocity = { fill_color: 'gray', is_enable: false },
		selected = { fill_color: 'rgba(3,144,252,0.28)', stroke_color: '#0390fc', line_width: 1 }
	}: PointMassRendererParams = {}) {
		this.pointmass = pointmass;

		position.radius = position.radius ?? (pointmass.getMass() ?? 1) * 10;
		static_position.radius = static_position.radius ?? position.radius;
		selected.radius = selected.radius ?? (position.radius + 2);

		this.position = new CircleStyle(position);
		this.static_position = new CircleStyle(static_position);
		this.velocity = new ArrowStyle(velocity);
		this.selected = new CircleStyle(selected);
	}

	private drawCurrentPosition(ctx: CanvasRenderingContext2D, pos: Vec2) {
		if (!this.position.is_enable) return;
		if (this.pointmass.isStatic()) Draw.circle(ctx, pos, this.static_position);
		else Draw.circle(ctx, pos, this.position);
	}

	private drawVelocity(ctx: CanvasRenderingContext2D, pos: Vec2, vel: Vec2, steps: number) {
		if (!this.velocity.is_enable) return;
		Draw.arrow(ctx, pos, vel.mul(steps * 5), this.velocity);
	}

	public draw(ctx: CanvasRenderingContext2D, steps: number) {
		const pos = this.pointmass.getPosition();
		const vel = this.pointmass.getVelocity();
		this.drawCurrentPosition(ctx, pos);
		this.drawVelocity(ctx, pos, vel, steps);
	}

	public drawSelection(ctx: CanvasRenderingContext2D) {
		Draw.circle(ctx, this.pointmass.getPosition(), this.selected);
	}
}

