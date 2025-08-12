const fs = require("fs");
const path = require("path");

const { OPENAI_API_KEY } = process.env;

const outPath = path.join(__dirname, "..", ".env");
let contents = "";

if (OPENAI_API_KEY) {
  contents += `OPENAI_API_KEY=${OPENAI_API_KEY}\n`;
} else {
  console.warn("⚠️  OPENAI_API_KEY não encontrada no ambiente do build.");
}

fs.writeFileSync(outPath, contents, { encoding: "utf8" });
console.log(`.env escrito em ${outPath}`);
