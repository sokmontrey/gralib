import Draw from "@/core/Draw";
import ModeRenderer from "@/core/ModeRenderer";
import InputManager from "@/manager/InputManager";
import ShapeStyle from "@/style/ShapeStyle";
import Vec2 from "@/utils/Vector";
import MoveMode from "./Mode";
import Body from "@/core/Body";

export default class MoveModeRenderer extends ModeRenderer {
    public drag_rectangle: ShapeStyle = new ShapeStyle({
        fill_color: 'rgba(3,144,252,0.28)',
        stroke_color: '#0390fc',
        line_width: 1,
    });

    public draw(
        ctx: CanvasRenderingContext2D,
    ) {
        const _mode = this.mode as MoveMode;
        this.drawHoveredBody(ctx, _mode.getHoveredBody());
        this.drawSelectedBodies(ctx, _mode.getSelectedBodies());
        if (_mode.isDragging() && !_mode.isMouseDownOnSelectedBody()) {
            this.drawDraggingBox(ctx, 
                InputManager.getMouseDownPosition(), 
                InputManager.getMousePosition());
        }
    }

    private drawHoveredBody(
        ctx: CanvasRenderingContext2D,
        hovered_body: Body<any, any> | null
    ) {
        hovered_body?.renderer.drawSelection(hovered_body, ctx);
    }

    private drawSelectedBodies(
        ctx: CanvasRenderingContext2D,
        bodies: Set<Body<any, any>>
    ) {
        bodies.forEach(body => {
            body.renderer.drawSelection(body, ctx);
        });
    }

    private drawDraggingBox(
        ctx: CanvasRenderingContext2D,
        start: Vec2,
        end: Vec2
    ) {
        const pos = Vec2.min(start, end);
        const dim = end.sub(start).abs();
        Draw.rectangle(ctx, pos, dim, this.drag_rectangle);
    }
}