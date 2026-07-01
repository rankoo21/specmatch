// Seed subject for the demo column. The mock adapter builds the strata from the
// testimonies below so the first visit already shows a hardened deep layer, a
// corroborated mid layer, a floating surface claim, and one fault.

export const DEMO_SUBJECT = "The river crossing closure, spring flood";

export interface MockTestimonySeed {
  text: string;
  vantage: "witnessed" | "heard" | "recorded" | "inferred" | "unstated";
}

// Three groups of testimonies. The first group recurs (hardens). The second
// group recurs once (corroborated mid). The third is a lone claim (floating).
// The fourth contradicts the deep layer (fault).
export const DEMO_HARDENED: MockTestimonySeed[] = [
  {
    text: "I was there when the crossing closed; the water reached the second step by noon.",
    vantage: "witnessed",
  },
  {
    text: "The crossing closed before midday and the water had climbed to the second step.",
    vantage: "heard",
  },
  {
    text: "Recorded on the gauge: the crossing closed and water reached the second step around noon.",
    vantage: "recorded",
  },
];

export const DEMO_CORROBORATED: MockTestimonySeed[] = [
  {
    text: "The old mill bell rang twice as the barrier came down across the road.",
    vantage: "witnessed",
  },
  {
    text: "Two tolls of the mill bell marked the barrier dropping across the road that day.",
    vantage: "heard",
  },
];

export const DEMO_FLOATING: MockTestimonySeed[] = [
  {
    text: "Someone said a heron stood on the railing the whole afternoon, unbothered.",
    vantage: "inferred",
  },
];

export const DEMO_FAULT: MockTestimonySeed[] = [
  {
    text: "The crossing never closed that noon; the water stayed well below the second step.",
    vantage: "witnessed",
  },
];
