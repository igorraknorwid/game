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
    this.svgGallows =
      '<svg width="353" height="581" viewBox="0 0 353 581" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="176.337" y="34.6662" width="39" height="199.598" transform="rotate(45 176.337 34.6662)" fill="black" stroke="#FFFEFE" stroke-width="3"/>' +
      '<rect x="34.5" y="1.5" width="39" height="578" rx="3.5" fill="black" stroke="#FFFEFE" stroke-width="3"/>' +
      '<rect x="351.5" y="34.5" width="39" height="350" rx="3.5" transform="rotate(90 351.5 34.5)" fill="black" stroke="#FFFEFE" stroke-width="3"/>' +
      '<rect x="298" y="75" width="10" height="74" fill="black"/>' +
      '</svg>';
    this.parts = {
      body: {
        svg:
          '<svg width="5" height="131" viewBox="0 0 5 131" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect width="5" height="131" fill="#909090"/>' +
          '</svg>',
        left: 300,
        top: 240,
      },

      head: {
        svg:
          '<svg width="101" height="101" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="50.5" cy="50.5" r="48" fill="white" stroke="#909090" stroke-width="5"/>' +
          '</svg>',
        left: 250,
        top: 140,
      },
      hang_one: {
        svg:
          '<svg width="68" height="81" viewBox="0 0 68 81" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="63.7964" width="5" height="100" transform="rotate(39.64 63.7964 0)" fill="#909090"/>' +
          '</svg>',
        left: 238,
        top: 240,
      },
      hang_two: {
        svg:
          '<svg width="68" height="81" viewBox="0 0 68 81" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect y="3.18951" width="5" height="100" transform="rotate(-39.6353 0 3.18951)" fill="#909090"/>' +
          '</svg>',
        left: 300,
        top: 240,
      },

      leg_one: {
        svg:
          '<svg width="68" height="81" viewBox="0 0 68 81" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect x="63.7964" width="5" height="100" transform="rotate(39.64 63.7964 0)" fill="#909090"/>' +
          '</svg>',
        left: 238,
        top: 365,
      },

      leg_two: {
        svg:
          '<svg width="68" height="81" viewBox="0 0 68 81" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect y="3.18951" width="5" height="100" transform="rotate(-39.6353 0 3.18951)" fill="#909090"/>' +
          '</svg>',
        left: 300,
        top: 365,
      },
    };
  }

  init() {
    this.gallowsBox = document.createElement('div');
    this.gallows = document.createElement('div');
    this.gallows.classList.add('gallows');
    this.gallows.innerHTML = this.svgGallows;
    this.gallowsBox.classList.add('gallows_box');
    this.manBox = document.createElement('div');
    this.manBox.classList.add('man');
    this.gallowsBox.appendChild(this.gallows);
    this.gallowsBox.appendChild(this.manBox);
    this.place.appendChild(this.gallowsBox);
  }

  hangThePlayer = () => {
    this.manBox.innerHTML = '';
    if (this.gamerMistakes.length < 7) {
      this.gamerMistakes.forEach((_, index) => {
        const part = document.createElement('div');
        part.classList.add('part');
        if (index === this.gamerMistakes.length - 1) {
          part.classList.add('last');
        }
        part.innerHTML = this.parts[this.gamer[index]].svg;
        part.style.position = 'absolute';
        part.style.left = `${this.parts[this.gamer[index]].left}px`;
        part.style.top = `${this.parts[this.gamer[index]].top}px`;
        this.manBox.appendChild(part);
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
    this.gamer = ['head', 'body', 'hang_one', 'hang_two', 'leg_one', 'leg_two'];
    this.keysData = null;
    this.actualGameItem = null;
    this.actualChar = null;
    this.charStore = [];
    this.charErrorStore = [];
  }

  setPlayedGames = (value) => {
    this.playedGames.push(value);
  };

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
      setTimeout(modal.open_modal, 2000);
      // modal.open_modal();
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
    this.setPlayedGames(this.actualGameItem.id);
  }

  setNewGame = () => {
    this.visualBox.innerHTML = '';
    this.gallowsBox.remove();
    this.actualChar = null;
    this.actualGameItem = null;
    this.charStore.length = 0;
    this.charErrorStore.length = 0;
    const filteredData = this.playedGames.reduce((acc, item) => {
      return acc.filter((value) => value.id !== item);
    }, this.gameData);
    if (filteredData && filteredData.length > 0) {
      const randomItem =
        filteredData[Math.floor(Math.random() * filteredData.length)];
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
    this.setPlayedGames(this.actualGameItem.id);
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
  this.keysData = keysData;
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
  document.addEventListener('keydown', (event) => {
    const code = event.keyCode;
    const charArr = Object.values(this.keysData).flat();
    const findChar = charArr.find((item) => item.code === String(code));
    if (findChar) {
      app.keyClickHandler(findChar);
    }
  });
  app.setActualGameItem(gameData, app.getVisualBox());
}

initApp();
