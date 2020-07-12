const chalk = require('chalk')

async function netlight(options = {}) {
  console.log(
    `${chalk.red('Not Implemented')}: ${chalk.bold(
      'netlight',
    )} is under development`,
  )
  console.log(options)
  process.exit(1)
}

module.exports = (...args) => {
  return netlight(...args)
}
