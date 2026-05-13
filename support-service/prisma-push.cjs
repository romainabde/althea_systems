const { execSync } = require("child_process");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const schemaPath = path.resolve(
  __dirname,
  "..",
  "auth-cart-service",
  "prisma",
  "schema.prisma"
);

execSync(`npx prisma db push --schema "${schemaPath}"`, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});
