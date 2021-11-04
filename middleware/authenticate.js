const jwt = require("jsonwebtoken");
const dameConfig = require("../config.js");

const db = require("../dbConnectExec.js");

const auth = async (req, res, next) => {
  //   console.log("in the middlewear", req.header("Authorization"));
  //   next();

  try {
    //1.) decod the token

    let myToken = req.header("Authorization").replace("Bearer ", "");
    // console.log("Token", myToken);

    let decoded = jwt.verify(myToken, dameConfig.JWT);
    console.log(decoded);

    let customerPK = decoded.pk;

    //2.) compare the token with database

    let query = `SELECT CustomerPK, NameFirst, NameLast, Email
    FROM Customer
    WHERE CustomerPK=${customerPK} and token = '${myToken}'`;

    let returnedUser = await db.executeQuery(query);
    console.log("returned user", returnedUser);

    //3. // Save the user information in the request
    if (returnedUser[0]) {
      req.customer = returnedUser[0];
      next();
    } else {
      return res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    return res.status(401).send("Ibnvalid Credentials");
  }
};

module.exports = auth;
