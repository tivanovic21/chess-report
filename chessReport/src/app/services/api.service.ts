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

  async analyseGame(positions: any[]) {
    return fetch(`${this.apiURL}/analyse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ positions })
    }).then(response => response.json())
  }
}
