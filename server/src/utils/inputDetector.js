// src/utils/inputDetector.js
const validator = require("validator");

function detectInputType(input) {
  if (!input || typeof input !== "string") return "unknown";

  const trimmed = input.trim();

  // IP Address (IPv4)
  if (validator.isIP(trimmed)) {
    return "ip";
  }

  // URL
  if (validator.isURL(trimmed, { require_protocol: false })) {
    return "url";
  }

  // Domain (FQDN)
  if (validator.isFQDN(trimmed)) {
    return "domain";
  }

  // Email (treat as email/username indicator)
  if (validator.isEmail(trimmed)) {
    return "email";
  }

  // Hash detection
  const hashPatterns = {
    md5: /^[a-f0-9]{32}$/i,
    sha1: /^[a-f0-9]{40}$/i,
    sha256: /^[a-f0-9]{64}$/i,
    sha512: /^[a-f0-9]{128}$/i,
  };

  for (const [type, pattern] of Object.entries(hashPatterns)) {
    if (pattern.test(trimmed)) {
      return "hash";
    }
  }

  return "unknown";
}

module.exports = { detectInputType };
