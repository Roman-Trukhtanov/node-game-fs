#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const util = require('util');
const appendFileAsync = util.promisify(fs.appendFile);
const writeFileAsync = util.promisify(fs.writeFile);

// ARGV
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const fileName = argv._[0];

const WIN_STATUS = 1;
const LOSE_STATUS = 0;

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const checkFileExists = (fileName) => {
  const filePath = path.join(__dirname, fileName);
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error(err);
  }
};

const createFileSync = (fileName, content = '') => {
  try {
    fs.writeFileSync(fileName, content);
    console.log(`LOG: ${fileName} был успешно создан`);
  } catch (err) {
    throw new Error(err);
  }
};

class HeadsOrTails {
  constructor() {
    this.rl = readline.createInterface(process.stdin);
    this.guessNumber = randomInt(1, 2);
    this.isRepeat = false;
    this.isWin = false;
    this.isStartGame = true;
    this.startText =
      '- Загадано число в диапазоне от 1 до 2, попробуйте угадать какое:';

    this.onLine = this.onLine.bind(this);
  }
  checkLogFile() {
    if (!checkFileExists(fileName)) {
      createFileSync(fileName);
    } else {
      console.log(
        `LOG: все результаты будут записываться в ранее созданный ${fileName}`
      );
    }
  }
  init() {
    this.checkLogFile();
    this.addListeners();

    console.log('\n----- Старт игры -----');
    this.startGame();
  }
  startGame() {
    console.log(this.startText);
  }
  reset() {
    console.log('\n----- Рестарт игры -----');
    this.guessNumber = randomInt(1, 2);
    this.isWin = false;
    this.isRepeat = false;
    this.isStartGame = true;
    this.startGame();
  }
  appendResultsToLog(userAnswer) {
    const currentDate = new Date().toISOString();
    const gameStatusText = `GAME_STATUS=${
      this.isWin ? WIN_STATUS : LOSE_STATUS
    }`;
    const userAnswerText = `USER_ANSWER=${userAnswer}`;

    const logArray = [currentDate, gameStatusText, userAnswerText];

    return appendFileAsync(fileName, logArray.join(' ') + '\n');
  }
  checkUserAnswer(userAnswer) {
    if (this.guessNumber === Number(userAnswer)) {
      this.isWin = true;
    } else {
      this.isWin = false;
    }
  }
  showResults(userAnswer) {
    const resultText = `(загаданое число: ${this.guessNumber})`;

    if (this.isWin) {
      console.log('\nПоздравляем, вы угадали!!!', resultText);
    } else {
      console.log('\nК сожалению вы не угадали.', resultText);
    }

    return this.appendResultsToLog(userAnswer);
  }
  onLine(input) {
    if (this.isStartGame) {
      this.isStartGame = false;
      this.checkUserAnswer(input);
      this.showResults(input)
        .then(() => {
          console.log('LOG: результаты были успешно записаны!');
          console.log('\nХотите попробовать снова? (Y/N)');
        })
        .catch((err) => {
          if (err) throw new Error(err);
        });

      return;
    }

    // Проверка на повтор игры
    if (input.toLowerCase() === 'y') {
      this.reset();
    } else if (input.toLowerCase() === 'n') {
      this.rl.close();
    } else {
      console.log('Введите Y или N');
    }
  }
  addListeners() {
    this.rl.on('line', this.onLine);
    this.rl.on('close', () => {
      console.log('----- Конец игры :) -----');
    });
  }
}

const headsOrTails = new HeadsOrTails();
headsOrTails.init();
