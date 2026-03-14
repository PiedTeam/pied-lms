import { Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onMount: (editor: unknown) => void;
}

export function CodeEditor({ code, onChange, onMount }: CodeEditorProps) {
  return (
    <div className="flex-1 w-full h-full min-h-[600px]">
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="c"
        value={code}
        onChange={(value) => onChange(value || "")}
        onMount={onMount}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-gray-300 text-sm">Loading &lt;Stdlib&gt;</p>
            </div>
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
        }}
      />
    </div>
  );
}
