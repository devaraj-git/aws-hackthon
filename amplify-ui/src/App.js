import React, { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("https://your-api-gateway-endpoint/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResponse(data.message);
    setLoading(false);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2>MCP Deployment Assistant</h2>
      <textarea
        rows="5"
        style={{ width: "100%", marginBottom: "10px" }}
        placeholder="Enter your deployment prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      ></textarea>
      <br />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Submit"}
      </button>

      {response && (
        <div style={{ marginTop: "20px", background: "#f3f3f3", padding: "10px" }}>
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
