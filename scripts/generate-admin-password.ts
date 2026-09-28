import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

async function main() {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  try {
    const password = await rl.question("New blog admin password (12+ characters): ");
    if (password.length < 12) throw new Error("Password must contain at least 12 characters");
    const salt = randomBytes(16);
    console.log(`scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`);
  } finally {
    rl.close();
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
