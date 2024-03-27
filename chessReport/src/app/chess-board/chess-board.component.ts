import { Component, OnInit } from '@angular/core';
import { LoadPiecesService } from '../services/load-pieces.service';
import { Chess } from 'chess.js';
import { ChessComService } from '../services/chess-com.service';
import { ChessComGame, ChessComGames, Months } from '../types/chessComResponseI';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss']
})
export class ChessBoardComponent implements OnInit {

  startPosition: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  flipped: boolean = false;
  selectedOption: string = 'pgn';
  positions: string[] = [
    this.startPosition
  ];
  positionIndex: number = 0;
  chess: Chess = new Chess();
  whitePlayer: string = 'white (?)';
  blackPlayer: string = 'black (?)';

  currentPage: number = 0;
  totalPages: number = 0;
  archivedGames: string[] = [];

  constructor(
    private loadPiecesService: LoadPiecesService,
    private chessComService: ChessComService
  ){}

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
    this.generatePieces(this.positions[this.positionIndex]);
  }

  generateUI(): void {
    const inputOptions = document.getElementById('input-options') as HTMLDivElement;
    const selectedOption = document.getElementById('option') as HTMLSelectElement;

    this.selectedOption = selectedOption.value;

    if(this.selectedOption === 'pgn'){
      inputOptions.innerHTML = '';
      inputOptions.innerHTML = `<textarea id="pgnTextarea" rows="10" cols="40" style="resize: none;" placeholder="Enter PGN here"></textarea>`;
      inputOptions.innerHTML += `<button type="button" id="loadGame">Load game!</button>`;

      const loadGame = document.getElementById('loadGame') as HTMLButtonElement;
      const pgnTextarea = document.getElementById('pgnTextarea') as HTMLTextAreaElement;
      loadGame.addEventListener('click', () => this.loadGame(pgnTextarea.value));
    }else if(this.selectedOption === 'chess-com'){
      inputOptions.innerHTML = '';
      inputOptions.innerHTML = `<input type="text" id="chessComInput" placeholder="${this.selectedOption.replace('-', '.')} username"/>`;
      inputOptions.innerHTML += `<button type="button" id="fetchGames">Get games!</button>`;

      const fetchGames = document.getElementById('fetchGames') as HTMLButtonElement;
      const chessComInput = document.getElementById('chessComInput') as HTMLInputElement;
      fetchGames.addEventListener('click', () => this.fetchGames(chessComInput.value));
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

  async fetchGames(username: string): Promise<void> {
    await this.openModal([])
    await this.chessComService.fetchArchives(username).then((data) => {
      if(typeof data === 'string'){
        alert('User not found!');
      }else {
        if(data.archives !== undefined){
          const archivedGames = data.archives.reverse();
          this.openModal(data.archives); 
        }
      }
    });
  }

  async openModal(archivedGames: string[] = []): Promise<void> {
    const dialog = document.createElement('dialog') as HTMLDialogElement;
    dialog.id = 'dialog';
  
    const header = document.createElement('h2');
    header.textContent = 'Archived Games';
    dialog.appendChild(header);

    const closeButton = document.createElement('button') as HTMLButtonElement;
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', () => {
      if(document.getElementById('loadingDialog') as HTMLDialogElement !== null){
        document.getElementById('loadingDialog')?.remove();
      }
      dialog.close();
    });
    dialog.appendChild(closeButton);
  
    const content = document.createElement('div');

    if(archivedGames.length === 0){
      dialog.id = 'loadingDialog';
      const loading = document.createElement('h3');
      loading.id = 'loading'
      loading.textContent = 'Loading...';
      content.appendChild(loading);
      dialog.appendChild(content);
      document.body.appendChild(dialog);
      dialog.showModal();
      return;
    }

    const buttonPrevious = document.createElement('button');
    buttonPrevious.textContent = 'Previous';
    buttonPrevious.onclick = async () => {
      dialog.close();
      await this.previousPage();
    };
    content.appendChild(buttonPrevious);
  
    const buttonNext = document.createElement('button');
    buttonNext.textContent = 'Next';
    buttonNext.onclick = async () => {
      await this.nextPage();
      dialog.close();
    };
    content.appendChild(buttonNext);
  
    this.totalPages = archivedGames.length;
    let date: string[] = archivedGames[this.currentPage].split('/');
    let yearString = date[7];
    let monthString = this.getMonthName(date[8]);
    let headerDate = document.createElement('h3') as HTMLHeadingElement;
    headerDate.innerHTML = `${monthString} ${yearString}`;
    content.appendChild(headerDate);

    if(this.currentPage === 0) buttonNext.disabled = true;
    if(this.currentPage >= this.totalPages - 1) buttonPrevious.disabled = true;

    const divGames = document.createElement('div') as HTMLDivElement;
    const data = await this.chessComService.fetchGame(archivedGames[this.currentPage]);
    this.archivedGames = archivedGames;
    const fetchedGames: ChessComGame[] = data.games;

    fetchedGames.forEach((game: ChessComGame) => {
      const buttonGames = document.createElement('button');
      divGames.appendChild(buttonGames);
      buttonGames.textContent = `${game.white.username} vs ${game.black.username}`;
      buttonGames.onclick = () => {
        if(document.getElementById('loadingDialog') as HTMLDialogElement !== null){
          document.getElementById('loadingDialog')?.remove();
        }
        this.whitePlayer = `${game.white.username} (${game.white.rating}) - ${game.white.result}`;
        this.blackPlayer = `${game.black.username} (${game.black.rating}) - ${game.black.result}`;
        this.chess.loadPgn(game.pgn);
        this.positions = [game.initial_setup];
        this.chess.history({ verbose: true }).forEach((move) => {
          this.positions.push(move.after);
        });
        dialog.close();
      };
      content.appendChild(buttonGames);
    });

    content.appendChild(divGames);
    dialog.appendChild(content);

    document.body.appendChild(dialog);
    dialog.showModal();
  }
  

  getMonthName(value: string): string {
    const monthMapping: { [key: string]: Months } = {
      '01': Months.January,
      '02': Months.February,
      '03': Months.March,
      '04': Months.April,
      '05': Months.May,
      '06': Months.June,
      '07': Months.July,
      '08': Months.August,
      '09': Months.September,
      '10': Months.October,
      '11': Months.November,
      '12': Months.December
    };

    const monthNameMapping: { [key in Months]: string } = {
      [Months.January]: 'January',
      [Months.February]: 'February',
      [Months.March]: 'March',
      [Months.April]: 'April',
      [Months.May]: 'May',
      [Months.June]: 'June',
      [Months.July]: 'July',
      [Months.August]: 'August',
      [Months.September]: 'September',
      [Months.October]: 'October',
      [Months.November]: 'November',
      [Months.December]: 'December'
    };
  
    let month: Months = monthMapping[value as keyof typeof monthMapping];
    return monthNameMapping[month];
  }
  

  async nextPage(): Promise<void> {
    if (this.currentPage > 0) {
      this.currentPage--;
      await this.openModal(this.archivedGames);
    }
  }
  
  async previousPage(): Promise<void> {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      await this.openModal(this.archivedGames);
    }
  }
  

  //flickering na brzim moveovima
  async makeMove(direction: string): Promise<void> {
    const canvas = document.getElementById('chessboard') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(direction === 'end') this.positionIndex = this.positions.length - 1;
    if(direction === 'start') this.positionIndex = 0;
    if(direction === 'next') this.positionIndex++;
    if(direction === 'back') this.positionIndex--;
  
    if(this.positionIndex < 0) this.positionIndex = 0;
    if(this.positionIndex > this.positions.length - 1) this.positionIndex = this.positions.length - 1;
    this.generateBoard();
    await this.generatePieces(this.positions[this.positionIndex]);
  }
  
  
}
