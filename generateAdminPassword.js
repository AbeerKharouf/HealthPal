const bcrypt = require("bcryptjs");

const plainPassword = "123456"; 
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }
  console.log("Encrypted password:", hash);
});
