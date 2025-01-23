import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // For React Router navigation
import "./test.css"; // CLI styles

const TestPage = () => {
  const [logs, setLogs] = useState([]); // Store terminal logs
  const [input, setInput] = useState(""); // CLI input field
  const terminalRef = useRef(null); // For auto-scrolling

  // Simulate command input
  const handleCommandInput = (e) => {
    if (e.key === "Enter") {
      const command = input.trim();
      setLogs((prevLogs) => [
        ...prevLogs,
        { type: "user", message: `> ${command}` },
      ]);

      // Simulate command execution
      if (command === "help") {
        setLogs((prevLogs) => [
          ...prevLogs,
          { type: "system", message: "Available commands: help, raffle status, enter raffle" },
        ]);
      } else if (command === "raffle status") {
        setLogs((prevLogs) => [
          ...prevLogs,
          { type: "system", message: "Raffle Status: Tickets Sold: 20/50" },
        ]);
      } else if (command === "enter raffle") {
        setLogs((prevLogs) => [
          ...prevLogs,
          { type: "system", message: "Entering raffle..." },
        ]);
      } else if (command === "view raffle details") {
        // Simulate navigation to raffle details (with React Router)
        setLogs((prevLogs) => [
          ...prevLogs,
          { type: "system", message: "Opening raffle details..." },
        ]);
      } else {
        setLogs((prevLogs) => [
          ...prevLogs,
          { type: "system", message: `"${command}" is not a valid command.` },
        ]);
      }

      setInput(""); // Reset input field
    }
  };

  // Auto-scroll to the bottom of the terminal output
  useEffect(() => {
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="cli-terminal" ref={terminalRef}>
      <div className="cli-output">
        {logs.map((log, index) => (
          <p key={index} className={log.type === "user" ? "cli-user" : "cli-system"}>
            {log.message}
          </p>
        ))}
      </div>

      <div className="cli-input-container">
        <span className="cli-prompt">user@raffle:~$ </span>
        <input
          type="text"
          className="cli-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommandInput}
          autoFocus
        />
      </div>

      {/* CLI-style clickable commands */}
      <div className="cli-links">
        <p>
          <span className="cli-link" onClick={() => setLogs((prevLogs) => [...prevLogs, { type: "system", message: "Viewing raffle details..." }])}>
            > View Raffle Details
          </span>
        </p>
        <p>
          <Link className="cli-link" to="/raffles/1">
            > Go to Raffle #1 Details
          </Link>
        </p>
        <p>
          <span className="cli-link" onClick={() => setLogs((prevLogs) => [...prevLogs, { type: "system", message: "Entering raffle..." }])}>
            > Enter Raffle
          </span>
        </p>
      </div>
    </div>
  );
};

export default TestPage;
