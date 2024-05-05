require("dotenv/config");

const PORT = 8080;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const STRIPE_SECRET = process.env.STRIPE_SECRET;
const STRIPE_WEBHOOK = process.env.STRIPE_WEBHOOK;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

module.exports = {
  PORT,
  ACCESS_TOKEN_SECRET,
  STRIPE_SECRET,
  FRONTEND_URL,
  BACKEND_URL,
  STRIPE_WEBHOOK,
};
