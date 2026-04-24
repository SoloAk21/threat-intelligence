// src/utils/inputDetector.js
const validator = require("validator");

const detectInputType = (input) => {
  const trimmed = input.trim().toLowerCase();

  // Check for IP address
  if (validator.isIP(trimmed)) {
    return "ip";
  }

  // Check for email
  if (validator.isEmail(trimmed)) {
    return "email";
  }

  // Check for hash (MD5, SHA1, SHA256)
  const hashPatterns = {
    md5: /^[a-f0-9]{32}$/i,
    sha1: /^[a-f0-9]{40}$/i,
    sha256: /^[a-f0-9]{64}$/i,
  };

  for (const [type, pattern] of Object.entries(hashPatterns)) {
    if (pattern.test(trimmed)) {
      return "hash";
    }
  }

  // Check for URL
  if (validator.isURL(trimmed, { require_protocol: false })) {
    return "url";
  }

  // Check for domain (fallback for URLs without protocol)
  const domainPattern =
    /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  if (domainPattern.test(trimmed)) {
    return "domain";
  }

  // Default to domain if it looks like one
  if (trimmed.includes(".") && !trimmed.includes(" ")) {
    return "domain";
  }

  return "unknown";
};

module.exports = { detectInputType };
