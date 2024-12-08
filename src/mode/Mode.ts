import ModeManager from "./ModeManager.ts";
import IRenderer from "../renderer/IRenderer.ts";
import Editor from "../core/Editor.ts";

export default abstract class Mode {
    protected mode_manager!: ModeManager;
    protected editor!: Editor;
    public abstract renderer: IRenderer;

    public abstract init(): void;

    public setModeManager(mode_manager: ModeManager) {
        this.mode_manager = mode_manager;
    }

    public setEditor(editor: Editor) {
        this.editor = editor;
    }
}