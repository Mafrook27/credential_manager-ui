export interface ParsedEnvField {
  key: string;
  value: string;
}

const MAX_PARSED_FIELDS = 200;

/**
 * Parses .env/.txt style text into KEY=VALUE pairs.
 * Skips blank lines and comment lines (#...), strips surrounding quotes from
 * values, and silently ignores malformed lines instead of throwing.
 */
export function parseEnvFile(text: string): ParsedEnvField[] {
  const fields: ParsedEnvField[] = [];

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    if (fields.length >= MAX_PARSED_FIELDS) break;

    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    // Strip a single matching pair of surrounding quotes, e.g. MONGO_URI="mongodb+srv://..."
    if (value.length >= 2) {
      const first = value[0];
      const last = value[value.length - 1];
      if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        value = value.slice(1, -1);
      }
    }

    if (!value) continue;

    fields.push({ key, value });
  }

  return fields;
}
