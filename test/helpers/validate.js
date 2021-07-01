/**
 * Determines whether two shallow string arrays are 
 * equal in any order (contain the same members).
 *
 * @param a - the first array
 * @param b - the second array
 * @return true if a and b are equal, false otherwise
*/
const arrShallowUnorderedEq = (a, b) => {
  if (a.length === b.length) {
    b = [...b].sort();
    return [...a].sort().every((e, i) => b[i] === e);
  }
  
  return false;
};

/**
 * Returns whether an `expectedItem` object is 
 * contained somewhere in an `actual` array of
 * objects, with strings in `expectedItem` compared 
 * by equality to `a`, while array members are
 * compared on unordered match of each string 
 * member and special characters are ignored.
 *
 * @param expectedItem - the expected object
 * @param actual - an array of actual objects
 * @return true if the expected object was in actual
*/
const itemMatchesActual = (expectedItem, actual) =>
  actual.some(a => 
    Object.keys(a).every(key => {
      if (Array.isArray(expectedItem[key])) {
        return Array.isArray(a[key]) &&
          arrShallowUnorderedEq(a[key], expectedItem[key]) 
        ;
      }
    
      return a[key] === expectedItem[key];
    })
  )
;

/**
 * Validates that an array of actual objects from a
 * response matches an expected array of objects, per 
 * instructions, which uses an unordered equality.
 * 
 * @param actual - the actual array of objects
 * @param expected - the expected array of objects
 * @return true if the two arrays match and false otherwise
*/
const validateResponse = (actual, expected) =>
  expected.length === actual.length &&
  expected.every(e => itemMatchesActual(e, actual))
;

module.exports = {validateResponse};