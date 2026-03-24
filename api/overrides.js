module.exports = (req, res) => {
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
