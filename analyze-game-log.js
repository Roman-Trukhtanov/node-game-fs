const fs = require('fs');
const path = require('path');
const readline = require('readline');
const util = require('util');
const constants = require('./const');

const readFileAsync = util.promisify(fs.readFile);

// ARGV
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const fileName = argv._[0];

const checkFileExists = (fileName) => {
  const filePath = path.join(__dirname, fileName);
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error(err);
  }
};

if (!checkFileExists(fileName)) {
  console.log('Такого файла не существует!');
  return;
}

const resultsData = {
  all_games: 0,
  won_games: 0,
  lost_games: 0,
  won_ratio: '',
};

const checkGameStatus = (status) => {
  if (status === undefined) {
    return;
  }

  switch (status) {
    case constants.WIN_STATUS:
      resultsData.won_games += 1;
      break;
    case constants.LOSE_STATUS:
      resultsData.lost_games += 1;
      break;
    default:
      break;
  }
};

const setWonRation = (data) => {
  const { all_games: allGames, won_games: wonGames } = data;

  const wonRatio = Math.round((wonGames / allGames) * 10000) / 100;
  data.won_ratio = `${wonRatio}%`;
};

const setAllGames = (data, length) => {
  data.all_games = length;
};

const analyzeGameLog = (dataStr) => {
  const gameLines = dataStr.split('\n').filter((line) => !!line);
  if (!gameLines.length) {
    console.log('Пустой лог файл!');
    return;
  }

  setAllGames(resultsData, gameLines.length);

  gameLines.forEach((gameLine) => {
    const [time, gameStatusStr, userAnswerStr] = gameLine.split(' ');
    const [, gameStatus] = gameStatusStr.split('=');
    const gameStatusNum = Number(gameStatus);

    if (!isNaN(gameStatusNum)) {
      checkGameStatus(gameStatusNum);
    }
  });

  setWonRation(resultsData);
};

const filePath = path.join(__dirname, fileName);
readFileAsync(filePath)
  .then((data) => {
    const buffer = data.toString();
    analyzeGameLog(buffer);
    console.table(resultsData);
  })
  .catch((err) => {
    throw new Error(err);
  });
