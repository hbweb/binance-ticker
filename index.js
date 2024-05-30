const express = require("express");
const https = require("https");

const app = express();

// Function to fetch ticker data from Binance API
const fetchBinanceTicker = (symbol) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.binance.com",
      port: 443,
      path: `/api/v3/ticker/24hr?symbol=${symbol}`,
      method: "GET",
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
};

app.get("/price/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const tickerData = await fetchBinanceTicker(symbol);

    if (tickerData) {
      res.setHeader("Content-Type", "text/plain");
      res.send(tickerData.bidPrice);
    } else {
      res.status(404).send("SYMBOL NOT FOUND");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Export the Express app to be used by Cloud Functions
module.exports = app;
