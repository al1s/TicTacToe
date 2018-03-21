/* eslint no-var: 0 */
/* eslint vars-on-top: 0 */
/* eslint prefer-const: 0 */
/* eslint arrow-parens: 0 */

// minimax(board, player  ) recursive;
// ev(board, player) - evaluation function - value of a position for the player;
// winning(board) - returns boolean and player dependent on the position;
// mapToInt(board, player) - convert player position to 0&1 representation;
// getMoveNumber(board) - return number of the moves done;

/*
OXOXOXO.O - board coding;
winning masks:
[
0b100010001,
0b001010100,
0b100100100,
0b010010010,
0b001001001,
0b111000000,
0b000111000,
0b000000111]

[
0b1000010000100001,
0b0001001001001000,
0b1000100010001000,
0b0100010001000100,
0b0010001000100010,
0b0001000100010001,
0b1111000000000000,
0b0000111100000000,
0b0000000011110000,
0b0000000000001111]
*/

var App = {
  init() {
    this.boardDimension = 3;
    this.board = new Array(this.boardDimension * this.boardDimension).fill(
      undefined,
    );
    this.MAX = undefined; // computer player;
    this.MIN = undefined; // interactive player;
  },
};

var Engine = {
  start() {
    this.minimax = this.minimax.bind(this);
    this.utility = this.utility.bind(this);
    this.player = this.player.bind(this);
    this.actions = this.actions.bind(this);
    this.makeMove = this.makeMove.bind(this);
    this.result = this.result.bind(this);
    this.boardToOut = this.boardToOut.bind(this);
  },

  not(player) {
    return undefined;
  },

  minimax(board, move, player) {
    var [terminal, utility] = this.utility(board, move, player);
    if (terminal) {
      console.log(`terminal conditions: ${utility}`);
      return utility;
    }
    var newBoard = this.makeMove(board, move, player);
    if (this.player(newBoard) === this.MAX) {
      console.log(`next turn for ${this.MAX}`);
      return Math.max.apply(
        this.actions(newBoard).map(nextMove => {
          console.log(`next move: ${nextMove}`);
          return this.minimax(newBoard, nextMove, this.MAX);
        }),
      );
    }
    if (this.player(newBoard) === this.MIN) {
      console.log(`next turn for ${this.MIN}`);
      return Math.min.apply(
        this.actions(newBoard).map(nextMove => {
          console.log(`next move: ${nextMove}`);
          return this.minimax(newBoard, nextMove, this.MIN);
        }),
      );
    }
  },

  utility(board, move, player) {
    // terminal conditions are draw or win;
    // if diag or anti-diag or any row or col filled with same symbols - win;
    // if no more turns left - draw;

    var newBoard = this.makeMove(board, move, player);
    // console.log(this.boardToOut(newBoard));

    if (!this.actions(newBoard)) return [true, 0];
    var row = Math.ceil((move + 1) / this.boardDimension) - 1;
    var col = move % this.boardDimension;
    // analyze column where move takes place;
    var playerInColumn = 0;
    for (let y = 0; y < this.boardDimension; y++) {
      if (newBoard[y * this.boardDimension + col] === player) {
        playerInColumn += 1;
      }
    }
    if (playerInColumn === this.boardDimension && player === this.MAX)
      return [true, 1];
    else if (playerInColumn === this.boardDimension && player === this.MIN)
      return [true, -1];
    // analyze row where move takes place;
    var playerInRow = 0;
    for (let x = 0; x < this.boardDimension; x++) {
      if (newBoard[row * this.boardDimension + x] === player) {
        playerInRow += 1;
      }
    }
    if (playerInRow === this.boardDimension && player === this.MAX)
      return [true, 1];
    else if (playerInRow === this.boardDimension && player === this.MIN)
      return [true, -1];

    if (row === col) {
      // analyze diag where move takes place;
      var playerInDiag = 0;
      for (let z = 0; z < this.boardDimension; z++) {
        if (newBoard[z + this.boardDimension * z]) {
          playerInDiag += 1;
        }
      }
      if (playerInDiag === this.boardDimension && player === this.MAX)
        return [true, 1];
      else if (playerInDiag === this.boardDimension && player === this.MIN)
        return [true, -1];
    }

    if (row === this.boardDimension - col - 1) {
      var playerInDiag = 0;
      // analyze anti-diag where move takes place;
      for (let z = 0; z < this.boardDimension; z++) {
        if (newBoard[(this.boardDimension - z) * (this.boardDimension - 1)]) {
          playerInDiag += 1;
        }
      }
      if (playerInDiag === this.boardDimension && player === this.MAX)
        return [true, 1];
      else if (playerInDiag === this.boardDimension && player === this.MIN)
        return [true, -1];
    }
    return [undefined, undefined];
  },

  player(board) {
    var movesDone = board.reduce((res, elm) => (elm ? res + 1 : res), 0);
    return movesDone % 2 === 0 ? 'X' : '0';
  },

  actions(board, player) {
    var movesLeft = board.reduce((acc, elm, ndx) => {
      if (!elm) acc.push(ndx);
      return acc;
    }, []);
    return movesLeft.length > 0 ? movesLeft : undefined;
  },

  makeMove(board, move, player) {
    var newBoard = [...board];
    newBoard[move] = player;
    return newBoard;
  },

  boardToOut(board) {
    for (var i = 0; i < this.boardDimension; i++) {
      var toOut = board
        .slice(i * this.boardDimension, (i + 1) * this.boardDimension)
        .map(elm => (elm ? elm : '_'))
        .join(' ');
      console.log(toOut);
    }
  },
};

var UI = {
  listen() {
    this.drawBoard = this.drawBoard.bind(this);
    this.symbolChoiceHandler = this.symbolChoiceHandler.bind(this);
    this.userSymbolChoice = document.radioBtnX
      ? document.radioBtnX
      : document.radioBtn0;
    this.frmSymbolChoice = document.querySelector('#frmSymbolChoice');
    this.frmSymbolChoice.addEventListener('submit', this.symbolChoiceHandler);
  },

  symbolChoiceHandler(e) {
    console.log('clicked');
    e.preventDefault();
    e.stopPropagation();
    var data = new FormData(this.frmSymbolChoice);
    for (let elm of data) {
      console.log(`${elm[0]}: ${elm[1]}`);
      this.MIN = elm[1];
      this.MAX = this.MIN === 'X' ? '0' : 'X';
    }
  },

  drawBoard() {},
};
// let [gameEnded, winner] = winning(board);

var Application = Object.assign({}, UI, App, Engine);
Application.init();
Application.listen();
Application.start();

// 3x3 board
Application.board = [
  'X',
  '0',
  'X',
  undefined,
  '0',
  'X',
  undefined,
  undefined,
  undefined,
];
/*
// 4x4 board with a row and diag filled
Application.board = [
  'X',
  undefined,
  undefined,
  'X',
  undefined,
  'X',
  undefined,
  'X',
  undefined,
  undefined,
  'X',
  'X',
  '0',
  '0',
  '0',
  undefined,
];

// 4x4 board with a row and diag filled
Application.board = [
  'X',
  undefined,
  undefined,
  '0',
  'X',
  undefined,
  '0',
  undefined,
  'X',
  '0',
  undefined,
  undefined,
  undefined,
  '0',
  '0',
  '0',
];

Application.board = [
  'X',
  undefined,
  undefined,
  '0',
  'X',
  undefined,
  '0',
  undefined,
  undefined,
  '0',
  undefined,
  undefined,
  undefined,
  '0',
  '0',
  '0',
];
*/
