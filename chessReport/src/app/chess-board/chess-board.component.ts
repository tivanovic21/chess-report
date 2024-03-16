import { Component, OnInit } from '@angular/core';

declare var Chessboard2: any;

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.scss'
})
export class ChessBoardComponent implements OnInit {

  board: any;

  ngOnInit(): void {
    this.board = Chessboard2('myBoard', 'start');
  }

  

}
