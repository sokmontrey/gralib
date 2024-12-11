import Draw from "../core/Draw";
import RigidConstraint from "../core-physic/RigidConstraint";
import LineStyle from "../style/LineStyle";
import StressStyle from "../style/StressStyle";
import Color from "../utils/Color.ts";
import Vec2 from "../utils/Vector.ts";
import IRenderer from "./IRenderer.ts";
import CircleStyle from "../style/CircleStyle.ts";

export default class RigidConstraintRenderer implements IRenderer {
	protected rigid_constraint: RigidConstraint;

	public readonly constraint_line;
	public readonly stress;

	public readonly selected: LineStyle;
	public readonly selected_circle: CircleStyle;

	constructor(rigid_constraint: RigidConstraint) {
		this.rigid_constraint = rigid_constraint;

		this.constraint_line = new LineStyle();
		this.stress = new StressStyle().disable();

		this.selected = new LineStyle()
			.setLineWidth(2)
			.setStrokeColor('#0390fc');
		this.selected_circle = new CircleStyle()
			.setRadius(4)
			.setFillColor('#0390fc')
			.noStroke();
	}

	private applyStress(_: CanvasRenderingContext2D, steps: number) {
		if (!this.stress.isEnable()) return;
		// multiply with 1000 * steps to amplify the visual (+ 1/2 offset)
		let stress = this.rigid_constraint.getStress();
		stress = stress * steps * steps * 10 + 0.5; // scale by 10 * steps ^ 2 + offset
		this.constraint_line.stroke_color = Color.lerp(
			this.stress.compress_color,
			this.stress.tension_color,
			stress,
		).toStringRGB();
	}

	private drawConstraintLine(ctx: CanvasRenderingContext2D, start: Vec2, end: Vec2) {
		if (!this.constraint_line.isEnable()) return;
		Draw.line(ctx, start, end, this.constraint_line);
	}

	public draw(ctx: CanvasRenderingContext2D, steps: number) {
		const [pm1, pm2] = this.rigid_constraint.getPointMasses();
		const start = pm1.getPosition();
		const end = pm2.getPosition();
		this.applyStress(ctx, steps);
		this.drawConstraintLine(ctx, start, end);
		return this;
	}

	drawSelection(ctx: CanvasRenderingContext2D): IRenderer {
		const [pm1, pm2] = this.rigid_constraint.getPointMasses();
		Draw.circle(ctx, pm1.getPosition(), this.selected_circle);
		Draw.circle(ctx, pm2.getPosition(), this.selected_circle);
		Draw.line(ctx, pm1.getPosition(), pm2.getPosition(), this.selected);
		return this;
	}
}

