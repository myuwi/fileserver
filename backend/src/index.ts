import * as express from 'express';
import * as chalk from 'chalk';
import * as cors from 'cors';

const app: express.Application = express();
const PORT = process.env.PORT || 3000;

import * as dotenv from 'dotenv';
dotenv.config();

app.disable('x-powered-by');
app.disable('etag');

app.use(cors());
app.use(express.json());

// import { createSchema, dropSchema } from './database/schema';
// dropSchema();
// createSchema();

import { router as apiRoute } from './routes/api';

app.use('/api', apiRoute);

app.use('*', (req, res) => {
    res.sendStatus(404);
});

app.listen(PORT, () => {
    console.log(chalk.cyan('Server running and listening on port ' + PORT));
});
