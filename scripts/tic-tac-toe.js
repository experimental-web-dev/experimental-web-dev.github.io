const cells = document.querySelectorAll(".ttt");
const display = document.querySelector(".display");

var currentPlayer = 'X';
var gameover = false;
var moves = 0;

function clean(){
	for(const cell of cells){
		cell.innerHTML='';
	}
	gameover = false;
	moves = 0;
	updatePlayerTurn();
}

function register(){
	for(const cell of cells){
		cell.addEventListener('click', () =>{
			onClick(cell);
		});
	}
	document.addEventListener('keypress', (e) => {
		onKeyPress(e);
	});
}

function onKeyPress(event){
	if (event.key == 'r'){
		clean();
		console.log("Reseted by user.");
	}
}

function onClick(cell){
	if (gameover){
		clean();
	}else{
		if (cell.innerHTML == ''){
			cell.innerHTML = getPlayerChar();
			moves++;
			if (!verify()){
				changeTurn();
			}
		}
	}
}

function getPlayerChar(){
	return currentPlayer;
}

function changeTurn(){
	if(currentPlayer == 'X') currentPlayer = 'O';
	else currentPlayer = 'X';
	updatePlayerTurn();
}

function updatePlayerTurn(){
	display.innerHTML = 'Player ' + getPlayerChar() + ' turn.';
}

function verify(){
	//check lines
	for(let i = 0; i < 9; i = i + 3){
		if (cells[i].innerHTML != ''){
			if(cells[i].innerHTML == cells[i + 1].innerHTML && cells[i].innerHTML == cells[i + 2].innerHTML){
				victory();
				return true;
			}
		}
	}

	//check columns
	for(let i = 0; i < 3; i++){
		if (cells[i].innerHTML != ''){
			if(cells[i].innerHTML == cells[i + 3].innerHTML && cells[i].innerHTML == cells[i + 6].innerHTML){
				victory();
				return true;
			}
		}
	}

	//check diagonal
	if(cells[4].innerHTML != ''){
		if(cells[0].innerHTML == cells[4].innerHTML && cells[0].innerHTML == cells[8].innerHTML){
			victory();
			return true;
		}

		if(cells[2].innerHTML == cells[4].innerHTML && cells[2].innerHTML == cells[6].innerHTML){
			victory();
			return true;
		}
	}

	if (moves >= 9){
		draw();
		return true;
	}

	return false;
}

function victory(){
	display.innerHTML = 'Player ' + getPlayerChar() + ' won!';
	console.log('Player ' + getPlayerChar() + ' won!');
	gameover = true;
}

function draw(){
	display.innerHTML = "It's a draw!";
	console.log("It's a draw!");
	gameover = true;
}

function main(){
	register();
	clean();
}

(function(){
	main();
})();