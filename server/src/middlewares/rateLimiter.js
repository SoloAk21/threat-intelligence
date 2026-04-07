const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: "Too many requests. Please try again later." },
});

module.exports = limiter;
