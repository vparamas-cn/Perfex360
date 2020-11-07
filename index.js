const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql2');
const fileUpload = require('express-fileupload');
const cors = require('cors');
var path = require('path');
require('dotenv').config()
app.use(fileUpload({
  createParentPath: true
}));

app.use('/', express.static('uploads'))

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var jwt = require('jsonwebtoken'); 
var config = require('./config');
var verifyToken = require('./verifyToken');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  port:3306,
  password: 'vinoas123',
  database: 'db_perfex',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/section',verifyToken,(req, res) => {
  try{
    let sql = "SELECT * FROM section_tbl";
     pool.query(sql, (err, results) => {
      res.send(JSON.stringify({"status": results?200:400, "error": null, "response": results}));
    });
  }
  catch(e){
    res.status(500).send(e);
  }
});

app.get('/api/area',verifyToken,(req, res) => {
  try{
    let sql = "SELECT * FROM area_tbl";
     pool.query(sql, (err, results) => {
      res.send(JSON.stringify({"status": results?200:400, "error": null, "response": results}));
    });
  }
  catch(e){
    res.status(500).send(e);
  }
});

app.get('/api/observation',verifyToken,(req, res) => {
  try{
    let sql = "SELECT * FROM observation_tbl AS a INNER JOIN observation_file_tbl AS b ON a.observation_id = b.observation_id";
     pool.query(sql, (err, results) => {
      res.send(JSON.stringify({"status": results?200:400, "error": null, "response": results}));
    });
  }
  catch(e){
    res.status(500).send(e);
  }
});

app.post('/api/user',(req, res) => {
  try{
    let sql = "SELECT * FROM user_tbl WHERE user_name=\""+req.body.username+"\" AND user_password=\""+req.body.password+"\"";
     pool.query(sql, (err, results) => {
      var token = jwt.sign({ id: results[0].user_id }, config.secret, {
        expiresIn: "30d" // expires in 30 days
      });
      results[0].token = token;
      res.send(JSON.stringify({"status": results?200:400, "error": null, "response": results}));
    });
  }
  catch(e){
    res.status(500).send(e);
  }
});


app.post('/api/createobservation',(req, res) => {
  try{
    let data,sql;
    if(req.body.observation_id)
    {
       data = [{area_id: req.body.area_id, section_id: req.body.section_id,observation_date:req.body.observation_date,employee_name:req.body.employee_name,observation:req.body.observation,remarks:req.body.remarks,user_id:req.body.user_id}, req.body.observation_id];
       sql = "UPDATE observation_tbl SET ? WHERE observation_id = ?";
    }
    else{
       data = {area_id: req.body.area_id, section_id: req.body.section_id,observation_date:req.body.observation_date,employee_name:req.body.employee_name,observation:req.body.observation,remarks:req.body.remarks,user_id:req.body.user_id};
       sql = "INSERT INTO observation_tbl SET ?";
    }
     pool.query(sql, data,(err, results) => {
      res.send(JSON.stringify({"status": results?200:400, "error": null, "response": results?results.insertId:results}));
    });
  }
  catch(e){
    res.status(500).send(e);
  }
});

app.post('/api/updateobservation',(req, res) => {
  try{
    let data = [{area_id: req.body.area_id, section_id: req.body.section_id,observation_date:req.body.observation_date,employee_name:req.body.employee_name,observation:req.body.observation,remarks:req.body.remarks,user_id:req.body.user_id}, req.body.observation_id];
    let sql = "UPDATE observation_tbl SET ? WHERE observation_id = ?";
     pool.query(sql, data,(err, results) => {
      res.send(JSON.stringify({"status": results?200:400, "error": null, "response": results?results.insertId:results}));
    });
  }
  catch(e){
    res.status(500).send(e);
  }
});

app.post('/api/fileupload', async (req, res) => {
  try {

      if(!req.files) {
          res.send(JSON.stringify({
              status: false,
              message: 'No file uploaded'
          }));
      } else {
          let avatar = req.files.file;
          var extension = path.extname(avatar.name);
          var file_name = new Date().getTime() + extension;
          let file_url = './uploads/' +file_name

         avatar.mv(file_url);
         let data,sql;
         if(req.body.observation_file_tbl)
         {
           data = [{observation_id: req.body.observation_id, photo_url: file_name,description:req.body.description}, req.body.observation_file_tbl];
           sql = "UPDATE observation_file_tbl SET ? WHERE observation_file_tbl = ?";
          
         }
         else{
           data = {observation_id: req.body.observation_id, photo_url: file_name,description:req.body.description};
           sql = "INSERT INTO observation_file_tbl SET ?";
         }
          pool.query(sql, data,(err, results) => {
            res.send(JSON.stringify({"status": results?200:400, "error": null, "response": results}));
          });
         
      }
  } catch (err) {
      res.status(500).send(err);
  }
});
app.listen(3080,() =>{
  console.log('Server started on port 3080...');
});
