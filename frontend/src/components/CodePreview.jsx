import React, { useState, useEffect, useRef } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";

const demoCode = `function login(email, password) {
  if (validate(email, password)) {
    redirect("/dashboard");
  } else {
    alert("Invalid credentials");
  }
}`;

const CodePreview = () => {
    const [code, setCode] = useState("");
    const [isUserTyping, setIsUserTyping] = useState(false);
    const indexRef = useRef(0);

    useEffect(() => {
        if (isUserTyping) return; 
        const interval = setInterval(() => {
            if (indexRef.current < demoCode.length) {
                setCode((prev) => prev + demoCode[indexRef.current]);
                indexRef.current += 1;
            } else {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [isUserTyping]);

    const handleChange = (newCode) => {
        setIsUserTyping(true);
        setCode(newCode);
    };

    return (
        <Editor
            value={code}
            onValueChange={handleChange}
            highlight={(code) => Prism.highlight(code, Prism.languages.js, "js")}
            padding={20}
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                backgroundColor: "#1e1e1e",
                color: "#d4d4d4",
                borderRadius: "8px",
                height: "100%",
                overflow: "auto",
            }}
        />
    );
};

export default CodePreview;
