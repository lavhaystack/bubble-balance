import type { IdGenerationStrategy } from "./id-generation-strategy";

export type BatchIdContext = {
  sku: string;
  existingIds: string[];
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strategy: SKU-Sequence (e.g., SKU-01, SKU-02)
 * Generates a sequential ID based on the SKU prefix.
 */
export class SkuSequenceStrategy implements IdGenerationStrategy<BatchIdContext> {
  generate({ sku, existingIds }: BatchIdContext): string {
    const normalizedSku = sku.trim().toUpperCase();
    if (!normalizedSku) {
      return "";
    }

    const matcher = new RegExp(
      `^${escapeRegExp(normalizedSku)}-(\\d{2})$`,
      "i",
    );

    const maxSequence = existingIds.reduce((max, batchId) => {
      const match = matcher.exec(batchId.toUpperCase());
      if (match) {
        const sequence = parseInt(match[1], 10);
        return Math.max(max, sequence);
      }
      return max;
    }, 0);

    const nextSequence = maxSequence + 1;
    return `${normalizedSku}-${String(nextSequence).padStart(2, "0")}`;
  }
}

/**
 * Strategy: Simple Date-based ID (e.g., SKU-20240501)
 */
export class DateBasedStrategy implements IdGenerationStrategy<BatchIdContext> {
  generate({ sku }: BatchIdContext): string {
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
    return `${sku.toUpperCase()}-${date}`;
  }
}
