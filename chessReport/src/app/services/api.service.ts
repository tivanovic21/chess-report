import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiURL: string = 'http://localhost:3000/api';

  constructor() { }

  async parsePGN(pgn: string) {
    return fetch(`${this.apiURL}/parse?pgn=${pgn}`)
      .then(response => response.json())
  }

  async getOnlineStockfish(selectedGame: any) {
    let fen = selectedGame.fen;
    return fetch(`https://lichess.org/api/cloud-eval?fen=${fen}`)
      .then(response => response.json())
  }
}
