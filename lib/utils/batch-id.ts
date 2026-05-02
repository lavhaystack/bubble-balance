import { SkuSequenceStrategy } from "@/lib/patterns/strategies/batch-id-strategies";

/**
 * Suggested Batch ID generator.
 * Uses the SkuSequenceStrategy by default.
 */
export function buildSuggestedBatchId(
  sku: string,
  existingBatchIds: string[],
) {
  const strategy = new SkuSequenceStrategy();
  return strategy.generate({ sku, existingIds: existingBatchIds });
}
