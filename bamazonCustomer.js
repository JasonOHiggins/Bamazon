var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");
var userName;
// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "jason",
  password: "Chicag@1",
  database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  login();
});

function login() {
  inquirer.prompt([{
    message: "Enter your name",
    type: "input",
    name: "userName"
  }])
  .then(function(answer){
    userName = answer.userName;
    start();
  })
}

// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt({
      name: "postOrBid",
      type: "rawlist",
      message: "Would you like to [POST] an auction or [BID] on an auction or see where you are [WINNING]?",
      choices: ["POST", "BID", "WINNING"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.postOrBid.toUpperCase() === "POST") {
        postAuction();
      } else if (answer.postOrBid.toUpperCase() === "WINNING") {
        showWinning();
      }
      else {
        bidAuction();
      }
    });
}

function showWinning() {
  connection.query("SELECT item_name AS `Item`, category AS `Category`, starting_bid AS `Started at`, highest_bid AS `Current High Bid` FROM auctions WHERE ?",
  { highbidder: userName},
  function(error, result){
    if (error) throw error;
    console.table(result);
    start();
  });
}

// function to handle posting new items up for auction
function postAuction() {
  // prompt for info about the item being put up for auction
  inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "What is the item you would like to submit?"
      },
      {
        name: "category",
        type: "input",
        message: "What category would you like to place your auction in?"
      },
      {
        name: "startingBid",
        type: "input",
        message: "What would you like your starting bid to be?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        "INSERT INTO auctions SET ?",
        {
          item_name: answer.item,
          category: answer.category,
          starting_bid: answer.startingBid,
          highest_bid: answer.startingBid
        },
        function(err) {
          if (err) throw err;
          console.log("Your auction was created successfully!");
          // re-prompt the user for if they want to bid or post
          start();
        }
      );
    });
}

function bidAuction() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM auctions", function(err, auctionItems) {
    if (err) throw err;
    var choices = auctionItems.map(function(item){ 
      return `${item.item_name}: Current High Bid ${item.highest_bid} by ${item.highbidder}`;
    })
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: choices,
          message: "What auction would you like to place a bid in?"
        },
        {
          name: "bid",
          type: "input",
          message: "How much would you like to bid?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem = auctionItems.find(function(item){
          return item.item_name == answer.choice.split(":")[0];
        });
        // for (var i = 0; i < auctionItems.length; i++) {
        //   if (auctionItems[i].item_name === answer.choice) {
        //     chosenItem = auctionItems[i];
        //   }
        // }
        console.log(chosenItem);
        // determine if bid was high enough
        if (chosenItem.highest_bid < parseInt(answer.bid)) {
          // bid was high enough, so update db, let the user know, and start over
          connection.query(
            "UPDATE auctions SET ? WHERE ?",
            [
              {
                highest_bid: answer.bid,
                highbidder: userName
              },
              {
                id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Bid placed successfully!");
              start();
            }
          );
        }
        else {
          // bid wasn't high enough, so apologize and start over
          console.log("Your bid was too low. Try again...");
          start();
        }
      });
  });
}
