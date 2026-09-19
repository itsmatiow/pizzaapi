const fs = require("fs");
const path = require("path");

const dbPath = path.join(process.cwd(), "db.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

let orders = [...db.order];

module.exports = (req, res) => {
  const url = req.url || "";

  // GET /menu
  if (req.method === "GET" && url === "/menu") {
    return res.status(200).json(db.menu);
  }

  // GET /order/:id
  if (req.method === "GET" && url.startsWith("/order/")) {
    const id = url.split("/")[2];

    const order = orders.find((order) => String(order.id) === String(id));

    if (!order) {
      return res.status(404).json({
        error: `Order #${id} not found`,
      });
    }

    return res.status(200).json(order);
  }

  // POST /order
  if (req.method === "POST" && url === "/order") {
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
  if (req.method === "PATCH" && url.startsWith("/order/")) {
    const id = url.split("/")[2];

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
