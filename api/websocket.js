const express = require("express");
const { WebSocketServer } = require("ws");
const data1mBTC = require("./constants/BTC/data1m");
const data15mBTC = require("./constants/BTC/data15m");
const data1HBTC = require("./constants/BTC/data1H");
const data4HBTC = require("./constants/BTC/data4H");
const data1DBTC = require("./constants/BTC/data1D");
const data1WBTC = require("./constants/BTC/data1W");

const data1mETH = require("./constants/ETH/data1m");
const data15mETH = require("./constants/ETH/data15m");
const data1HETH = require("./constants/ETH/data1H");
const data4HETH = require("./constants/ETH/data4H");
const data1DETH = require("./constants/ETH/data1D");
const data1WETH = require("./constants/ETH/data1W");

const data1mDOGE = require("./constants/DOGE/data1m");
const data15mDOGE = require("./constants/DOGE/data15m");
const data1HDOGE = require("./constants/DOGE/data1H");
const data4HDOGE = require("./constants/DOGE/data4H");
const data1DDOGE = require("./constants/DOGE/data1D");
const data1WDOGE = require("./constants/DOGE/data1W");

const clients = new Map();
const app = express();
const server = require("http").createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", function connection(ws, req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const param = url.searchParams;
  const test = Object.fromEntries(new URLSearchParams(param));

  const data = fetchSpreadsheetData(test);

  ws.send(JSON.stringify(data));
  // }
  clients.set(ws, test);
  console.log("A new client connected.");

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client has disconnected.");
  });
});

// Function to fetch data from Google Apps Script Web App
function fetchSpreadsheetData(params) {
  let dataCandle = [];
  if (params.symbol === "BTC") {
    if (params.interval === "1m") {
      dataCandle = data1mBTC;
    } else if (params.interval === "15m") {
      dataCandle = data15mBTC;
    } else if (params.interval === "1h") {
      dataCandle = data1HBTC;
    } else if (params.interval === "4h") {
      dataCandle = data4HBTC;
    } else if (params.interval === "1d") {
      dataCandle = data1DBTC;
    } else if (params.interval === "1w") {
      dataCandle = data1WBTC;
    }
  } else if (params.symbol === "ETH") {
    if (params.interval === "1m") {
      dataCandle = data1mETH;
    } else if (params.interval === "15m") {
      dataCandle = data15mETH;
    } else if (params.interval === "1h") {
      dataCandle = data1HETH;
    } else if (params.interval === "4h") {
      dataCandle = data4HETH;
    } else if (params.interval === "1d") {
      dataCandle = data1DETH;
    } else if (params.interval === "1w") {
      dataCandle = data1WETH;
    }
  } else if (params.symbol === "DOGE") {
    if (params.interval === "1m") {
      dataCandle = data1mDOGE;
    } else if (params.interval === "15m") {
      dataCandle = data15mDOGE;
    } else if (params.interval === "1h") {
      dataCandle = data1HDOGE;
    } else if (params.interval === "4h") {
      dataCandle = data4HDOGE;
    } else if (params.interval === "1d") {
      dataCandle = data1DDOGE;
    } else if (params.interval === "1w") {
      dataCandle = data1WDOGE;
    }
  }

  const result = {
    a: [...Array(100)].map(() => [Math.random() * 10000, Math.random() * 10]),
    b: [...Array(100)].map(() => [Math.random() * 10000, Math.random() * 10]),
    p: Math.random() * 10000,
    data: dataCandle,
  };
  return result;
}

// Broadcast spreadsheet data to all connected WebSocket clients
setInterval(() => {
  wss.clients.forEach(function each(client) {
    const param = clients.get(client);
    const data = fetchSpreadsheetData(param);

    // if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
    // }
  });
}, 1000); // Fetch and send data every 5 seconds

server.listen(8080, () => {
  console.log("Listening on http://localhost:8080");
});

module.exports = app;
