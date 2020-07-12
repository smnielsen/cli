#!/usr/bin/env node

const chalk = require('chalk')
const minimist = require('minimist')
const leven = require('leven')

const program = require('commander')
const enhanceErrorMessages = require('../lib/util/enhanceErrorMessages')

program
  .version(`@smnielsen/cli ${require('../package').version}`)
  .usage('smn <command> [options]')

program
  .command('create <app-name> [options]')
  .description('create a new project powered by smnielsen')
  .option('-t, --type <projectType>', 'Set type of project')
  .action((name, cmd) => {
    const options = cleanArgs(cmd)

    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(
        chalk.yellow(
          "\n Info: You provided more than one argument. The first one will be used as the app's name, the rest are ignored.",
        ),
      )
    }
    require('../lib/create')(name, options)
  })

program
  .command('netlight')
  .description('runs a netlight specific script')
  .option('-s, --script <script-name>', 'Run a specific netlight script')
  .option(
    '-u, --username <username>',
    'Username to use to fetch data from netlight',
  )
  .option('--cache', 'Use cache of Netlight data if exists', false)
  .allowUnknownOption()
  .action((cmd) => {
    require('../lib/netlight')(cleanArgs(cmd))
  })

// output help information on unknown commands
program.arguments('<command>').action((cmd) => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
  suggestCommands(cmd)
})

// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(
    `  Run ${chalk.cyan(
      `smn <command> --help`,
    )} for detailed usage of given command.`,
  )
  console.log()
})

program.commands.forEach((c) => c.on('--help', () => console.log()))

// enhance common error messages
enhanceErrorMessages('missingArgument', (argName) => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', (optionName) => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return (
    `Missing required argument for option ${chalk.yellow(option.flags)}` +
    (flag ? `, got ${chalk.yellow(flag)}` : ``)
  )
})

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit()
}

program.parse(process.argv)

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map((cmd) => cmd._name)

  let suggestion

  availableCommands.forEach((cmd) => {
    const isBestMatch =
      leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
  const args = {}
  if (!cmd || !cmd.options) {
    return args
  }
  cmd.options.forEach((o) => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}
