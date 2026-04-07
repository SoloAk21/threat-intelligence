const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
