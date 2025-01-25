import { PRICE_TIERS } from "./constants";

/**
 * Apply filters to the raffles.
 * @param {Array} raffles - List of raffles
 * @param {Object} filters - Filters to apply
 * @returns {Array} - Filtered raffles
 */
export const applyFilters = (raffles, filters) => {
  let filteredRaffles = [...raffles];

  // Filter by type (onChain/offChain)
  if (filters.type === "onChain") {
    filteredRaffles = filteredRaffles.filter((raffle) => raffle.prizeDetails?.type === "onChain");
  } else if (filters.type === "offChain") {
    filteredRaffles = filteredRaffles.filter((raffle) => raffle.prizeDetails?.type === "physical");
  }

  // Filter by price tiers
  if (filters.price) {
    const tier = PRICE_TIERS[filters.price];
    filteredRaffles = filteredRaffles.filter(
      (raffle) => raffle.entryFee >= tier.min && raffle.entryFee <= tier.max
    );
  }

  return filteredRaffles;
};

/**
 * Calculate filter counts for raffles.
 * @param {Array} raffles - List of raffles
 * @returns {Object} - Counts for each filter
 */
export const calculateFilterCounts = (raffles) => {
  const onChainCount = raffles.filter((raffle) => raffle.prizeDetails?.type === "onChain").length;
  const offChainCount = raffles.filter((raffle) => raffle.prizeDetails?.type === "physical").length;
  const conservativeCount = raffles.filter(
    (raffle) => raffle.entryFee >= PRICE_TIERS.conservative.min && raffle.entryFee <= PRICE_TIERS.conservative.max
  ).length;
  const moderateCount = raffles.filter(
    (raffle) => raffle.entryFee >= PRICE_TIERS.moderate.min && raffle.entryFee <= PRICE_TIERS.moderate.max
  ).length;
  const aggressiveCount = raffles.filter(
    (raffle) => raffle.entryFee >= PRICE_TIERS.aggressive.min && raffle.entryFee <= PRICE_TIERS.aggressive.max
  ).length;

  return {
    all: raffles.length,
    onChain: onChainCount,
    offChain: offChainCount,
    conservative: conservativeCount,
    moderate: moderateCount,
    aggressive: aggressiveCount,
  };
};
