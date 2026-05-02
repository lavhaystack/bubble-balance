export interface IdGenerationStrategy<TContext> {
  generate(context: TContext): string;
}
