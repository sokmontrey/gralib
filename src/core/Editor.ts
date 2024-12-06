import Canvas from "./Canvas.ts";
import Vec2 from "../utils/Vector.ts";

export interface EditorParams {
	/**
	* How far (pixels) the mouse need to move to activate dragging
	**/
	drag_threshold?: number;
}

export enum MouseButton {
	LEFT = 0,
	MIDDLE = 1,
	RIGHT = 2,
}

export default class Editor {
	private canvas: Canvas;
	private drag_threshold: number;
	private is_mouse_down: boolean;
	private mouse_start_pos: Vec2;

	constructor(canvas: Canvas, {
		drag_threshold = 5,
	}: EditorParams = {}) {
		this.canvas = canvas;
		this.drag_threshold = drag_threshold;
		this.is_mouse_down = false;
		this.mouse_start_pos = Vec2.zero();
		this.setupMouseEvent();
	}

	setupMouseEvent() {
		this.canvas.onMouseMove((_: MouseEvent) => {
			this.canvas.clearOverlay();
		});

		this.canvas.onMouseDown((_: MouseEvent) => {
			if (this.is_mouse_down) return;
			this.is_mouse_down = true;
			this.mouse_start_pos = this.canvas.getMousePosition();
		});

		this.canvas.onMouseUp((e: MouseEvent) => {
			if (!this.is_mouse_down) return;
			this.is_mouse_down = false;
			const mouse_curr_pos = this.canvas.getMousePosition();
			const diff = mouse_curr_pos.sub(this.mouse_start_pos).mag();
			if (diff < this.drag_threshold) this.onClick(e.button, this.mouse_start_pos);
			else this.onDrag(e.button, this.mouse_start_pos, mouse_curr_pos);
		});
	}

	onClick(button: MouseButton, pos: Vec2) {
	}

	onDrag(button: MouseButton, start: Vec2, end: Vec2) {
	}
}
