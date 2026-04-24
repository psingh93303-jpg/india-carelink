import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Quote, Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: Object.keys(value).length ? value : { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class: "min-h-64 rounded-b-xl border border-t-0 border-border bg-background px-4 py-3 text-sm outline-none prose-editor",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as Record<string, unknown>),
  });

  if (!editor) return null;

  const tools = [
    { label: "Bold", icon: Bold, active: editor.isActive("bold"), action: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: editor.isActive("italic"), action: () => editor.chain().focus().toggleItalic().run() },
    { label: "Bullet list", icon: List, active: editor.isActive("bulletList"), action: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: editor.isActive("orderedList"), action: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", icon: Quote, active: editor.isActive("blockquote"), action: () => editor.chain().focus().toggleBlockquote().run() },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-border bg-muted/40 p-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button key={tool.label} type="button" size="icon" variant={tool.active ? "secondary" : "ghost"} onClick={tool.action} aria-label={tool.label}>
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
        <span className="mx-1 h-6 w-px bg-border" />
        <Button type="button" size="icon" variant="ghost" onClick={() => editor.chain().focus().undo().run()} aria-label="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" onClick={() => editor.chain().focus().redo().run()} aria-label="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className={cn("[&_.ProseMirror]:min-h-64")} />
    </div>
  );
}

export function RenderRichText({ content }: { content: Record<string, unknown> }) {
  return <div className="prose-render">{renderNode(content, "root")}</div>;
}

function renderNode(node: any, key: string): React.ReactNode {
  if (!node) return null;
  if (node.type === "text") return applyMarks(node.text ?? "", node.marks ?? [], key);
  const children = (node.content ?? []).map((child: unknown, index: number) => renderNode(child, `${key}-${index}`));
  switch (node.type) {
    case "doc": return <>{children}</>;
    case "paragraph": return <p key={key}>{children}</p>;
    case "heading": {
      const Tag = `h${Math.min(Math.max(node.attrs?.level ?? 2, 2), 3)}` as "h2" | "h3";
      return <Tag key={key}>{children}</Tag>;
    }
    case "bulletList": return <ul key={key}>{children}</ul>;
    case "orderedList": return <ol key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote key={key}>{children}</blockquote>;
    case "hardBreak": return <br key={key} />;
    default: return <span key={key}>{children}</span>;
  }
}

function applyMarks(text: string, marks: { type: string }[], key: string) {
  return marks.reduce<React.ReactNode>((acc, mark) => {
    if (mark.type === "bold") return <strong key={`${key}-b`}>{acc}</strong>;
    if (mark.type === "italic") return <em key={`${key}-i`}>{acc}</em>;
    return acc;
  }, text);
}