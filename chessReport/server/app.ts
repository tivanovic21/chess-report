import express, { Request, Response } from 'express';
import cors from 'cors';
import API from './api';

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.use('/api', API);

app.use((req: Request, res: Response) => {
    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
