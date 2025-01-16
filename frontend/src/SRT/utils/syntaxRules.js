const syntaxRules = [
    { regex: />> [A-Z ]+/, className: "cli-command" }, // CLI commands like ">> Fetching..."
    { regex: /\[ERROR\].*/, className: "cli-error" },  // Error messages
    { regex: /\[SUCCESS\].*/, className: "cli-success" }, // Success messages
    { regex: /\b\d+ SOL\b/, className: "cli-number" }, // Numbers with "SOL"
    { regex: /\bTickets?: .*/, className: "cli-highlight" }, // Ticket-related info
    { regex: />>> .*/, className: "cli-keyword" }, // Keywords like ">>> Data Complete"
  ];
  
  export default syntaxRules;
  