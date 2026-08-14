const express = require('express');
const path = require('path');

const indexroutes = require('./routes/index');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", indexroutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});