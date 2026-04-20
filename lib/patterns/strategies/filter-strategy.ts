export interface FilterStrategy<TItem, TCriteria> {
  apply(items: TItem[], criteria: TCriteria): TItem[];
}

export function applyFilterStrategies<TItem, TCriteria>(
  items: TItem[],
  criteria: TCriteria,
  strategies: ReadonlyArray<FilterStrategy<TItem, TCriteria>>,
) {
  return strategies.reduce(
    (acc, strategy) => strategy.apply(acc, criteria),
    items,
  );
}
