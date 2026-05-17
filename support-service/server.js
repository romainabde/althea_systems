require("dotenv").config();
const express = require("express");
const cors = require("cors");
const supportRoutes = require("./routes/supportRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 8081;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use("/api", supportRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "support" });
});

app.listen(PORT, () => {
  console.log(`Support service listening on port ${PORT}`);
});
