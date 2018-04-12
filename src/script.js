/* eslint no-var: 0 */
/* eslint vars-on-top: 0 */
/* eslint prefer-const: 0 */
/* eslint arrow-parens: 0 */
/* eslint consistent-return: 0 */

// +(engine) add terminal conditions handler;
// +(engine) add start game routine - if the user have chosen 0, then comp should start;
// +(engine) add start game shortcuts - no need to run after first user move (to long);
// +(engine) start engine in async to UI;
// +(engine) check whether anti-diag analysis actially works;
// +(engine) fix halting when player starts from the center;
// (UI) add flag - which turn is now;
// +(UI) add symbol choice dialog;
// (UI) add game ending message;
// +(UI) stop the game after terminal condition is reached;
// +(UI - minor) remove event handler on already clicked cell;
// +(UI) when the game is finished, wait and start it again;

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
    this.MAX = '0'; // computer player;
    this.MIN = 'X'; // interactive player;
    this.restartPauseDuration = 2; // in seconds;
    this.moveAndGetUtil = this.moveAndGetUtil.bind(this);
    this.turnInformer = this.turnInformer.bind(this);
    this.randomRange = this.randomRange.bind(this);
    this.boardToOut = this.boardToOut.bind(this);
  },

  moveAndGetUtil(...args) {
    this.board = this.makeMove(...args);
    this.drawCell(args[1], args[2]);
    return this.utility(...args);
  },

  computerMove() {
    this.turnInformer(this.board);
    this.chooseMove(this.board)
      .then(nextMove => this.moveAndGetUtil(this.board, nextMove, this.MAX))
      .then(terminal => {
        if (terminal[0]) this.handleTerminalConditions(terminal[1]);
        else this.turnInformer(this.board);
      });
  },

  handleTerminalConditions(condition) {
    log.debug(`handleTerminalConditions got condition: ${condition}`);
    var msg = '';
    if (condition === -1) {
      msg = 'You win!';
      this.showMessage(msg);
    } else if (condition === 1) {
      msg = 'Computer wins!';
      this.showMessage(msg);
    } else if (condition === 0) {
      msg = 'Draw!';
      this.showMessage(msg);
    }
    this.stopListenElms(this.boardElm);
    window.setTimeout(() => {
      this.clearMessage();
      this.resetBoard();
    }, this.restartPauseDuration * 1000);
  },

  resetBoard() {
    log.debug('resetBoard started');
    this.board = new Array(this.boardDimension * this.boardDimension).fill(
      undefined,
    );
    this.drawBoard(this.board);
    // this.changeActiveStyle(this.MIN);
    if (this.MAX === 'X') this.computerMove();
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

  turnInformer(board) {
    var whoseTurn = this.player(board);
    if (whoseTurn === this.MAX) {
      log.info('Computer turn');
      // this.changeActiveStyle(this.MAX);
    } else {
      log.info('Player turn');
      // this.changeActiveStyle(this.MIN);
    }
  },

  randomRange(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
};

var Engine = {
  start() {
    this.minimax = this.minimax.bind(this);
    this.utility = this.utility.bind(this);
    this.player = this.player.bind(this);
    this.actions = this.actions.bind(this);
    this.makeMove = this.makeMove.bind(this);
    this.getBestDebutMoves = this.getBestDebutMoves.bind(this);
    this.chooseMove = this.chooseMove.bind(this);
    this.logDepth = this.logDepth.bind(this);
    this.debug = 0;
    this.logLine = 1;
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
    // log.debug(this.boardToOut(newBoard));

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

  getBestDebutMoves(availableMoves) {
    var nextMoveArr = [];
    nextMoveArr.push(0);
    nextMoveArr.push(this.boardDimension - 1);
    nextMoveArr.push(this.board.length - this.boardDimension);
    nextMoveArr.push(this.board.length - 1);
    if (this.boardDimension % 2 !== 0) {
      nextMoveArr.push((this.board.length - 1) / 2);
    }
    log.debug(`All available debut moves: ${JSON.stringify(nextMoveArr)}`);
    nextMoveArr = nextMoveArr.filter(elm => availableMoves.includes(elm));
    return this.randomRange(nextMoveArr);
  },

  chooseMove(board) {
    return new Promise(resolve => {
      var nextMove;
      var availableMoves = this.actions(this.board);
      // if computer starts, then put 'X' either to center or to any corner;
      if (availableMoves.length === this.board.length) {
        nextMove = this.getBestDebutMoves(availableMoves);
      } else if (availableMoves.length === this.board.length - 1) {
        // if a player starts, then put 'X' to center if available or to any corner;
        log.debug(`We are on the second move routine, choosing for next move`);

        nextMove = this.getBestDebutMoves(availableMoves);
        log.debug(`Preliminary chosen move: ${nextMove}`);

        if (this.boardDimension % 2 !== 0) {
          var suggestedMove = (this.board.length - 1) / 2;
          log.debug(`Available moves are: ${JSON.stringify(availableMoves)}`);
          if (availableMoves.includes(suggestedMove)) nextMove = suggestedMove;
        }
      } else {
        // if game is in the middle, then enumerate available moves and
        // call minimax for each, to find the best;
        availableMoves = this.actions(board).map(move => {
          var utility = this.minimax(board, move, this.MAX);
          return [move, utility];
        });
        log.debug(`Available moves: ${JSON.stringify(availableMoves)}`);
        // if more than one move available at max utility, choose any of them.
        var maxUtility = Math.max.apply(
          null,
          availableMoves.map(elm => elm[1]),
        );
        log.debug(`Max utility: ${maxUtility}`);
        // if more than one move available at max utility, choose any of them.
        availableMoves = availableMoves.filter(elm => elm[1] === maxUtility);
        log.debug(
          `Available moves after max filter: ${JSON.stringify(availableMoves)}`,
        );
        nextMove = this.randomRange(availableMoves)[0];
      }
      resolve(nextMove);
    });
  },

  logDepth(depth, ...args) {
    if (this.debug === 9) {
      console.log(
        `${this.logLine++}. ${depth}${new Array(depth * 2).fill('-').join('')}${
          args[0]
        }: ${args[1]}`,
      );
    }
  },
};

var UI = {
  listen() {
    log.debug(`UI listen called`);
    this.drawBoard = this.drawBoard.bind(this);
    this.drawCell = this.drawCell.bind(this);
    this.symbolChoiceHandler = this.symbolChoiceHandler.bind(this);
    this.addElm = this.addElm.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.changeActiveStyle = this.changeActiveStyle.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.clearMessage = this.clearMessage.bind(this);
    this.frmSymbolChoice = document.querySelector('#frmSymbolChoice');
    this.frmSymbolChoice.removeEventListener(
      'change',
      this.symbolChoiceHandler,
    );
    this.frmSymbolChoice.addEventListener('change', this.symbolChoiceHandler);
    this.boardElm = document.querySelector('#boardElm');
    this.boardCells = document.querySelectorAll('.board__cell');
    this.msgElm = document.querySelector('#msgElm');
    this.initializeBoard();
    this.drawBoard(this.board);
  },

  symbolChoiceHandler(e) {
    log.debug(e);
    // e.preventDefault();
    var data = new FormData(this.frmSymbolChoice);
    data.forEach(elm => {
      log.debug(`User's choise: ${elm}`);
      this.MIN = elm;
      this.MAX = this.MIN === 'X' ? '0' : 'X';
    });
    this.resetBoard();
  },

  initializeBoard() {
    document.documentElement.style.setProperty(
      '--boardDimension',
      this.boardDimension,
    );
  },

  drawBoard(board) {
    var boardHTML = board
      .map((elm, ndx) => {
        return `<div class="board__cell" id="boardCellElm_${ndx}">
                  <span>${elm || ''}</span>
                </div>`;
      })
      .join('');
    this.addElm(this.boardElm, boardHTML);
  },

  addElm(host, elm) {
    host.innerHTML = elm;
    host.childNodes.forEach(child =>
      child.addEventListener('click', this.handleClick),
    );
  },

  stopListenElms(host) {
    host.childNodes.forEach(child =>
      child.removeEventListener('click', this.handleClick),
    );
  },

  drawCell(cell, value) {
    var cellElm = document.querySelector(`#boardCellElm_${cell}`);
    cellElm.innerHTML = value;
  },

  handleClick(e) {
    e.currentTarget.removeEventListener(e.type, this.handleBoardClick);
    log.debug(`Player clicked ${e.currentTarget.id}`);
    var move = e.currentTarget.id.split('_')[1];

    if (!this.board[move]) {
      var terminal = this.moveAndGetUtil(this.board, move, this.MIN);
      log.debug(
        `Condition after move to ${move} is ${
          Boolean(terminal[0]) ? 'terminal' : 'non-terminal'
        }`,
      );

      if (terminal[0]) this.handleTerminalConditions(terminal[1]);
      else this.computerMove();
    }
  },

  changeActiveStyle(player) {
    document
      .querySelector(`#label${player === 'X' ? '0' : 'X'}`)
      .classList.remove('menu__element--active');
    document
      .querySelector(`#label${player}`)
      .classList.add('menu__element--active');
  },

  showMessage(msg) {
    log.info(msg);
    this.msgElm.innerHTML = msg;
    this.msgElm.classList.toggle('--hidden');
  },

  clearMessage() {
    this.msgElm.innerHTML = '';
    this.msgElm.classList.toggle('--hidden');
  },
};

log.setLevel('info');
Object.assign(App, UI, Engine);
App.init();
App.listen();
App.start();

/* 3x3 board
0 1 2
3 4 5
6 7 8
*/
App.drawBoard(App.board);

/* 4x4 board with a row and diag filled
0 1 2 3
4 5 6 7
8 9 0 1
2 3 4 5
*/
