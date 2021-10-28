const express = require("express");

const db = require("./dbConnectExec.js");
const app = express();

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
