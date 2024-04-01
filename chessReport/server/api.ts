import { Request, Response, Router } from 'express';
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
  
        let checkingBoard;
        try {
            checkingBoard = board.move(moveSan);
        } catch (err) {
          return res.status(400).json({ message: 'PGN contains invalid moves.' });
        }
  
        let moveUCI = checkingBoard.from + checkingBoard.to;
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

export default api;