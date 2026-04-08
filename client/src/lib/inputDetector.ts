// src/lib/inputDetector.ts
export function detectInputType(
  input: string,
): "ip" | "url" | "domain" | "hash" | "email" | "unknown" {
  if (!input || typeof input !== "string") return "unknown";

  const trimmed = input.trim().toLowerCase();

  // IPv4 Address
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  if (ipv4Regex.test(trimmed)) return "ip";

  // IPv6 Address (basic detection)
  const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
  if (ipv6Regex.test(trimmed)) return "ip";

  // URL with protocol
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return "url";
  }

  // URL-like (has path separator and not email)
  if (trimmed.includes("/") && !trimmed.includes("@")) {
    return "url";
  }

  // File Hashes
  const md5Regex = /^[a-f0-9]{32}$/i;
  const sha1Regex = /^[a-f0-9]{40}$/i;
  const sha256Regex = /^[a-f0-9]{64}$/i;
  const sha512Regex = /^[a-f0-9]{128}$/i;

  if (md5Regex.test(trimmed)) return "hash";
  if (sha1Regex.test(trimmed)) return "hash";
  if (sha256Regex.test(trimmed)) return "hash";
  if (sha512Regex.test(trimmed)) return "hash";

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) return "email";

  // Domain (FQDN) - must have at least one dot and valid TLD
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  if (domainRegex.test(trimmed)) return "domain";

  return "unknown";
}
