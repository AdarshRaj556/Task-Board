import { useRef, useEffect } from "react";
import styles from "./RichTextEditor.module.css";

type Props = {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: number;
};

export default function RichTextEditor({ value, onChange, placeholder = "Write something...", minHeight = 72 }: Props) {
    const editorRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (!editorRef.current) return;
        const isEmpty = value === "" || value === "<br>" || value === "<br/>";
        if (isEmpty) {
            // Clear on external reset (e.g. after posting a comment)
            editorRef.current.innerHTML = "";
            initialized.current = false;
        } else if (!initialized.current) {
            // Set content only on first mount with a value (e.g. editing an existing comment)
            editorRef.current.innerHTML = value;
            initialized.current = true;
        }
        // While the user is typing, never overwrite the DOM — cursor would jump
    }, [value]);

    const exec = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
        editorRef.current?.focus();
        onChange(editorRef.current?.innerHTML ?? "");
    };

    const handleInput = () => {
        initialized.current = true;
        onChange(editorRef.current?.innerHTML ?? "");
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <button type="button" className={styles.toolBtn} onMouseDown={e => { e.preventDefault(); exec("bold"); }} title="Bold"><strong>B</strong></button>
                <button type="button" className={styles.toolBtn} onMouseDown={e => { e.preventDefault(); exec("italic"); }} title="Italic"><em>I</em></button>
                <button type="button" className={styles.toolBtn} onMouseDown={e => { e.preventDefault(); exec("underline"); }} title="Underline"><u>U</u></button>
                <span className={styles.sep} />
                <button type="button" className={styles.toolBtn} onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }} title="Bullet list">• List</button>
                <button type="button" className={styles.toolBtn} onMouseDown={e => {
                    e.preventDefault();
                    const sel = window.getSelection();
                    if (sel && sel.toString()) {
                        exec("insertHTML", `<code style="background:#f3f4f6;padding:1px 5px;border-radius:3px;font-family:monospace;">${sel.toString()}</code>`);
                    }
                }} title="Inline code">`code`</button>
            </div>
            <div
                ref={editorRef}
                className={styles.editor}
                contentEditable
                suppressContentEditableWarning
                style={{ minHeight }}
                onInput={handleInput}
                data-placeholder={placeholder}
            />
        </div>
    );
}
