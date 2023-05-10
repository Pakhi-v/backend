const path = require('path');
const env = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cors = require('cors');
const methodOverride = require('method-override');
const qrcode = require('qrcode');

const sql = require('./database/mysql');

env.config();
const app = express();

app.use(cors());
app.use(methodOverride('_method'));

const db = sql.connect();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(
  session({
    secret: process.env.SESSION_SECRET='secret',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const homeRoutes = require('./routes/home');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.post('/staff/student-report/scan',(req,res)=>{
  const input_text = req.body.text;
  console.log(input_text);
  qrcode.toDataURL(input_text,(err,src) =>{
    res.render("scan", {
        qr_code: src
    });
})
});

app.post('/student/markAttendance', (req, res)=>{
  const { lecture, time, erno } = req.body;
  console.log(lecture, time, erno);
  db.query('INSERT INTO `bt02` VALUES (?,?,?)',[lecture, time, erno], function (error, results, fields) {
    if (error){
      res.status(400).end();
      throw error
    } else {
      res.status(200).end();
    }
    // console.log('The solution is: ', results[0].solution);
  });
})
app.use('/admin', adminRoutes);
app.use('/staff', staffRoutes);
app.use('/', homeRoutes);

// Home Page
app.use(homeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started @ ${PORT}`);
});
