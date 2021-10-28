const sql = require("mssql");
const dameconfig = require("./config.js");

const config = {
  user: dameconfig.DB.user,
  password: dameconfig.DB.password,
  server: dameconfig.DB.server,
  database: dameconfig.DB.database,
};

async function executeQuery(aQuery) {
  let connection = await sql.connect(config);
  let result = await connection.query(aQuery);

  //   console.log(result);
  return result.recordset;
}

// executeQuery(`Select *
// From EJuice
// Left JOIN Style
// ON Style.StylePK = EJuice.StyleFK`);

module.exports = { executeQuery: executeQuery };
