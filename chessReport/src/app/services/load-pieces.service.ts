import { Injectable } from '@angular/core';
import { promises } from 'nodemailer/lib/xoauth2';

@Injectable({
  providedIn: 'root'
})
export class LoadPiecesService {

  constructor() { }

  pieces: { [key: string]: string } = {
    "P": "white_pawn",
    "N": "white_knight",
    "B": "white_bishop",
    "R": "white_rook",
    "Q": "white_queen",
    "K": "white_king",
    "p": "black_pawn",
    "n": "black_knight",
    "b": "black_bishop",
    "r": "black_rook",
    "q": "black_queen",
    "k": "black_king"
  };

  async loadPieces(piece: string): Promise<HTMLImageElement> {
    piece = this.pieces[piece];
    return new Promise(resolve => {
      let image = new Image();
      image.src = `../../assets/pieces/${piece}.svg`;

      image.addEventListener("load", () => {
        resolve(image);
    });
    })
  }
}
