class Utils {
  /**
   * Formats a placeholder string with the actual values (e.g. "current balance: {0} EUR" is converted
   * to "current balance: 1234 EUR"). Formatting for decimals, floats or other numbers is not supported.
   *
   * @param {string} str - the string format including placeholders (e.g. "current balance: {0} EUR")
   * @returns the string with actual values (e.g. "current balance: 1234 EUR")
   */
  static formatString(str, ...args) {
    // https://coderwall.com/p/flonoa/simple-string-format-in-javascript
    a = str;
    for (k in args) {
      a = a.replace('{' + k + '}', args[k]);
    }
    return a;
  }

  /**
   * Generates a 32-bit hash code for the string value.
   *
   * @param {string} str - the string value
   * @returns {string} the hash code
   */
  static hashCode(str) {
    // https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
    var hash = 0,
      i,
      chr;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * Generates a 128-bit universally unique identifier (UUID).
   *
   * @returns {string} a random 128-bit UUID
   */
  static uuid() {
    // https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generates a 32-bit hash code for the string value that avoids hash code collisions.
   *
   * @param {str} this - the string value
   * @param {int} seed - a random seed value that improves the avoidance of hash code collisions.
   * @returns {string} the hash code
   */
  static cyrb53(str, seed = 0) {
    // https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
    let h1 = 0xdeadbeef ^ seed,
      h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
      Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
      Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
      Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
}
