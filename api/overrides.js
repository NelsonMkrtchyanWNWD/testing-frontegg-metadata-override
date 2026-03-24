module.exports = (req, res) => {
  // CORS headers — allow Frontegg's hosted login to call this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "frontegg-requested-application-id, x-frontegg-framework, x-frontegg-sdk"
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const appId = req.headers["frontegg-requested-application-id"];

  console.log("--- Incoming request ---");
  console.log("frontegg-requested-application-id:", appId || "NOT PRESENT");
  console.log("All headers:", JSON.stringify(req.headers, null, 2));
  console.log("------------------------");

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

  res.json(defaultOverride);
};
