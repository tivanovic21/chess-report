import { Component, OnInit } from '@angular/core';
import { generate } from 'rxjs';
import { LoadPiecesService } from '../services/load-pieces.service';
import { Chess } from 'chess.js';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss']
})
export class ChessBoardComponent implements OnInit {

  startPosition: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  flipped: boolean = false;
  selectedOption: string = 'pgn';
  positions: string[] = [];
  positionIndex: number = 0;
  chess: Chess = new Chess();

  constructor(private loadPiecesService: LoadPiecesService){}

  ngOnInit(): void {
    this.generateUI();
    this.generateBoard();
    this.generatePieces(this.startPosition);
  }

  onOptionChange(event: Event): void {
    this.selectedOption = (event.target as HTMLSelectElement).value;
    this.generateUI();
  }

  flipBoard(): void {
    this.flipped = !this.flipped;
    this.generateBoard();
    this.generatePieces(this.startPosition);
  }

  generateUI(): void {
    const inputOptions = document.getElementById('input-options') as HTMLDivElement;
    const selectedOption = document.getElementById('option') as HTMLSelectElement;

    this.selectedOption = selectedOption.value;

    if(this.selectedOption === 'pgn'){
      inputOptions.innerHTML = '';
      inputOptions.innerHTML = `<textarea id="pgnTextarea" rows="10" cols="40" placeholder="Enter PGN here"></textarea>`;
      inputOptions.innerHTML += `<button type="button" id="loadGame">Load game!</button>`;

      const loadGame = document.getElementById('loadGame') as HTMLButtonElement;
      const pgnTextarea = document.getElementById('pgnTextarea') as HTMLTextAreaElement;
      loadGame.addEventListener('click', () => this.loadGame(pgnTextarea.value));
    }else if(this.selectedOption === 'chess-com'){
      inputOptions.innerHTML = '';
      inputOptions.innerHTML = `<input type="text" id="chessComInput" placeholder="${this.selectedOption.replace('-', '.')} username"/>`;
      inputOptions.innerHTML += `<button type="button" id="fetchGames">Get games!</button>`;
    }
  }

  generateBoard(): void {
    const canvas = document.getElementById('chessboard') as HTMLCanvasElement;  
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  
    let lightSquare = '#C4A484';
    let darkSquare = '#6c4a1f';
  
    ctx.strokeStyle = "black";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
    const squareSize = canvas.width / 8;
  
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillStyle = lightSquare;
        } else {
          ctx.fillStyle = darkSquare;
        }
        ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);
      }
    }
  
    ctx.fillStyle = "whitesmoke";
    const fontSize = Math.min(squareSize * 0.2, 15);
    ctx.font = `${fontSize}px Arial`;
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8'];
    if(!this.flipped){
      numbers.reverse();
      for (let i = 0; i < 8; i++) {
        ctx.fillText(letters[i], (i + 0.05) * squareSize, canvas.height - 5);
        ctx.fillText(numbers[i], canvas.width-10, (i + 0.1) * squareSize + 5);
      }
    } else{
      letters.reverse();
      for(let i=0; i<8; i++){
        ctx.fillText(letters[i], (i + 0.05) * squareSize, canvas.height - 5);
        ctx.fillText(numbers[i], canvas.width-10, (i + 0.1) * squareSize + 5);
      }
    }
  }

  async generatePieces(fen: string): Promise<void> {
    const canvas = document.getElementById('chessboard') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  
    const pieces = fen.split(' ')[0];
    const rows = pieces.split('/');
    const squareSize = canvas.width / 8;

    if(this.flipped) rows.reverse();
  
    for (let i = 0; i < 8; i++) {
      let col = 0;
      for (let j = 0; j < rows[i].length; j++) {
        if (isNaN(parseInt(rows[i][j]))) {
          let piece = rows[i][j];
          await this.loadPiecesService.loadPieces(piece).then((image: HTMLImageElement) => {
            ctx.drawImage(image, col * squareSize, i * squareSize, squareSize, squareSize);
          });
          col++;
        } else {
          col += parseInt(rows[i][j]);
        }
      }
    }
  }

  loadGame(pgn: string): void {
    try {
      this.chess.loadPgn(pgn);
      this.chess.history({verbose: true}).forEach((move) => {
        this.positions.push(move.after);
      });
    }catch(err){
      alert('Invalid PGN!');
    }
  }

  //flickering na svakom moveu!
  makeMove(direction: string): void {
    const canvas = document.getElementById('chessboard') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    if (direction === 'forward') {
      this.positionIndex++;
    } else if (direction === 'back') {
      this.positionIndex--;
    }
  
    this.generateBoard();
    this.generatePieces(this.positions[this.positionIndex]);
  }
  
  
}
