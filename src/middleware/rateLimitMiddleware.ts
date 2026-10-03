import rateLimit from "express-rate-limit";

/**
 * Login rate limiter
 *
 * Protects against repeated password-guessing attempts.
 *
 * 10 failed requests per 15 minutes from the same IP.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 10,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many login attempts. Please try again later.",
  },
});

/**
 * Registration rate limiter
 *
 * Prevents automated creation of large numbers
 * of accounts.
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,

  limit: 5,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many registration attempts. Please try again later.",
  },
});

/**
 * Refresh-token rate limiter
 *
 * Protects the refresh endpoint from excessive
 * automated requests.
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 30,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many refresh attempts. Please try again later.",
  },
});