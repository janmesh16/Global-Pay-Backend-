const axios = require('axios');
const NodeCache = require('node-cache');
const env = require('../config/env');
const Settings = require('../models/Settings');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// In-memory cache
const rateCache = new NodeCache({ stdTTL: env.RATE_CACHE_TTL_SECONDS });

// Static fallback rates (vs USD)
const FALLBACK_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, AED: 3.67,
  CAD: 1.36, AUD: 1.53, JPY: 149.5, SGD: 1.34,
};

/**
 * Fetch rates from forex API.
 */
const fetchLiveRates = async (baseCurrency) => {
  try {
    const url = `${env.FOREX_API_URL}/${baseCurrency}`;
    const response = await axios.get(url, { timeout: 5000 });
    if (response.data && response.data.rates) {
      return response.data.rates;
    }
    throw new Error('Invalid API response');
  } catch (error) {
    logger.warn(`[currency] Forex API error: ${error.message}`);
    return null;
  }
};

/**
 * Get exchange rates for a base currency.
 * Tries: cache → live API → stale cache → static fallback.
 */
const getRates = async (from, to = null) => {
  const settings = await Settings.getGlobal();
  const supported = settings.supportedCurrencies;

  if (!supported.includes(from)) {
    throw ApiError.badRequest(`Currency ${from} is not supported`);
  }
  if (to && !supported.includes(to)) {
    throw ApiError.badRequest(`Currency ${to} is not supported`);
  }

  const cacheKey = `rates_${from}`;

  // 1. Check fresh cache
  const cached = rateCache.get(cacheKey);
  if (cached) {
    const rates = to ? { [to]: cached.rates[to] } : filterSupported(cached.rates, supported);
    return { rates, timestamp: cached.timestamp, source: 'cached' };
  }

  // 2. Try live API
  const liveRates = await fetchLiveRates(from);
  if (liveRates) {
    const timestamp = new Date().toISOString();
    rateCache.set(cacheKey, { rates: liveRates, timestamp });
    const rates = to ? { [to]: liveRates[to] } : filterSupported(liveRates, supported);
    return { rates, timestamp, source: 'live' };
  }

  // 3. Try stale cache (get with ignoring TTL)
  const stale = rateCache.get(cacheKey);
  if (stale) {
    const rates = to ? { [to]: stale.rates[to] } : filterSupported(stale.rates, supported);
    return { rates, timestamp: stale.timestamp, source: 'stale-cache' };
  }

  // 4. Static fallback
  logger.warn(`[currency] Using static fallback rates for ${from}`);
  const fallback = computeFallbackRates(from, supported);
  const rates = to ? { [to]: fallback[to] } : fallback;
  return { rates, timestamp: new Date().toISOString(), source: 'fallback' };
};

/**
 * Get a specific rate between two currencies.
 */
const getRate = async (from, to) => {
  if (from === to) return { rate: 1, source: 'identity' };

  const result = await getRates(from, to);
  const rate = result.rates[to];
  if (!rate) {
    throw ApiError.badRequest(`Rate not available for ${from} → ${to}`);
  }
  return { rate, source: result.source, timestamp: result.timestamp };
};

/**
 * Filter rates to only include supported currencies.
 */
const filterSupported = (rates, supported) => {
  const filtered = {};
  for (const cur of supported) {
    if (rates[cur] !== undefined) filtered[cur] = rates[cur];
  }
  return filtered;
};

/**
 * Compute fallback cross-rates from the static USD table.
 */
const computeFallbackRates = (baseCurrency, supported) => {
  const baseToUsd = FALLBACK_RATES[baseCurrency];
  if (!baseToUsd) return {};

  const rates = {};
  for (const cur of supported) {
    if (cur === baseCurrency) {
      rates[cur] = 1;
    } else {
      rates[cur] = parseFloat((FALLBACK_RATES[cur] / baseToUsd).toFixed(6));
    }
  }
  return rates;
};

module.exports = { getRates, getRate, FALLBACK_RATES };
