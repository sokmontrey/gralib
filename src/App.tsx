import Vec2 from "./utils/Vector.ts";
import {PhysicBodyType} from "./core-physic/PhysicBody.ts";
import PhysicBodyState from "./core/PhysicBodyState.ts";
import SimulationCanvas from "./ui-components/SimulationCanvas.tsx";
import { useCallback, useEffect, useState } from "react";
import Canvas from "./core/Canvas.ts";
import InputManager from "./core/InputManager.ts";
import PhysicBodyManager from "./core-physic/PhysicBodyManager.ts";
import ModeManager, { ModeType } from "./mode/ModeManager.ts";
import DependencyManager from "./core/DependencyManager.ts";
import LoopManager from "./core/LoopManager.ts";
import SelectButton from "./ui-components/SelectButton.tsx";

export default function App() {
	// TODO: move this to a separate file
	const state: PhysicBodyState = {
		"point1": {
			type: PhysicBodyType.POINT_MASS,
			props: { is_static: true, },
			renderer: {
				static_position: { radius: 5, fill_color: "red" },
			}
		},
		"point2": {
			type: PhysicBodyType.POINT_MASS,
			props: { position: Vec2.right(100), }
		},
		"rigid1": {
			type: PhysicBodyType.RIGID_CONSTRAINT,
			dependencies: { pointmass1: "point1", pointmass2: "point2", },
			props: { is_broken: false, }
		},
	};

	const [initial_state, setInitialState] = useState<PhysicBodyState>(state);

	const [canvas, setCanvas] = useState<{
		base_canvas: Canvas | null, 
		overlay_canvas: Canvas | null
	}>({
		base_canvas: null, 
		overlay_canvas: null
	});

	const onCanvasMounted = useCallback(setCanvas, []);

	const update = (dt: number, _sub_steps: number) => {
		const bodies = PhysicBodyManager.getAllBodies();
		bodies.sort((a, b) => a.rank - b.rank);
		bodies.forEach(x => x.update(dt));
	}

	const renderPhysics = (sub_steps: number) => {
		const base_canvas = canvas.base_canvas;
		if (!base_canvas) return;
		base_canvas.clear();
		const bodies = PhysicBodyManager.getAllBodies();
		bodies.sort((a, b) => b.rank - a.rank);
		bodies.forEach(
			x => x.renderer.draw(base_canvas.getContext(), sub_steps)
		);
	}

	const renderUI = () => {
		const overlay_canvas = canvas.overlay_canvas;
		if (!overlay_canvas) return;
		overlay_canvas.clear();
		ModeManager.getCurrentMode()
			.renderer
			.draw(overlay_canvas.getContext() ?? null);
	}

	const resetState = () => {
		PhysicBodyManager.loadFromState(initial_state);
		DependencyManager.loadFromState(initial_state);
		ModeManager.reset();
		LoopManager.render();
	}

	const saveState = () => {
		setInitialState(PhysicBodyManager.toState());
	}

	useEffect(() => {
		if (!canvas.overlay_canvas) return;
		// TODO: deal with explicit dependencies between these managers
		// they all need to be initialized in the right order
		// internally, they all assume that the others are initialized
		InputManager.init(canvas.overlay_canvas);
		LoopManager.init(update, (_, sub_steps: number) => {
			renderPhysics(sub_steps);
			renderUI();
		}, { sub_steps: 1000, constant_dt: null, });
		PhysicBodyManager.init(state);
		DependencyManager.init(state);
		ModeManager.init();
		InputManager.onMouseMove(() => {
			ModeManager.onMouseMove();
			renderUI();
		});
		InputManager.onMouseDown(ModeManager.onMouseDown);
		InputManager.onMouseUp(ModeManager.onMouseUp);
		InputManager.onMouseClick(ModeManager.onMouseClick);
		LoopManager.run();
	}, [canvas]);

	return (<>
		<SimulationCanvas onCanvasMounted={onCanvasMounted} />

		{/* TODO: remove current_mode_type from ModeManager
		And make mode type here reactive */}
		<p style={{color: "white"}}>
			Mode: {ModeManager.getCurrentModeType() ?? "None"}
		</p>
		<button onClick={() => LoopManager.run()}>Run</button>
		<button onClick={() => LoopManager.pause()}>Pause</button>
		<button onClick={() => resetState()}>Reset</button>
		<button onClick={() => saveState()}>Save</button>
		<button onClick={() => ModeManager.toMoveMode()}>
			Move
		</button>
		<SelectButton options={ModeManager.getCreateModeTypes()}
					  onSelect={(mode: ModeType) => ModeManager.toCreateMode(mode)}
		></SelectButton>
	</>);
}
