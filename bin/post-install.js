#!/usr/bin/env node

const chalk = require('chalk')
const { name } = require('../package')

console.log(`
  -----------------
  Thanks for installing ${chalk.bold(name)}

  ## For usage run ${chalk.cyan('$ smn --help')}

  -----------------
`)
