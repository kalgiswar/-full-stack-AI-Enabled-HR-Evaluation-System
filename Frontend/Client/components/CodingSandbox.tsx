"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodingSandboxProps {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
}

export const CodingSandbox = ({ language, code, onChange }: CodingSandboxProps) => {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput(["Compiling...", "Running tests..."]);
    
    // Simulate execution delay
    setTimeout(() => {
        try {
            // Very basic validation simulation
            const passesBasic = code.includes("return") && (code.includes("split") || code.includes("reversed") || code.includes("for") || code.includes("reverse()"));
            
            if (passesBasic) {
                setOutput([
                    "Compiling... Done.",
                    "Running Test Case 1: input 'hello' -> expected 'olleh'",
                    "✅ Test Case 1 Passed",
                    "Running Test Case 2: input 'Racecar' -> expected 'racecaR'",
                    "✅ Test Case 2 Passed",
                    "All tests passed!"
                ]);
            } else {
                 setOutput([
                    "Compiling... Done.",
                    "Running Test Case 1: input 'hello' -> expected 'olleh'",
                    "❌ Test Case 1 Failed: Output undefined",
                    "Hint: Did you forget to return the result?"
                ]);
            }
        } catch (e) {
            setOutput(["Syntax Error: Unexpected token"]);
        } finally {
            setIsRunning(false);
        }
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-2 h-full w-full bg-dark-200 rounded-xl overflow-hidden border border-white/10">
      <div className="bg-dark-300 px-4 py-2 flex items-center justify-between border-b border-white/10">
         <span className="text-sm font-mono text-light-100">{language.toUpperCase()} Environment</span>
         <Button 
            size="sm" 
            variant="ghost" 
            className="text-green-400 hover:text-green-300 hover:bg-green-400/10 gap-2"
            onClick={handleRun}
            disabled={isRunning}
         >
            <Play size={16} fill="currentColor" />
            {isRunning ? "Running..." : "Run Code"}
         </Button>
      </div>
      <div className="flex-1 flex flex-col min-h-[400px]">
        <Editor
          height="60%"
          defaultLanguage="javascript"
          language={language}
          value={code} // Changed from defaultValue to value for controlled input if needed
          theme="vs-dark"
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
        <div className="flex-1 bg-black/80 border-t border-white/10 p-4 font-mono text-sm overflow-y-auto">
            <div className="text-light-100 mb-2 font-semibold">Terminal Output:</div>
            {output.length === 0 && <span className="text-gray-500 italic">No output yet. Run your code to test.</span>}
            {output.map((line, i) => (
                <div key={i} className={`${line.includes("✅") ? "text-green-400" : line.includes("❌") ? "text-red-400" : "text-gray-300"}`}>
                    {line}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
