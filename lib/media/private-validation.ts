export const PRIVATE_FILE_LIMIT = 900 * 1024;

const types: Record<string, { mime: string; extension: string }> = {
  jpg: { mime: "image/jpeg", extension: "jpg" }, jpeg: { mime: "image/jpeg", extension: "jpg" },
  png: { mime: "image/png", extension: "png" }, pdf: { mime: "application/pdf", extension: "pdf" },
  mp3: { mime: "audio/mpeg", extension: "mp3" }, wav: { mime: "audio/wav", extension: "wav" },
  ogg: { mime: "audio/ogg", extension: "ogg" },
};

export function validatePrivateFile(name: string, mime: string, bytes: Uint8Array) {
  const extension = name.split(".").pop()?.toLowerCase() || "";
  const spec = types[extension];
  if (!spec || mime !== spec.mime || bytes.length === 0 || bytes.length > PRIVATE_FILE_LIMIT) return null;
  const starts = (...values: number[]) => values.every((v, i) => bytes[i] === v);
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  const valid = spec.mime === "image/jpeg" ? starts(0xff, 0xd8, 0xff)
    : spec.mime === "image/png" ? starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
    : spec.mime === "application/pdf" ? ascii(0, 5) === "%PDF-"
    : spec.mime === "audio/mpeg" ? ascii(0, 3) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
    : spec.mime === "audio/wav" ? ascii(0, 4) === "RIFF" && ascii(8, 4) === "WAVE"
    : ascii(0, 4) === "OggS";
  return valid ? spec : null;
}
