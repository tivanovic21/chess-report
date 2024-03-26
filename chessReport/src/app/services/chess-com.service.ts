import { Injectable } from '@angular/core';
import { ChessComArchives, ChessComGames } from '../types/chessComResponseI';

@Injectable({
  providedIn: 'root'
})
export class ChessComService {

  playerUsername: string = '';
  chessComApi: string = `https://api.chess.com/pub/player/${this.playerUsername}/games/archives`;

  constructor() { }

  async fetchArchives(username: string): Promise<ChessComArchives | string>{
    this.playerUsername = username;
    this.chessComApi = `https://api.chess.com/pub/player/${this.playerUsername}/games/archives`;
    let response: Response = await fetch(this.chessComApi);
    if(response.ok) {
      let data: ChessComArchives = await response.json();
      return data;
    } else return 'User not found!';
  }

  async fetchGame(url: string): Promise<ChessComGames>{
    let response: Response = await fetch(url);
    let data: ChessComGames = await response.json();
    return data;
  }
}
