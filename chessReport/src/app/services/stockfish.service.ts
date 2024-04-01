import { Injectable } from '@angular/core';
import { Stockfish } from '../types/stockfish';

@Injectable({
  providedIn: 'root'
})
export class StockfishService {

  constructor() { }

  userMoves: any[] = [];
  bestMoves: any[] = [];

  async evaluateGame(parsedPositions: any[], targetDepth: number) {
    let stockfish = new Stockfish();

    for(let i=0; i<parsedPositions.length; i++) {
      let position = parsedPositions[i];
      console.log("i: ", i);
      let fen = position.fen;
      if(position.move){
        let userMove = position.move.uci;
        this.userMoves.push(userMove);
      } else {
        this.userMoves.push('start');
      }


      let bestMove = await stockfish.getBestMove(fen, targetDepth);
      this.bestMoves.push(bestMove);
      continue;
      console.log('')
    }
    let result = { userMoves: this.userMoves, bestMoves: this.bestMoves };
    let accuracies = await this.calculateAccuracies(result);
    return result;
  }

  async calculateAccuracies(result: any) {
    let userMoves = result.userMoves;
    let bestMoves = result.bestMoves;

    this.calculateWinPercentage(bestMoves);
    this.calculateAccuracy(bestMoves);
  }

  calculateWinPercentage(bestMoves: any) {
    let winPercentage = 0;
    // Win% = 50 + 50 * (2 / (1 + exp(-0.00368208 * centipawns)) - 1)
  
    for(let i=0; i<bestMoves.length; i++) {
      console.log(`i: ${i}`);
      let centiPawnValueCurrent = Math.abs(bestMoves[i][0].evaluation.value);
      console.log("centiPawnValueCurrent: ", centiPawnValueCurrent);
      winPercentage = parseFloat((50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centiPawnValueCurrent)) - 1)).toFixed(2));
      bestMoves[i][0].winPercentage = winPercentage
    }
  
    return bestMoves;
  }  
  
  calculateAccuracy(bestMoves: any){
    // Accuracy% = 103.1668 * exp(-0.04354 * (winPercentBefore - winPercentAfter)) - 3.1669

    let accuracies = {
      accuracyWhite: 0,
      accuracyBlack: 0
    };

    let accuracyWhite = [];
    let accuracyBlack = [];

    for(let i=0; i<bestMoves.length; i++) {
      if(i%2 == 0){
        let winPercentBefore = parseFloat((bestMoves[i][0].winPercentage).toFixed(2));
        if(i+2 < bestMoves.length){
          let winPercentAfter = parseFloat((bestMoves[i+2][0].winPercentage).toFixed(2));
          let accuracy = parseFloat((103.1668 * Math.exp(-0.04354 * (winPercentBefore - winPercentAfter)) - 3.1669).toFixed(2));
          accuracyWhite.push(accuracy);
          console.log(`bestMoves[${i}][0] white: \n`);
          console.log(bestMoves[i][0]);
          console.log(`bestMoves[${i+2}][0] white: \n`);
          console.log(bestMoves[i+2][0]);
        }
      } else {
        let winPercentBefore = parseFloat((bestMoves[i][0].winPercentage).toFixed(2));
        if(i+2 < bestMoves.length){
          let winPercentAfter = parseFloat((bestMoves[i+2][0].winPercentage).toFixed(2));
          let accuracy = parseFloat((103.1668 * Math.exp(-0.04354 * (winPercentBefore - winPercentAfter)) - 3.1669).toFixed(2));
          accuracyBlack.push(accuracy);
          console.log(`bestMoves[${i}][0] black: \n`);
          console.log(bestMoves[i][0]);
          console.log(`bestMoves[${i+2}][0] black: \n`);
          console.log(bestMoves[i+2][0]);
        }
      }
    }

    let averageAccWhite = accuracyWhite.reduce((a, b) => a + b, 0) / accuracyWhite.length;
    let averageAccBlack = accuracyBlack.reduce((a, b) => a + b, 0) / accuracyBlack.length;

    accuracies.accuracyWhite = averageAccWhite;
    accuracies.accuracyBlack = averageAccBlack;

    console.log("accuracies: ", accuracies);

    return bestMoves;
  }

}
