import express, { Request, Response, Router } from 'express';
import pgnParser from 'pgn-parser';
import { Chess } from 'chess.js';

const api = Router();

api.get('/', (req: Request, res: Response) => {
    res.send('Hello World from API!');
});

api.get('/parse', (req: Request, res: Response) => {
    const { pgn } = req.query || {};
    const pgnValue = pgn as string || '';
    let positions: any[] = [];
    let headers: any[] = [];
  
    if (pgnValue === '') {
      return res.status(404).send('No PGN provided.');
    }
  
    try {
      const [parsed] = pgnParser.parse(pgnValue);
      let board = new Chess();
      headers.push(parsed.headers);
      positions.push({ fen: board.fen() });
  
      for (let move of parsed.moves) {
        let moveSan = (move as any).move;
  
        let virtualBoard;
        try {
          virtualBoard = board.move(moveSan);
        } catch (err) {
          return res.status(400).json({ message: 'PGN contains invalid moves.' });
        }
  
        let moveUCI = virtualBoard.from + virtualBoard.to;
        positions.push({
          fen: board.fen(),
          move: {
            san: moveSan,
            uci: moveUCI,
          },
        });
      }
    } catch (err) {
      return res.status(400).send('Unable to parse PGN.');
    }
  
    return res.status(200).json({headers: headers, positions: positions });
});

api.get('/analyse', (req: Request, res: Response) => {
    const { positions } = req.body;
    let analysis: any[] = [];
  
    if (!positions) {
      return res.status(404).send('No positions provided.');
    }
  
    for (let position of positions) {
      let board = new Chess(position.fen);
      let legalMoves = board.moves();
      let bestMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      let evaluation = Math.floor(Math.random() * 100) / 100;
  
      analysis.push({
        fen: position.fen,
        legalMoves: legalMoves,
        bestMove: bestMove,
        evaluation: evaluation,
      });
    }
  
    return res.status(200).json({ analysis: analysis });
});
  
  

export default api;