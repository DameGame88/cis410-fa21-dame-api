const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("./dbConnectExec.js");
const app = express();

app.use(express.json());
app.listen(5000, () => {
  console.log(`app is running on port 5000`);
});

app.get("/hi", (req, res) => {
  res.send("Hello World");
});

app.get("/", (req, res) => {
  res.send("API is running");
});

// app.post()
// app.put()

app.post("/Customer", async (req, res) => {
  // res.send("/Customer called");

  // console.log("request body", req.body);

  let nameFirst = req.body.nameFirst;
  let nameLast = req.body.nameLast;
  let email = req.body.email;
  let age = req.body.age;
  let zip = req.body.zip;
  let password = req.body.password;

  if (!nameFirst || !nameLast || !email || !age || !zip || !password) {
    return res.status(400).send("Bad request");
  }

  nameFirst = nameFirst.replace("'", "''");
  nameLast = nameLast.replace("'", "''");
  let emailCheckQuery = `SELECT Email
FROM Customer
WHERE Email = '${email}'`;

  let existingUser = await db.executeQuery(emailCheckQuery);

  // console.log("existing user", existingUser);

  if (existingUser[0]) {
    return res.status(409).send("Duplicate Email");
  }

  let hashedPassword = bcrypt.hashSync(password);

  // PROBLEM HERE WITH hashedPassword- does not post correctly with the added Hash
  let insertQuery = `INSERT INTO Customer(NameFirst, NameLast, Email, Age, Zip, password)
    VALUES('${nameFirst}','${nameLast}','${email}','${age}','${zip}','${hashedPassword}')`;

  db.executeQuery(insertQuery)
    .then(() => {
      res.status(201).send();
    })
    .catch((error) => {
      console.log("error in POST /customer", err);
      res.status(500).send();
    });
});

app.get("/EJuice", (req, res) => {
  //Get Data From The DataBase
  db.executeQuery(
    `Select *
  From EJuice
  Left JOIN Style
  ON Style.StylePK = EJuice.StyleFK`
  )
    .then((theResults) => {
      res.status(200).send(theResults);
    })
    .catch((myError) => {
      console.log(myError);
      res.status(500).send();
    });
});

app.get("/EJuice/:pk", (req, res) => {
  let pk = req.params.pk;
  // console.log(pk);
  let myQuery = `Select *
  From EJuice
  Left JOIN Style
  ON Style.StylePK = EJuice.StyleFK
  WHERE EJuicePK = ${pk}`;

  db.executeQuery(myQuery)
    .then((result) => {
      // console.log("result", result);
      if (result[0]) {
        res.send(result[0]);
      } else {
        res.status(404).send(`bad request`);
      }
    })
    .catch((err) => {
      console.log("Error in /EJuice/:pk", err);
      res.status(500).send();
    });
});
