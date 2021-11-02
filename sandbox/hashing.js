const bcrypt = require("bcryptjs");

let hashedPassword = bcrypt.hashSync("Research1");

console.log(hashedPassword);

let hashTest = bcrypt.compareSync("Research1", hashedPassword);

console.log(hashTest);
