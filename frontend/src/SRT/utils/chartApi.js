const BINANCE_API_BASE_URL = "https://api.binance.com";

/**
 * Fetch candlestick (Kline) data
 * @param {string} symbol - Trading pair (e.g., SOLUSDT)
 * @param {string} interval - Time interval (e.g., 1m, 5m, 1h, 1d)
 * @param {number} limit - Number of data points to fetch (default: 100)
 * @returns {Promise<Object[]>} - Array of candlestick data
 */
export const fetchCandlestickData = async (symbol, interval, limit = 100) => {
  try {
    const endpoint = `${BINANCE_API_BASE_URL}/api/v3/klines`;
    const queryParams = new URLSearchParams({ symbol, interval, limit }).toString();

    const response = await fetch(`${endpoint}?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch candlestick data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map(item => ({
      openTime: item[0],       // Opening time (timestamp)
      open: parseFloat(item[1]),  // Opening price
      high: parseFloat(item[2]),  // Highest price
      low: parseFloat(item[3]),   // Lowest price
      close: parseFloat(item[4]), // Closing price
      volume: parseFloat(item[5]), // Trading volume
      closeTime: item[6],      // Closing time (timestamp)
    }));
  } catch (error) {
    console.error("Error fetching candlestick data:", error.message);
    throw error;
  }
};

/**
 * Fetch the latest price for a specific trading pair
 * @param {string} symbol - Trading pair (e.g., SOLUSDT)
 * @returns {Promise<Object>} - Latest price data
 */
export const fetchLatestPrice = async (symbol) => {
  try {
    const endpoint = `${BINANCE_API_BASE_URL}/api/v3/ticker/price`;
    const queryParams = new URLSearchParams({ symbol }).toString();

    const response = await fetch(`${endpoint}?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch latest price: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      symbol: data.symbol,
      price: parseFloat(data.price),
    };
  } catch (error) {
    console.error("Error fetching latest price:", error.message);
    throw error;
  }
};

/**
 * Fetch 24-hour ticker data
 * @param {string} symbol - Trading pair (e.g., SOLUSDT)
 * @returns {Promise<Object>} - 24-hour ticker stats
 */
export const fetch24HourTicker = async (symbol) => {
  try {
    const endpoint = `${BINANCE_API_BASE_URL}/api/v3/ticker/24hr`;
    const queryParams = new URLSearchParams({ symbol }).toString();

    const response = await fetch(`${endpoint}?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch 24-hour ticker: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      symbol: data.symbol,
      priceChange: parseFloat(data.priceChange),
      priceChangePercent: parseFloat(data.priceChangePercent),
      highPrice: parseFloat(data.highPrice),
      lowPrice: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
      lastPrice: parseFloat(data.lastPrice),
    };
  } catch (error) {
    console.error("Error fetching 24-hour ticker data:", error.message);
    throw error;
  }
};
