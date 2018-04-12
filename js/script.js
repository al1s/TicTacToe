"use strict";var _slicedToArray=function(){return function(i,t){if(Array.isArray(i))return i;if(Symbol.iterator in Object(i))return function(i,t){var e=[],n=!0,o=!1,r=void 0;try{for(var s,a=i[Symbol.iterator]();!(n=(s=a.next()).done)&&(e.push(s.value),!t||e.length!==t);n=!0);}catch(i){o=!0,r=i}finally{try{!n&&a.return&&a.return()}finally{if(o)throw r}}return e}(i,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();function _toConsumableArray(i){if(Array.isArray(i)){for(var t=0,e=Array(i.length);t<i.length;t++)e[t]=i[t];return e}return Array.from(i)}var App={init:function(){this.boardDimension=3,this.board=new Array(this.boardDimension*this.boardDimension).fill(void 0),this.MAX="0",this.MIN="X",this.restartPauseDuration=2,this.moveAndGetUtil=this.moveAndGetUtil.bind(this),this.turnInformer=this.turnInformer.bind(this),this.randomRange=this.randomRange.bind(this),this.boardToOut=this.boardToOut.bind(this)},moveAndGetUtil:function(){return this.board=this.makeMove.apply(this,arguments),this.drawCell(arguments.length<=1?void 0:arguments[1],arguments.length<=2?void 0:arguments[2]),this.utility.apply(this,arguments)},computerMove:function(){var i=this;this.turnInformer(this.board),this.chooseMove(this.board).then(function(t){return i.moveAndGetUtil(i.board,t,i.MAX)}).then(function(t){t[0]?i.handleTerminalConditions(t[1]):i.turnInformer(i.board)})},handleTerminalConditions:function(i){var t=this;log.debug("handleTerminalConditions got condition: "+i);var e="";-1===i?(e="You win!",this.showMessage(e)):1===i?(e="Computer wins!",this.showMessage(e)):0===i&&(e="Draw!",this.showMessage(e)),this.stopListenElms(this.boardElm),window.setTimeout(function(){t.clearMessage(),t.resetBoard()},1e3*this.restartPauseDuration)},resetBoard:function(){log.debug("resetBoard started"),this.board=new Array(this.boardDimension*this.boardDimension).fill(void 0),this.drawBoard(this.board),"X"===this.MAX&&this.computerMove()},boardToOut:function(i){for(var t=0;t<this.boardDimension;t++){var e=i.slice(t*this.boardDimension,(t+1)*this.boardDimension).map(function(i){return i||"_"}).join(" ");console.log(e)}},turnInformer:function(i){this.player(i)===this.MAX?log.info("Computer turn"):log.info("Player turn")},randomRange:function(i){return i[Math.floor(Math.random()*i.length)]}},Engine={start:function(){this.minimax=this.minimax.bind(this),this.utility=this.utility.bind(this),this.player=this.player.bind(this),this.actions=this.actions.bind(this),this.makeMove=this.makeMove.bind(this),this.getBestDebutMoves=this.getBestDebutMoves.bind(this),this.chooseMove=this.chooseMove.bind(this),this.logDepth=this.logDepth.bind(this),this.debug=0,this.logLine=1},minimax:function(i,t,e,n){var o=this;n=n||0;var r=this.utility(i,t,e),s=_slicedToArray(r,2),a=s[0],h=s[1];if(a)return this.logDepth(n,"utility",h),h;var l=this.makeMove(i,t,e);return this.player(l)===this.MAX?(this.logDepth(++n,"turn",this.MAX),Math.max.apply(null,this.actions(l).map(function(i){return o.logDepth(n,"move",i),o.minimax(l,i,o.MAX,n)}))):this.player(l)===this.MIN?(this.logDepth(++n,"turn",this.MIN),Math.min.apply(null,this.actions(l).map(function(i){return o.logDepth(n,"move",i),o.minimax(l,i,o.MIN,n)}))):void 0},utility:function(i,t,e){for(var n=this.makeMove(i,t,e),o=Math.ceil((t+1)/this.boardDimension)-1,r=t%this.boardDimension,s=0,a=0;a<this.boardDimension;a++)n[a*this.boardDimension+r]===e&&(s+=1);if(s===this.boardDimension&&e===this.MAX)return[!0,1];if(s===this.boardDimension&&e===this.MIN)return[!0,-1];for(var h=0,l=0;l<this.boardDimension;l++)n[o*this.boardDimension+l]===e&&(h+=1);if(h===this.boardDimension&&e===this.MAX)return[!0,1];if(h===this.boardDimension&&e===this.MIN)return[!0,-1];if(o===r){for(var d=0,u=0;u<this.boardDimension;u++)n[u+this.boardDimension*u]===e&&(d+=1);if(d===this.boardDimension&&e===this.MAX)return[!0,1];if(d===this.boardDimension&&e===this.MIN)return[!0,-1]}if(o===this.boardDimension-r-1){d=0;for(var m=0;m<this.boardDimension;m++)n[(this.boardDimension-m)*(this.boardDimension-1)]===e&&(d+=1);if(d===this.boardDimension&&e===this.MAX)return[!0,1];if(d===this.boardDimension&&e===this.MIN)return[!0,-1]}return this.actions(n)?[void 0,void 0]:[!0,0]},player:function(i){return i.reduce(function(i,t){return t?i+1:i},0)%2==0?"X":"0"},actions:function(i){var t=i.reduce(function(i,t,e){return t||i.push(e),i},[]);return t.length>0?t:void 0},makeMove:function(i,t,e){var n=[].concat(_toConsumableArray(i));return n[t]=e,n},getBestDebutMoves:function(i){var t=[];return t.push(0),t.push(this.boardDimension-1),t.push(this.board.length-this.boardDimension),t.push(this.board.length-1),this.boardDimension%2!=0&&t.push((this.board.length-1)/2),log.debug("All available debut moves: "+JSON.stringify(t)),t=t.filter(function(t){return i.includes(t)}),this.randomRange(t)},chooseMove:function(i){var t=this;return new Promise(function(e){var n,o=t.actions(t.board);if(o.length===t.board.length)n=t.getBestDebutMoves(o);else if(o.length===t.board.length-1){if(log.debug("We are on the second move routine, choosing for next move"),n=t.getBestDebutMoves(o),log.debug("Preliminary chosen move: "+n),t.boardDimension%2!=0){var r=(t.board.length-1)/2;log.debug("Available moves are: "+JSON.stringify(o)),o.includes(r)&&(n=r)}}else{o=t.actions(i).map(function(e){return[e,t.minimax(i,e,t.MAX)]}),log.debug("Available moves: "+JSON.stringify(o));var s=Math.max.apply(null,o.map(function(i){return i[1]}));log.debug("Max utility: "+s),o=o.filter(function(i){return i[1]===s}),log.debug("Available moves after max filter: "+JSON.stringify(o)),n=t.randomRange(o)[0]}e(n)})},logDepth:function(i){9===this.debug&&console.log(this.logLine+++". "+i+new Array(2*i).fill("-").join("")+(arguments.length<=1?void 0:arguments[1])+": "+(arguments.length<=2?void 0:arguments[2]))}},UI={listen:function(){log.debug("UI listen called"),this.drawBoard=this.drawBoard.bind(this),this.drawCell=this.drawCell.bind(this),this.symbolChoiceHandler=this.symbolChoiceHandler.bind(this),this.addElm=this.addElm.bind(this),this.handleClick=this.handleClick.bind(this),this.changeActiveStyle=this.changeActiveStyle.bind(this),this.showMessage=this.showMessage.bind(this),this.clearMessage=this.clearMessage.bind(this),this.frmSymbolChoice=document.querySelector("#frmSymbolChoice"),this.frmSymbolChoice.removeEventListener("change",this.symbolChoiceHandler),this.frmSymbolChoice.addEventListener("change",this.symbolChoiceHandler),this.boardElm=document.querySelector("#boardElm"),this.boardCells=document.querySelectorAll(".board__cell"),this.msgElm=document.querySelector("#msgElm"),this.initializeBoard(),this.drawBoard(this.board)},symbolChoiceHandler:function(i){var t=this;log.debug(i),new FormData(this.frmSymbolChoice).forEach(function(i){log.debug("User's choise: "+i),t.MIN=i,t.MAX="X"===t.MIN?"0":"X"}),this.resetBoard()},initializeBoard:function(){document.documentElement.style.setProperty("--boardDimension",this.boardDimension)},drawBoard:function(i){var t=i.map(function(i,t){return'<div class="board__cell" id="boardCellElm_'+t+'">\n                  <span>'+(i||"")+"</span>\n                </div>"}).join("");this.addElm(this.boardElm,t)},addElm:function(i,t){var e=this;i.innerHTML=t,i.childNodes.forEach(function(i){return i.addEventListener("click",e.handleClick)})},stopListenElms:function(i){var t=this;i.childNodes.forEach(function(i){return i.removeEventListener("click",t.handleClick)})},drawCell:function(i,t){document.querySelector("#boardCellElm_"+i).innerHTML=t},handleClick:function(i){i.currentTarget.removeEventListener(i.type,this.handleBoardClick),log.debug("Player clicked "+i.currentTarget.id);var t=i.currentTarget.id.split("_")[1];if(!this.board[t]){var e=this.moveAndGetUtil(this.board,t,this.MIN);log.debug("Condition after move to "+t+" is "+(Boolean(e[0])?"terminal":"non-terminal")),e[0]?this.handleTerminalConditions(e[1]):this.computerMove()}},changeActiveStyle:function(i){document.querySelector("#label"+("X"===i?"0":"X")).classList.remove("menu__element--active"),document.querySelector("#label"+i).classList.add("menu__element--active")},showMessage:function(i){log.info(i),this.msgElm.innerHTML=i,this.msgElm.classList.toggle("--hidden")},clearMessage:function(){this.msgElm.innerHTML="",this.msgElm.classList.toggle("--hidden")}};log.setLevel("info"),Object.assign(App,UI,Engine),App.init(),App.listen(),App.start(),App.drawBoard(App.board);
//# sourceMappingURL=script.js.map
