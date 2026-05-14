// Mock chalk to return strings without ANSI codes for testing
const chalk = {
  green: (str) => str,
  red: (str) => str,
  yellow: (str) => str,
  cyan: (str) => str,
  bold: (str) => str,
  gray: (str) => str,
  white: (str) => str,
};

// Add method chaining support
chalk.bold.cyan = (str) => str;

module.exports = chalk;
module.exports.default = chalk;