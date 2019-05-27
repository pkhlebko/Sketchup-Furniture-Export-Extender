#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const util = require('util');
const actions = {
  convert: convertCSV
};
const actionsDescription = `action (${Object.keys(actions).join(', ')})`;
const actionsExpression = new RegExp('^(' + Object.keys(actions).join('|') + ')$', 'i');
const pathRegex = /[\\\/a-z_\-\s0-9\.]+/i;
const csvParse = require('csv-parse/lib/sync');
const csvParseOptions = { columns: true };
const convertedFileExt = '_extended.csv'

function convertCSV(options) {
  const readDir = util.promisify(fs.readdir);
  const dirPath = options.dirPath || './csv';
  const fileNameFilter = name => (name.indexOf('.csv') > -1) && (name.indexOf(convertedFileExt) < 0);
  
  readDir(dirPath)
    .then(filesNames => filesNames.filter(fileNameFilter))
    .then(csvFileNames => Promise.all(csvFileNames.map(fileName => processFile(fileName, dirPath))))
    .catch(errorHandler);
}

function processFile(name, dirPath) {
  const fileRead = util.promisify(fs.readFile);
  const fileWrite = util.promisify(fs.writeFile);
  const filePath = `${dirPath}/${name}`;
  const extendedFilePath = `${filePath.replace('.csv', '')}${convertedFileExt}`;

  return fileRead(filePath)
    .then(bufferToData)
    .then(transformData)
    .then(data => data.join('\n'))
    .then(str => fileWrite(extendedFilePath, str))
    .catch(errorHandler);
}

function bufferToData(buffer) {
  try {
    return csvParse(buffer.toString('utf8'), csvParseOptions);
  } catch (err) {
    errorHandler(err);
    return null;
  }
}

function transformData(data) {
  const definitionExp = /^(.+) (\d+)x(\d+) ([0-1]{4})(.*)$/;
  const headerRow = [
    'Name',
    'Material',
    'X',
    'Y',
    'Quantity',
    'X1B',
    'X2B',
    'Y1B',
    'Y2B',
    'Comment'
  ];
  const itemConverter = item => {
    const match = item['Definition Name'].match(definitionExp);
    
    if (!match) {
      return null;
    }

    return [
      match[1],
      '',
      match[2],
      match[3],
      item['Quantity'],
      match[4].charAt(0),
      match[4].charAt(1),
      match[4].charAt(2),
      match[4].charAt(3),
      match[5]
    ];
  }

  return [headerRow].concat(data.map(itemConverter).filter(item => item));
}

program
  .version('1.0.0')
  .option('-a, --action <action>', actionsDescription, actionsExpression)
  .option('-p, --path <dirPath>', 'folder path', pathRegex)
  .action(processAction)
  .parse(process.argv);

function processAction(...args) {
  let cmd = args[args.length - 1];
  let str = args.length > 1 ? args[0] : null;
  
  if (!cmd || !(typeof cmd.action === 'string')) {
    console.error('Error: action argument with correct value requared!');
    program.outputHelp();
    return;
  }

  const actionUpperStr = cmd.action.toUpperCase();
  const actionKey = Object.keys(actions).find((key) => key.toUpperCase() === actionUpperStr);
  const options = {
    dirPath: typeof cmd.path === 'string' ? validatePath(cmd.path) : null,
    text: str
  };

  return actions[actionKey](options);
}

function validatePath(path, write) {
  const mode = write ? fs.constants.W_OK : fs.constants.R_OK;

  try {
    fs.accessSync(path, mode);
    return path;
  } catch (err) {
    console.log(`Invalid path ${path}.`);
    return null;
  }
}

function errorHandler(err) {
  console.error(err);
}
