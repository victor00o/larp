export async function buildLivePlaceholderAnalysisContext({ input }) {
  return {
    input,
    note: "Live mode currently uses placeholder retrieval scaffolding while real TinyFish and AgentQL coverage is still being expanded.",
  };
}
