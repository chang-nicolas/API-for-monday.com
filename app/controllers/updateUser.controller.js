const multiparty = require("multiparty");
const fs = require("fs");
const formidable = require("formidable");

const User = require("../models/updateUser.model.js");
const createfilePayload = require("./file");
const sql = require("../models/db");
const axios = require("axios");
require("dotenv").config();

// Create and Save a new User
exports.create = async (req, res) => {
  // const form = new multiparty.Form();

  // Gets data from the form-data
  // Gets uploaded image
  const form = new formidable.IncomingForm();

  await form.parse(req, async (err, fields, files) => {
    const oldpath = files.filetoupload.filepath;
    const newpath = __dirname + files.filetoupload.originalFilename;
    fs.copyFile(oldpath, newpath, function (err) {
      if (err) throw err;
    });
    const userId = await fields.userId.toString();
    const cardNumber = await fields.cardNumber.toString();

    let itemId = 0;

    const fileUrl = "https://api.monday.com/v2/file";

    const changeColumnQuery =
      "mutation ($boardId:Int!, $itemId: Int!, $columnId: String!, $columnValue: String!) {change_simple_column_value (board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $columnValue) {id}}";
    const fileQuery =
      'mutation ($file: File!, $itemId: Int!) { add_file_to_column (file: $file, item_id: $itemId, column_id: "files") { id } }';
    const mutationQuery =
      "mutation ($boardId:Int!, $itemName:String!, $columnValues:JSON!) { create_item(board_id:$boardId, item_name:$itemName, column_values:$columnValues) {id, column_values { title value id } }}";
    const moveItemToGroupMutation =
      "mutation ($itemId: Int!, $groupId: String!) { move_item_to_group (item_id: $itemId, group_id: $groupId) { id }}";

    const getHeaders = () => {
      return {
        "Content-Type": "application/json",
        Authorization: process.env.MONDAY_TOKEN,
      };
    };

    async function getItem() {
      return new Promise(function (resolve, reject) {
        sql.query(
          "SELECT mondayId FROM users where userId = ?",
          [userId],
          (err, res) => {
            itemId = Number(res[0].mondayId);
            resolve(itemId);
          }
        );
      });
    }
    await getItem();

    const mutationDataMoveItem = JSON.stringify({
      query: moveItemToGroupMutation,
      variables: JSON.stringify({
        itemId: itemId,
        groupId: "new_group", // -> To Processing
      }),
    });

    const mutationData = JSON.stringify({
      query: mutationQuery,
      variables: JSON.stringify({
        boardId: 2000920342,
      }),
    });
    console.log(itemId + " : CARD NUMBER");
    const updateCRM = async () => {
      try {
        const mutationData = JSON.stringify({
          query: changeColumnQuery,
          variables: JSON.stringify({
            boardId: 2000920342,
            itemId: itemId,
            columnId: "text3", //CARD Number
            columnValue: cardNumber,
          }),
        });
        const response = await axios.post(
          "https://api.monday.com/v2/",
          mutationData,
          {
            headers: {
              ...getHeaders(),
            },
          }
        );
        //console.log("Added data", response.data)
        if (itemId) {
          // console.log("FILE QUERY", fileQuery);
          const variables = { itemId: parseInt(itemId) };
          const { payload, boundary } = await createfilePayload(
            fileQuery,
            variables,
            newpath
          );
          //CRM IMPORT FILE
          try {
            const fileResponse = await axios.post(fileUrl, payload, {
              headers: {
                "Content-Type": "multipart/form-data; boundary=" + boundary,
                Authorization: process.env.MONDAY_TOKEN,
              },
            });
          } catch (err) {
            console.log(err);
            console.log(err.response);
          }

          //CRM _ CHANGE ROW
          try {
            const columndResponse = await axios.post(
              "https://api.monday.com/v2/",
              mutationDataMoveItem,
              {
                headers: {
                  ...getHeaders(),
                },
              }
            );
            console.log(JSON.stringify(response.data));
          } catch (err) {
            console.log(err);
            console.log(err.response);
          }
          //console.log("file", fileResponse.data)
        }
      } catch (err) {
        console.log(err);
        console.log(err.response?.data);
      }
    };

    updateCRM();

    console.log("ITEM ID : " + itemId);

    // Validate request
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
    }

    // Create a User
    const user = new User({
      userId: userId,
      mondayId: itemId,
      status: "completed",
    });

    // Save User in the database
    User.create(user, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the user.",
        });
      else res.send(data);
    });
  });
};

// Retrieve all User from the database (with condition).
exports.findAll = (req, res) => {
  const status = req.query.status;

  User.getAll(status, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    else res.send(data);
  });
};

// Find a single User by Id
exports.findOne = (req, res) => {
  User.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving User with id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

// find all published Users
exports.findAllPublished = (req, res) => {
  Users.getAllPublished((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    else res.send(data);
  });
};
