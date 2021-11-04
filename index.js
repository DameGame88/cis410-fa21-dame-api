const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./dbConnectExec.js");
const dameConfig = require("./config.js");
const app = express();
const auth = require("./middleware/authenticate");

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

app.post("/reviews", auth, async (req, res) => {
  try {
    let EJuiceFK = req.body.EJuiceFK;
    let Summary = req.body.Summary;
    let Rating = req.body.Rating;

    if (!EJuiceFK || !Summary || !Rating || !Number.isInteger(Rating)) {
      return res.status(400).send("bad request");
    }

    Summary = Summary.replace("'", "''");
    // res.send("here is the response");
    // console.log("summary", summary);
    // console.log("here is the contact", req.customer);

    let insertQuery = `INSERT  INTO Review(Summary,Rating,EJuiceFK,CustomerFK)
    OUTPUT inserted.ReviewPK, inserted.Summary, inserted.Rating, inserted.EJuiceFK
    VALUES ('${Summary}', '${Rating}', '${EJuiceFK}', ${req.customer.CustomerPK}) `;

    let insertedReview = await db.executeQuery(insertQuery);
    // console.log("inserted review", insertedReview);
    res.status(201).send(insertedReview[0]);
  } catch (err) {
    console.log(" error in POST /Reviews", err);
    res.status(500).send();
  }
});

app.get("/customer/me", auth, (req, res) => {
  res.send(req.customer);
});

app.post("/customer/login", async (req, res) => {
  // console.log("/customer/login called", req.body);

  //1. Data validation
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Bad request");
  }

  // 2. Check that user exists in DB

  let query = `SELECT *
  FROM Customer
  WHERE email = '${email}'`;
  // THIS DID NOT POST CORRECTLY, DID NOT GET THE 500 ERROR IN POST MAN
  let result;
  try {
    result = await db.executeQuery(query);
  } catch (myError) {
    console.log("error is  /customer/login", myError);
    return res.status(500).send();
  }

  // console.log("result", result);

  if (!result[0]) {
    return res.status(401).send("Invalid user credentials");
  }

  // 3. check Password

  let user = result[0];
  //console.log("user", user);

  if (!bcrypt.compareSync(password, user.Password)) {
    return res.status(401).send("Invalid user credentials");
  }

  // 4. generate token

  let token = jwt.sign({ pk: user.CustomerPK }, dameConfig.JWT, {
    expiresIn: "60 minutes",
  });
  console.log("token", token);

  // 5. Save token in DB and send response back

  let setTokenQuery = `UPDATE Customer
  SET Token = '${token}'
  WHERE CustomerPK = '${user.CustomerPK}'`;

  try {
    await db.executeQuery(setTokenQuery);

    res.status(200).send({
      token: token,
      user: {
        NameFirst: user.NameFirst,
        NameLast: user.NameLast,
        Email: user.Email,
        CustomerPK: user.CustomerPK,
      },
    });
  } catch (myError) {
    console.log("error in setting user token", myError);
    res.status(500).send();
  }
});

app.post("/Customer", async (req, res) => {
  // res.send("/Customer called");

  // console.log("request body", req.body);

  let nameFirst = req.body.nameFirst;
  q;
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
      console.log("error in POST /customer", error);
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
