// Official public-directory limits. Kept separate from development defaults.
export const categories = [
  "Productivity", "Creativity", "Developer Tools", "Business & Operations",
  "Data & Analytics", "Communication", "Education & Research", "Security",
  "Finance", "Healthcare", "Travel", "Entertainment", "Other",
];
export const limits = {
  files: 5000,
  fileBytes: 100 * 1024 * 1024,
  totalBytes: 512 * 1024 * 1024,
  zipBytes: 100 * 1000 * 1000,
  imageBytes: 5 * 1024 * 1024,
};

export function isDevelopmentEndpoint(hostname) {
  return /^(?:localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|\[)/i.test(hostname)
    || /(?:^|\.)(?:test|testing|stage|staging|dev|localhost|local|invalid|example)(?:\.|$)/i.test(hostname)
    || /^(?:skilltest|skillhuidu)\./i.test(hostname)
    || /(?:^|\.)example\.(?:com|org|net)$/i.test(hostname)
    || !hostname.includes(".");
}
