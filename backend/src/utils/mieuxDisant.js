/** Tolérance max au-dessus du montant estimé (ex: 30 = +30 %) */
const DEFAULT_MAX_ECART_PERCENT = 30;

/**
 * Sélectionne le mieux-disant : offre >= montant estimé, pas trop au-dessus,
 * et la plus proche du montant estimé.
 */
function selectMieuxDisant(offers, montantEstime, options = {}) {
    const budget = Number(montantEstime);
    const maxEcartPercent = options.maxEcartPercent ?? DEFAULT_MAX_ECART_PERCENT;

    if (!budget || budget <= 0 || !Array.isArray(offers) || offers.length === 0) {
        return { best: null, ranked: [], eligible: [], rejected: [], budget, maxAllowed: null };
    }

    const maxAllowed = budget * (1 + maxEcartPercent / 100);

    const ranked = offers.map((offer) => {
        const price = Number(offer.montantPropose) || 0;
        const diff = price - budget;
        const diffAbs = Math.abs(diff);
        const diffPercent = budget > 0 ? (diff / budget) * 100 : 0;
        const isBelow = price < budget;
        const isTooHigh = price > maxAllowed;
        const isEligible = price > 0 && !isBelow && !isTooHigh;

        return {
            offer,
            price,
            diff,
            diffAbs,
            diffPercent,
            isBelow,
            isTooHigh,
            isEligible
        };
    });

    const eligible = ranked.filter((r) => r.isEligible);
    const rejected = ranked.filter((r) => !r.isEligible);

    eligible.sort((a, b) => a.diffAbs - b.diffAbs);
    rejected.sort((a, b) => a.diffAbs - b.diffAbs);

    const best = eligible.length > 0 ? eligible[0] : null;

    return {
        best,
        ranked: [...eligible, ...rejected],
        eligible,
        rejected,
        budget,
        maxAllowed,
        maxEcartPercent
    };
}

module.exports = {
    DEFAULT_MAX_ECART_PERCENT,
    selectMieuxDisant
};
