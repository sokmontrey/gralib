import PointMass from "@/body/point-mass/Body";
import Body, { BodyType } from "@/core/Body";
import Mode from "@/core/Mode";
import ModeRenderer from "@/core/ModeRenderer";
import BodyManager from "@/manager/BodyManager";
import InputManager, { MouseButton } from "@/manager/InputManager";
import LoopManager from "@/manager/LoopManager";
import Vec2 from "@/utils/Vector";
import MoveModeRenderer from "./Renderer";

export default class MoveMode extends Mode {
    public readonly renderer: ModeRenderer;

    // Selection properties
    private selected_bodies: Set<Body<any, any>>;
    private hovered_body: Body<any, any> | null;
    private on_selection_change: (selected_bodies: Set<Body<any, any>>) => void;

    // Drag properties
    private is_dragging: boolean;
    private mouse_down_button: MouseButton | null;
    private target_body: Body<any, any> | null;
    private body_offsets: Map<Body<any, any>, Vec2> | null;

    private on_body_update: () => void;

    constructor() {
        super();
        this.renderer = new MoveModeRenderer(this);

        // Initialize selection properties
        this.selected_bodies = new Set<Body<any, any>>();
        this.hovered_body = null;
        this.on_selection_change = () => { };

        // Initialize drag properties
        this.is_dragging = false;
        this.mouse_down_button = null;
        this.target_body = null;
        this.body_offsets = null;

        this.on_body_update = () => {};
    }

    // Selection Management
    public resetSelectedBodies(): void {
        this.selected_bodies.clear();
        this.notifySelectionChange();
    }

    public setOnBodyUpdate(on_body_update: () => void): void {
        this.on_body_update = on_body_update;
    }

    public selectBody(body: Body<any, any> | null): void {
        if (!body) return;

        if (this.selected_bodies.has(body)) {
            this.selected_bodies.delete(body);
        } else {
            this.selected_bodies.add(body);
        }

        this.notifySelectionChange();
    }

    private notifySelectionChange(): void {
        this.on_selection_change(this.selected_bodies);
    }

    public onMouseClick(button: MouseButton): void {
        if (button !== MouseButton.LEFT) return;

        if (!InputManager.isKeyDown("Shift")) {
            this.resetSelectedBodies();
        }

        this.selectBody(this.hovered_body);
        LoopManager.render();
    }

    public onMouseMove(): void {
        this.updateHoveredBody();
        this.updateDragState();

        if (this.is_dragging && this.isMouseDownOnSelectedBody()) {
            this.moveSelectedBodies();
        } 
    }

    public onMouseDown(button: MouseButton): void {
        this.mouse_down_button = button;
        this.target_body = this.hovered_body;

        if (this.isMouseDownOnBody()) {
            this.calculateBodyOffsets();
        }
    }

    public onMouseUp(_button: MouseButton): void {
        if (!this.is_dragging) return;

        if (this.is_dragging && !this.isMouseDownOnBody()) {
            this.handleDragSelection();
        }

        this.resetDragState();
    }

    private updateDragState(): void {
        const mouse_pos = InputManager.getMousePosition();
        const drag_distance = mouse_pos.distance(InputManager.getMouseDownPosition());

        this.is_dragging =
            drag_distance > InputManager.getDragThreshold() &&
            InputManager.isMouseDown();
    }

    private calculateBodyOffsets(): void {
        const mouse_pos = InputManager.getMousePosition();
        const offsets = new Map<Body<any, any>, Vec2>();

        Array.from(this.selected_bodies)
            .filter(body => body.isMoveable())
            .forEach(body => {
                // TODO: deal with (body as any) maybe inherit from MoveableBody. UHHH.
                offsets.set(body, (body as any).getPosition().sub(mouse_pos));
            });

        this.body_offsets = offsets;
    }

    private moveSelectedBodies(): void {
        if (!this.body_offsets || this.mouse_down_button !== MouseButton.LEFT) return;

        const mouse_pos = InputManager.getMousePosition();
        this.body_offsets.forEach((offset, body) => {
            this.moveBody(body, mouse_pos.add(offset));
        });

        if (!LoopManager.isRunning()) {
            LoopManager.render();
        }
    }

    private moveBody(body: Body<any, any>, position: Vec2): void {
        // TODO: every Body should have a moveTo method
        const type = body.getType();
        if (type !== BodyType.POINT_MASS) return;

        const point_mass = body as PointMass;
        point_mass.moveTo(position);
        point_mass.triggerOnUpdate();

        // TODO: remove this
        if (!LoopManager.isRunning()) {
            BodyManager.updateConnectedConstraints(point_mass);
        }

        this.on_body_update();
    }

    private updateHoveredBody(): void {
        const mouse_pos = InputManager.getMousePosition();
        const hovered_bodies = BodyManager.getHoveredBodies(mouse_pos);
        this.hovered_body = hovered_bodies[0] ?? null;
    }

    private handleDragSelection(): void {
        if (this.mouse_down_button !== MouseButton.LEFT) return;

        const down_pos = InputManager.getMouseDownPosition();
        const current_pos = InputManager.getMousePosition();
        const [lower, upper] = this.calculateSelectionBounds(down_pos, current_pos);

        if (!InputManager.isKeyDown("Shift")) {
            this.resetSelectedBodies();
        }

        const bodies_in_range = BodyManager.getSelectedBodies(lower, upper);
        bodies_in_range.forEach(body => this.selectBody(body));
    }

    private calculateSelectionBounds(pos1: Vec2, pos2: Vec2): [Vec2, Vec2] {
        return [
            Vec2.min(pos1, pos2),
            Vec2.max(pos1, pos2)
        ];
    }

    public isMouseDownOnBody(): boolean {
        return this.target_body !== null;
    }

    public isMouseDownOnSelectedBody(): boolean {
        return this.target_body !== null &&
            this.selected_bodies.has(this.target_body);
    }

    public getSelectedBodies(): Set<Body<any, any>> {
        return this.selected_bodies;
    }

    public getHoveredBody(): Body<any, any> | null {
        return this.hovered_body;
    }

    public getSelectedBodyIds(): string[] {
        return Array.from(this.selected_bodies)
            .map(body => body.getId() ?? "");
    }

    // TODO: just pass in the body directly
    public setOnSelectionChange(callback: (selected_bodies: Set<Body<any, any>>) => void): void {
        this.on_selection_change = callback;
    }

    private resetDragState(): void {
        this.is_dragging = false;
        this.mouse_down_button = null;
        this.target_body = null;
        this.body_offsets = null;
    }

    isDragging(): boolean {
        return this.is_dragging;
    }
}