import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import models, { sequelize } from './models';
const app = express();


//Test
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("./routes/books-routes")(app);
require("./routes/reviews-routes")(app);
require("./routes/requests-routes")(app);
require("./routes/email-routes")(app);
app.get('/', (req, res) =>{
  res.send('Running');
});

sequelize.sync({alter: true}).then(() => {
  app.listen(process.env.PORT, '0.0.0.0',() =>
    console.log(`listening on port ${process.env.PORT}!`),
  );
});
