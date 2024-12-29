import Mode from "../../../core/Mode.ts";
import RigidConstraint_CreateModeRenderer from "./Renderer.ts";
import { MouseButton } from "../../../manager/InputManager.ts";
import ModeRenderer from "../../../core/ModeRenderer.ts";
import InputManager from "../../../manager/InputManager.ts";
import LoopManager from "../../../manager/LoopManager.ts";
import Vec2 from "../../../utils/Vector.ts";
import PointMass from "../../../body/point-mass/Body.ts";
import BodyManager from "../../../manager/BodyManager.ts";

export default class RigidConstraint_CreateMode extends Mode {
    public renderer: ModeRenderer = new RigidConstraint_CreateModeRenderer(this);

    private pointmass1: PointMass | null = null;
    private pointmass2: PointMass | null = null;
    private hovered_pointmass: PointMass | null = null;

    private reset(): void {
        this.pointmass1 = null;
        this.pointmass2 = null;
        this.hovered_pointmass = null;
    }

    onMouseMove(): void {
        const mouse_pos = InputManager.getMousePosition();
        const hovered_bodies = BodyManager.getHoveredBodies(mouse_pos);
        
        if (!hovered_bodies.length || !(hovered_bodies[0] instanceof PointMass)) {
            this.hovered_pointmass = null;
        } else {
            this.hovered_pointmass = hovered_bodies[0] as PointMass;
        }
    }

    onMouseClick(button: MouseButton): void {
        if (button == MouseButton.LEFT) {
            this.selectPointmass();
        } else if(button == MouseButton.RIGHT) {
            this.reset();
        }
    }

    private selectPointmass(): void {
        if (!this.hovered_pointmass) return;
        if (!this.pointmass1) {
            this.pointmass1 = this.hovered_pointmass;
        } else if (!this.pointmass2 && this.pointmass1 != this.hovered_pointmass) {
            this.pointmass2 = this.hovered_pointmass;
            this.createRigidConstraint();
            this.reset();
        }
    }

    private createRigidConstraint(): void {
        if (!this.pointmass1 || !this.pointmass2) return;
        BodyManager.createRigidConstraint({
            pointmass1: this.pointmass1,
            pointmass2: this.pointmass2,
        });
        if (!LoopManager.isRunning()) LoopManager.render();
    }

    getHoveredPointMass(): PointMass | null {
        return this.hovered_pointmass;
    }

    getMouseCurrentPosition(): Vec2 {
        return InputManager.getMousePosition();
    }

    getFirstPointMass(): PointMass | null {
        return this.pointmass1;
    }
}