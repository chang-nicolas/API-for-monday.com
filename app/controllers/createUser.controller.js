require("dotenv").config();
const User = require("../models/createUser.model.js");
const sql = require("../models/db");
const axios = require("axios");
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

var transporter = nodemailer.createTransport({
  service: process.env.MAIL_HOST,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

transporter.use('compile', hbs({
  viewEngine:{
    partialsDir:"template path",
    defaultLayout:""
},
viewPath: process.env.MAIL_PATH,
extName: process.env.MAIL_EXTENSION
}));


// Create and Save a new User in MYSQL
exports.create = async (req, res) => {

  let mondaySuccess = false, bodyInputs = false;
  
  // Validate request
  if (!req.body.email || !req.body.firstname || !req.body.lastname || !req.body.visitDate) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return exports.create
  }

  let itemId, email = req.body.email, fullName = req.body.firstname + " " + req.body.lastname, visitDate = req.body.visitdate;
  const mutationQuery = "mutation ($boardId:Int!, $itemName:String!, $columnValues:JSON!) { create_item(board_id:$boardId, item_name:$itemName, column_values:$columnValues) {id, column_values { title value id } }}"
  
  const ColumnValues = JSON.stringify({
    "status": { "label": "Follow up" },
    "email": {"email" : email,"text":email},
    "location": { "lat": "50.8476", "lng": "4.3572", "address": "Belgium, Brussels" },
    //"date": {"date" : `${new Date().toISOString().slice(0, 10)}`},
    "date": {"date" : visitDate},
    "text3": "",
    "text4": ""
  })

  const mutationData = JSON.stringify({
      query: mutationQuery,
      variables: JSON.stringify({
          boardId: 2000920342,
          itemName: fullName,
          columnValues: ColumnValues
      })
  })

  const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        "Authorization": process.env.MONDAY_TOKEN
    }
  }

  const insertData = async (mutationData) => {
    // Make request to Monday.com API
    try {
        const response = await axios.post(process.env.MONDAY_URL, mutationData, {
            headers: {
                ...getHeaders()
            }
        });
        // console.log(JSON.stringify(response.data));
        // console.log(response.data)
        itemId = response.data?.data?.create_item?.id;
        // console.log(itemId)
        mondaySuccess = true;
    }catch(err) {
        console.log(err)
        console.log(err.response)
    }
  } 

  await insertData(mutationData)

  if(mondaySuccess == true){
    var mailOptions = {
      from: 'nodemailer.auto@gmail.com',
      to: email,
      subject: 'JUP JUP REGISTERED',
      text: 'Hi! ' + fullName + " https://localhost:3000/api/"+crypto.createHash('sha1').update(itemId).digest('hex'),
      template: 'index',
      context: {
        fullname: fullName,
        message: process.env.MAIL_MESSAGE
      }
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    }

  // Create a User
  const user = new User({
    userId: crypto.createHash('sha1').update(itemId).digest('hex'),
    mondayId: itemId,
    status: 'Waiting'
  });

  // Save User in the database
  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the user."
      });
    else res.send(data);
  });
};

