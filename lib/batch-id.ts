function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildSuggestedBatchId(
  sku: string,
  existingBatchIds: string[],
  year = new Date().getFullYear(),
) {
  const normalizedSku = sku.trim().toUpperCase();
  if (!normalizedSku) {
    return "";
  }

  const matcher = new RegExp(
    `^${escapeRegExp(normalizedSku)}-${year}-(\\d{2})$`,
    "i",
  );

  const maxSequence = existingBatchIds.reduce((max, batchId) => {
    const match = matcher.exec(batchId.toUpperCase());
    if (!match) {
      return max;
    }

    const sequence = Number(match[1]);
    return Number.isNaN(sequence) ? max : Math.max(max, sequence);
  }, 0);

  return `${normalizedSku}-${year}-${String(maxSequence + 1).padStart(2, "0")}`;
}
