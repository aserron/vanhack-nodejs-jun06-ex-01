/**
 * Returns a string of prettified 
 * JSON for a verbose test failure
 *
 * @param expected - the expected object structure
 * @param actual - the actual object structure
*/
const getFailString = (actual, expected) => 
`response.body:
${JSON.stringify(actual, null, 2)}

did not match expected.body:

${JSON.stringify(expected, null, 2)}`
;

module.exports = {getFailString};