const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Default override (same as current windward.json)
const defaultOverride = {
  localizations: {
    en: {
      errors: {
        "ER-01196": "Invalid credentials",
        "ER-01078": "Incorrect username or password",
      },
    },
  },
};

app.get("/overrides", (req, res) => {
  const appId = req.headers["frontegg-requested-application-id"];

  console.log("--- Incoming request ---");
  console.log("frontegg-requested-application-id:", appId || "NOT PRESENT");
  console.log("All headers:", JSON.stringify(req.headers, null, 2));
  console.log("------------------------");

  res.json(defaultOverride);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
