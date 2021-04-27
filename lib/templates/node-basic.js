'use strict'
require('colors')
const Generator = require('yeoman-generator')
const path = require('path')
const log = require('../../../libs/logger')
// const chalk = require('chalk');
// const yosay = require('yosay');

const cleanString = (str) => str.replace(/[|&;$%@"<>()+-_, ]/g, '')
const lowerCaseAll = (str) => str.replace(/[-]/g, '_')
module.exports = class extends Generator {
  constructor(context, props) {
    super(context, props)
    this.sourceRoot(path.join(__dirname, 'templates'))

    this.name = props.name
  }

  dest() {
    return `${this.destinationRoot(this.name)}`
  }

  // Ask for user input
  async prompting() {
    let answers = {}
    log.info('---- Service Setup ----')

    answers = await this.prompt([
      {
        type: 'input',
        name: 'description',
        default: '...',
        message: 'Please input description',
      },
      {
        type: 'input',
        name: 'author',
        default: '...',
        message: 'Who is the author?',
      },
    ])

    log.info('PostgreSQL Setup:')
    const serviceData = await this.prompt([
      {
        type: 'input',
        name: 'dbName',
        default: cleanString(this.name),
        message: 'Database name',
      },
    ])

    this.data = {
      name: this.name,
      nameUpperCase: lowerCaseAll(this.name.toUpperCase()),
      serviceData,
      ...answers,
    }
    log(this.data)
  }

  // Writing Logic here
  writing() {
    // Copy entire template
    this.fs.copyTpl(this.templatePath(), this.destinationPath(), this.data)

    // Copy all dotfiles
    this.fs.copy(this.templatePath('**/.*'), this.destinationPath(), {
      globOptions: { dot: true },
    })
  }

  // Install Dependencies
  install() {
    this.yarnInstall()

    // Print USAGE
    log.info(`
    ${`== Successfully setup application ===`.green.bold}

    ${'# Welcome to your new NodeJs app with PostgreSQL database.'.bold}

    This service is run purely with docker and docker-compose
    All scripts are run through the Makefile.

    ## Navigate to app
      $ ${`cd ${this.name}`.yellow}

    ## Start development server
      $ ${`make dev`.blue}

    ## Run tests
      $ ${`make test`.blue}

    ## Build for production (not implemented)
      $ ${`make build`.blue}
    `)
  }
}
