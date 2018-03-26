/* eslint no-var: 0 */
/* eslint vars-on-top: 0 */
/* eslint prefer-const: 0 */
/* eslint arrow-parens: 0 */
/* eslint consistent-return: 0 */

// +(engine) add terminal conditions handler;
// (engine) add start game routine - if the user have chosed 0, then comp should start;
// (engine) add start game shortcuts - no need to run after first user move (to long);
// (engine) start engine in async to UI;
// +(engine) check whether anti-diag analysis actially works;
// (UI) add flag - which turn is now;
// (UI) add symbol choice dialog;
// (UI) add game ending message;
// (UI - minor) remove event handler on already clicked cell;

// minimax(board, player  ) recursive;
// ev(board, player) - evaluation function - value of a position for the player;
// winning(board) - returns boolean and player dependent on the position;
// mapToInt(board, player) - convert player position to 0&1 representation;
// getMoveNumber(board) - return number of the moves done;

/*
The board is an array with available states: '0', 'X' and undefined;
The game logic is:
  - render the board;
  - render the turn choice;
  - chooseMove() on the next turn move;
  - makeMove() to get the new board;
  - render the changes on the board;
  - analyze whether we have terminal conditions:
    - YES - stop the game; show the message;
    - NO - keep playing;
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
    this.chooseMove = this.chooseMove.bind(this);
    this.boardToOut = this.boardToOut.bind(this);
    this.logDepth = this.logDepth.bind(this);
    this.randomRange = this.randomRange.bind(this);
  },

  minimax(board, move, player, depth) {
    depth = depth || 0;
    var [terminal, utility] = this.utility(board, move, player);
    if (terminal) {
      this.logDepth(depth, 'utility', utility);
      return utility;
    }
    var newBoard = this.makeMove(board, move, player);
    if (this.player(newBoard) === this.MAX) {
      this.logDepth(++depth, 'turn', this.MAX);
      return Math.max.apply(
        null,
        this.actions(newBoard).map(nextMove => {
          this.logDepth(depth, 'move', nextMove);
          return this.minimax(newBoard, nextMove, this.MAX, depth);
        }),
      );
    }
    if (this.player(newBoard) === this.MIN) {
      this.logDepth(++depth, 'turn', this.MIN);
      return Math.min.apply(
        null,
        this.actions(newBoard).map(nextMove => {
          this.logDepth(depth, 'move', nextMove);
          return this.minimax(newBoard, nextMove, this.MIN, depth);
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
        if (newBoard[z + this.boardDimension * z] === player) {
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
        if (
          newBoard[(this.boardDimension - z) * (this.boardDimension - 1)] ===
          player
        ) {
          playerInDiag += 1;
        }
      }
      if (playerInDiag === this.boardDimension && player === this.MAX)
        return [true, 1];
      else if (playerInDiag === this.boardDimension && player === this.MIN)
        return [true, -1];
    }

    if (!this.actions(newBoard)) return [true, 0];

    return [undefined, undefined];
  },

  player(board) {
    var movesDone = board.reduce((res, elm) => (elm ? res + 1 : res), 0);
    return movesDone % 2 === 0 ? 'X' : '0';
  },

  actions(board) {
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

  chooseMove(board) {
    var nextMove;
    // if computer starts, then put 'X' either to center or to any corner;
    if (this.actions(board) === this.board.length) {
      var firstMoveArr = [];
      firstMoveArr.push(0);
      firstMoveArr.push(this.boardDimension - 1);
      firstMoveArr.push(this.board.length - this.boardDimension - 1);
      firstMoveArr.push(this.board.length - 1);
      if (this.boardDimension % 2 !== 0) {
        firstMoveArr.push(this.board.length - 1 / 2);
      }
      nextMove = this.randomRange(firstMoveArr);
    } else {
      // if game is in the middle, then enumerate available moves and
      // call minimax for each, to find the best;
      var availableMoves = this.actions(board).map(move => {
        var utility = this.minimax(board, move, this.MAX);
        return [move, utility];
      });
      console.log(availableMoves);
      // if more than one move available at max utility, choose any of them.
      var maxUtility = Math.max.apply(null, availableMoves.map(elm => elm[1]));
      console.log(maxUtility);
      // if more than one move available at max utility, choose any of them.
      availableMoves = availableMoves.filter(elm => elm[1] === maxUtility);
      console.log(availableMoves);
      nextMove = this.randomRange(availableMoves)[0];
    }
    return nextMove;
  },

  moveAndGetUtil(...args) {
    this.board = this.makeMove(...args);
    this.drawBoard(this.board);
    return this.utility(...args);
  },

  randomRange(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  logDepth(depth, ...args) {
    console.log(
      `${depth}${new Array(depth * 2).fill('-').join('')}${args[0]}: ${
        args[1]
      }`,
    );
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
    this.drawBoard = this.drawBoard.bind(this);
    this.addElm = this.addElm.bind(this);
    this.handleBoardClick = this.handleBoardClick.bind(this);
    this.frmSymbolChoice = document.querySelector('#frmSymbolChoice');
    this.frmSymbolChoice.addEventListener('submit', this.symbolChoiceHandler);
    this.boardElm = document.querySelector('#boardElm');
    this.initializeBoard();
    this.drawBoard(this.board);
  },

  symbolChoiceHandler(e) {
    console.log('clicked');
    e.preventDefault();
    e.stopPropagation();
    var data = new FormData(this.frmSymbolChoice);
    data.forEach(elm => {
      console.log(elm);
      this.MIN = elm;
      this.MAX = this.MIN === 'X' ? '0' : 'X';
    });
  },
  initializeBoard() {
    document.documentElement.style.setProperty(
      '--boardDimension',
      this.boardDimension,
    );
  },

  drawBoard(board) {
    var boardHTML = board
      .map(elm => {
        return `<div class="board__cell" id="boardCellElm">
                  <span>${elm || ''}</span>
                </div>`;
      })
      .join('');
    this.addElm(boardHTML, this.boardElm);
  },

  addElm(elm, host) {
    host.innerHTML = elm;
    var boardCells = document.querySelectorAll('#boardCellElm');
    boardCells.forEach((cell, ndx) =>
      cell.addEventListener('click', e => this.handleBoardClick(e, ndx)),
    );
  },

  handleBoardClick(e, move) {
    if (!this.board[move]) {
      var terminal = this.moveAndGetUtil(this.board, move, this.MIN);
      console.log(terminal);

      if (terminal[0]) console.log(`You win!`);
      else {
        var nextMove = this.chooseMove(this.board);
        terminal = this.moveAndGetUtil(this.board, nextMove, this.MAX);
        if (terminal[0]) console.log(`Computer wins!`);
      }
    }
  },
};

// let [gameEnded, winner] = winning(board);

Object.assign(App, UI, Engine);
App.init();
App.listen();
App.start();

/* 3x3 board
X 0 _
_ X _
_ _ 0

0 1 2
3 4 5
6 7 8

*/
App.board[0] = 'X';
App.board[1] = '0';
App.board[4] = 'X';
App.board[8] = '0';

// App.board[0] = '0';
// App.board[1] = 'X';
// App.board[3] = 'X';
// App.board[4] = 'X';
// App.board[5] = '0';
// App.board[6] = 'X';
// App.board[7] = '0';
App.drawBoard(App.board);

/*
// 4x4 board with a row and diag filled
0 1 2 3
4 5 6 7
8 9 0 1
2 3 4 5
App.boardDimension = 4;
App.board[0] = 'X';
App.board[3] = 'X';
App.board[5] = 'X';
App.board[7] = 'X';
App.board[10] = 'X';
App.board[11] = 'X';
App.board[12] = '0';
App.board[13] = '0';
App.board[14] = '0';

// 4x4 board with a row and diag filled
App.boardDimension = 4;
App.board[0] = 'X';
App.board[3] = '0';
App.board[4] = 'X';
App.board[6] = '0';
App.board[8] = 'X';
App.board[9] = '0';
App.board[13] = '0';
App.board[14] = '0';
App.board[15] = '0';
// 4x4
// X _ _ 0
// X _ 0 _
// X 0 _ _
// _ 0 0 0
//
*/
