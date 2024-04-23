const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const { routeNotFound } = require("./middleware/routeNotFound.js");

const corsOptions = {
  origin: [
    "https://dadashop-frontend.vercel.app/",
    "http://localhost:3000/",
    "https://dadashop-frontend.vercel.app/item-shop/",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(bodyParser.json());

app.use(cors());

// app.all("*", function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

// app.use("/api/v1/user-balance", userBalanceRoute);

app.use(routeNotFound);

module.exports = app;
