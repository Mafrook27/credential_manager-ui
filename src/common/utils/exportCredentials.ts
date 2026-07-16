// Client-side helpers for exporting decrypted credential data as a JSON file.
// Nothing is sent anywhere - the file is generated and downloaded in the browser.

export interface ExportableField {
  key: string;
  value: string;
}

export interface ExportableCredential {
  serviceName: string;
  credentialName?: string;
  fields: ExportableField[];
  url?: string;
  notes?: string;
  createdAt?: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'credential';

export const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportSingleCredential = (credential: ExportableCredential) => {
  const filename = `${slugify(credential.serviceName)}-${slugify(credential.credentialName || 'credential')}-${Date.now()}.json`;
  downloadJson(filename, {
    exportedAt: new Date().toISOString(),
    warning: 'This file contains decrypted secrets in plain text. Store it securely and delete it when done.',
    credential,
  });
};

export const exportAllCredentials = (credentials: ExportableCredential[]) => {
  const filename = `credentials-export-${Date.now()}.json`;
  downloadJson(filename, {
    exportedAt: new Date().toISOString(),
    warning: 'This file contains decrypted secrets in plain text. Store it securely and delete it when done.',
    count: credentials.length,
    credentials,
  });
};
