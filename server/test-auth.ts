import bcrypt from "bcryptjs";

async function test() {
  const password = "password123";
  const hash = await bcrypt.hash(password, 10);
  console.log("Password:", password);
  console.log("Hash:", hash);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log("Is valid:", isValid);
  
  const isInvalid = await bcrypt.compare("wrongpassword", hash);
  console.log("Is invalid (wrong password):", !isInvalid);
}

test();
