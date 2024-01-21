async function loadData(jsonFile) {
  try {
    const response = await fetch(jsonFile);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    return 'Failed';
  }
}

class KeyboardKey {
  constructor(item, clickHandler = null) {
    this.item = item;
    this.key = document.createElement('button');
    this.createKey();
    this.clickHandler = clickHandler;
    if (this.clickHandler) {
      this.key.addEventListener('click', () => {
        this.clickHandler(this.item, this.key);
      });
    }
  }

  createKey = () => {
    this.key.setAttribute('type', 'button');
    this.key.classList.add('key');
    this.key.textContent = this.item.char;
  };

  getKey = () => {
    return this.key;
  };
}

class KeyboardRow {
  constructor(rowData, rowNumber, keyClickHandler = null) {
    this.keyClickHandler = null;
    if (keyClickHandler) {
      this.keyClickHandler = keyClickHandler;
    }
    this.rowData = rowData;
    this.rowNumber = rowNumber;
    this.setRow(this.rowNumber);
    this.rowData.forEach(this.renderKey);
  }

  setRow = (rowNumber) => {
    this.row = document.createElement('div');
    this.row.classList.add(`row`);
    this.row.classList.add(rowNumber);
  };

  getRow = () => {
    return this.row;
  };

  renderKey = (item) => {
    const key = new KeyboardKey(item, this.keyClickHandler);
    this.row.appendChild(key.getKey());
  };
}

class Modal {
  constructor(content, buttonHandler) {
    this.content = content;
    this.buttonHandler = buttonHandler;
  }

  setModalContent() {
    const contentElement = document.createElement('div');
    contentElement.classList.add('modal_content');
    const phrase = document.createElement('div');
    phrase.classList.add('phrase');
    phrase.textContent = this.content.phrase;
    const answer = document.createElement('div');
    answer.classList.add('answer');
    answer.textContent = this.content.answer;
    contentElement.appendChild(phrase);
    contentElement.appendChild(answer);
    return contentElement;
  }

  remove_modal = () => {
    this.modal.remove();
  };

  open_modal = () => {
    this.modal.style.display = 'block';
  };

  init() {
    this.modal = document.createElement('div');
    this.modal.classList.add('modal');
    this.contentFrame = document.createElement('div');
    this.contentFrame.classList.add('modal_frame');
    this.contentBox = document.createElement('div');
    this.contentBox.classList.add('modal_content_box');
    const content = this.setModalContent();
    const button = document.createElement('button');
    button.classList.add('modal_btn');
    button.textContent = this.content.btn_text;
    button.addEventListener('click', this.buttonHandler);
    button.addEventListener('click', this.remove_modal);
    this.contentBox.appendChild(content);
    this.contentBox.appendChild(button);
    this.contentFrame.appendChild(this.contentBox);
    this.modal.appendChild(this.contentFrame);
    document.body.appendChild(this.modal);
  }
}

class GameVisualBox {
  constructor(item, box, getState) {
    this.item = item;
    this.box = box;
    this.getState = getState;
    this.state = this.getState();
  }

  setQuestion = () => {
    this.box.innerHTML = '';
    this.question = document.createElement('div');
    this.question.className = 'question';
    this.question.textContent = this.state.actualGameItem.question;
    this.answerBox = document.createElement('div');
    this.answerBox.className = 'answer';
    this.box.appendChild(this.question);
    this.box.appendChild(this.answerBox);
    this.setAnswer(this.state, this.item, this.answerBox);
    this.setCounter();
  };

  setAnswer(state, item, answerBox) {
    console.log('item', item);
    function setButton(value) {
      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.classList.add('char');
      button.textContent = value;
      answerBox.appendChild(button);
    }
    this.answerArray = Array.from(item.answer.toUpperCase());
    this.answerArray.forEach((value) => {
      const find = state.charStore.find((char) => char === value);
      if (find) {
        setButton(value);
      } else {
        setButton('-');
      }
    });
  }

  setCounter() {
    const counter = document.createElement('div');
    counter.classList.add('counter');
    counter.textContent = `${this.state.charErrorStore.length}/6`;
    this.box.appendChild(counter);
  }
}

class Gallows {
  constructor(gamer, place, getState) {
    this.gamer = gamer;
    this.place = place;
    this.getState = getState;
    this.state = this.getState();
    this.gamerMistakes = this.state.charErrorStore;
    this.gallowsBox = document.createElement('div');
  }

  init() {
    this.gallowsBox.classList.add('gallows');
    this.place.appendChild(this.gallowsBox);
  }

  hangThePlayer = () => {
    this.gallowsBox.innerHTML = '';
    if (this.gamerMistakes.length < 7) {
      this.gamerMistakes.forEach((_, index) => {
        const part = document.createElement('div');
        part.classList.add('part');
        part.textContent = this.gamer[index];
        this.gallowsBox.appendChild(part);
      });
    }
  };

  getGallowsBox = () => {
    return this.gallowsBox;
  };
}

class HangmanState {
  constructor() {
    this.playedGames = [];
    this.gamer = [
      'head',
      'body',
      'left arm',
      'right arm',
      'left leg',
      'right leg',
    ];
    this.keysData = null;
    this.actualGameItem = null;
    this.actualChar = null;
    this.charStore = [];
    this.charErrorStore = [];
  }

  checkIsLose() {
    if (this.charErrorStore.length === 6) {
      const answer = this.actualGameItem.answer.toUpperCase();
      const modal = new Modal(
        {
          answer,
          btn_text: 'Try again!',
          phrase:
            "Don't worry, better luck next time! You'll get it next time for sure",
        },
        this.setNewGame
      );
      modal.init();
      modal.open_modal();
    }
  }

  checkIfWin() {
    const answer = this.actualGameItem.answer.toUpperCase();
    const check = answer
      .split('')
      .every((char) => this.charStore.includes(char));
    if (check) {
      const modal = new Modal(
        {
          answer,
          btn_text: 'Play again!',
          phrase: 'Your win! Congratulation!',
        },
        this.setNewGame
      );
      modal.init();
      modal.open_modal();
    }
  }

  setKeysData(data) {
    this.keysData = data;
  }

  keyClickHandler = (charItem) => {
    this.actualChar = charItem;

    const find = this.charStore.some((item) => item === charItem.char);
    if (!find) {
      const answerArray = Array.from(this.actualGameItem.answer.toUpperCase());
      const findCharInAnswer = answerArray.find(
        (char) => char === charItem.char
      );
      if (!findCharInAnswer) {
        this.charErrorStore.push(charItem.char);
        this.hangThePlayer();
      }
      this.charStore.push(charItem.char);
      this.setQuestion();
    } else {
      console.log('You have this button already pushed');
    }
    this.checkIsLose();
    this.checkIfWin();
  };

  setActualGameItem(gameData, box) {
    this.gameData = gameData;
    if (this.gameData && this.gameData.length > 0) {
      const randomItem =
        this.gameData[Math.floor(Math.random() * this.gameData.length)];
      this.actualGameItem = randomItem;
    }
    const visual = new GameVisualBox(this.actualGameItem, box, this.getState);
    this.setQuestion = visual.setQuestion;
    this.setQuestion();
    const gallows = new Gallows(this.gamer, this.leftDiv, this.getState);
    gallows.init();
    this.hangThePlayer = gallows.hangThePlayer;
    this.gallowsBox = gallows.getGallowsBox();
  }

  setNewGame = () => {
    this.visualBox.innerHTML = '';
    this.gallowsBox.remove();
    this.actualChar = null;
    this.actualGameItem = null;
    this.charStore.length = 0;
    this.charErrorStore.length = 0;
    if (this.gameData && this.gameData.length > 0) {
      const randomItem =
        this.gameData[Math.floor(Math.random() * this.gameData.length)];
      this.actualGameItem = randomItem;
    }
    const visual = new GameVisualBox(
      this.actualGameItem,
      this.getVisualBox(),
      this.getState
    );
    this.setQuestion = visual.setQuestion;
    this.setQuestion();
    const gallows = new Gallows(this.gamer, this.leftDiv, this.getState);
    gallows.init();
    this.hangThePlayer = gallows.hangThePlayer;
    this.gallowsBox = gallows.getGallowsBox();
  };

  getState = () => {
    return this;
  };
}

class HangmanApp extends HangmanState {
  constructor() {
    super();
    this.container = document.createElement('section');
    this.appBox = document.createElement('div');
    this.headerDiv = document.createElement('div');
    this.mainDiv = document.createElement('div');
    this.leftDiv = document.createElement('div');
    this.rightDiv = document.createElement('div');
    this.keyboardBox = document.createElement('div');
    this.visualBox = document.createElement('div');
    this.footerDiv = document.createElement('div');
  }

  setAppGrid = () => {
    this.container.className = 'container';
    this.appBox.className = 'app';
    this.headerDiv.className = 'header';
    this.mainDiv.className = 'main';
    this.leftDiv.className = 'left';
    this.rightDiv.className = 'right';
    this.footerDiv.className = 'footer';
    this.keyboardBox.className = 'keyboard';
    this.visualBox.className = 'visual';
    this.mainDiv.appendChild(this.leftDiv);
    this.mainDiv.appendChild(this.rightDiv);
    this.rightDiv.appendChild(this.visualBox);
    this.rightDiv.appendChild(this.keyboardBox);
    this.appBox.appendChild(this.headerDiv);
    this.appBox.appendChild(this.mainDiv);
    this.appBox.appendChild(this.footerDiv);
    this.container.insertAdjacentElement('afterbegin', this.appBox);
    document.body.insertAdjacentElement('afterbegin', this.container);
  };

  populatekeyboardBox(child) {
    this.keyboardBox.appendChild(child);
  }

  getVisualBox() {
    return this.visualBox;
  }

  getLeftDiv() {
    return this.leftDiv;
  }
}

async function initApp() {
  const app = new HangmanApp();
  const keysData = await loadData('src/data/keys.json');
  const gameData = await loadData('src/data/game.json');
  app.setKeysData(keysData);
  app.setAppGrid();
  if (app.keysData) {
    const keyrows = Object.values(app.keysData);
    keyrows.forEach((row, index) => {
      const initRow = new KeyboardRow(row, index, app.keyClickHandler);
      app.populatekeyboardBox(initRow.getRow());
    });
  }
  app.setActualGameItem(gameData, app.getVisualBox());
}

initApp();
