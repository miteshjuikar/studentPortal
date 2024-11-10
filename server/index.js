const express = require('express');
const sequelize = require('./config/database');
const Student = require('./models/student');
const Mark = require('./models/mark');
const studentRouter = require("./routes/studentRoutes");
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',     
  allowedHeaders: ['Content-Type', 'Authorization'],
}
));

app.use(express.json());
app.use(express.raw({ type: 'application/json' })); 
app.use(express.urlencoded({extended: false}));

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

app.use('/api',studentRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
