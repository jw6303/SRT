// frontend/src/blank/utils/progressUtils.js

export const calculateProgress = (soldTickets, totalTickets) => {
    return Math.min((soldTickets / totalTickets) * 100, 100);
};
