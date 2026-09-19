const fs = require("fs");
const path = require("path");

const dbPath = path.join(process.cwd(), "db.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

let orders = [...db.order];

module.exports = (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const pathname = new URL(
    req.url,
    `https://${req.headers.host}`
  ).pathname;

  // GET /menu
  if (req.method === "GET" && pathname === "/menu") {
    return res.status(200).json(db.menu);
  }

  // GET /order/:id
  if (req.method === "GET" && pathname.startsWith("/order/")) {
    const id = pathname.split("/")[2];

    const order = orders.find(
      (order) => String(order.id) === String(id)
    );

    if (!order) {
      return res.status(404).json({
        error: `Order #${id} not found`,
      });
    }

    return res.status(200).json(order);
  }

  // POST /order
  if (req.method === "POST" && pathname === "/order") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const newOrder = JSON.parse(body);

        orders.push(newOrder);

        return res.status(201).json(newOrder);
      } catch {
        return res.status(400).json({
          error: "Invalid JSON",
        });
      }
    });

    return;
  }

  // PATCH /order/:id
  if (req.method === "PATCH" && pathname.startsWith("/order/")) {
    const id = pathname.split("/")[2];

    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const updateData = JSON.parse(body);

        const index = orders.findIndex(
          (order) => String(order.id) === String(id)
        );

        if (index === -1) {
          return res.status(404).json({
            error: `Order #${id} not found`,
          });
        }

        orders[index] = {
          ...orders[index],
          ...updateData,
        };

        return res.status(200).json(orders[index]);
      } catch {
        return res.status(400).json({
          error: "Invalid JSON",
        });
      }
    });

    return;
  }

  return res.status(404).json({
    error: "Route not found",
  });
};
