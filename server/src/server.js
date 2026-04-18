require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Advanced Threat Intelligence Server running on http://localhost:${PORT}`,
  );
  console.log("✅ User authentication system enabled");
  console.log("✅ All 18 threat sources integrated. Check .env for API keys.");
});
