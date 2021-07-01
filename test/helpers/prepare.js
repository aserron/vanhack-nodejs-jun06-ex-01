const fs = require("fs");

/**
 * Returns a promise of expected data. 
 *
 * @param path - a path to the data to retrieve and parse
*/ 
const getExpectedData = path => 
  new Promise((resolve, reject) =>
    fs.readFile(path, "utf8", (err, data) =>
      err ? reject(err) : resolve(JSON.parse(data.toString()))
    )
  )
;

module.exports = {getExpectedData};