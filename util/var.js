require("dotenv/config");

const PORT = 8080;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

module.exports = { PORT, ACCESS_TOKEN_SECRET };
