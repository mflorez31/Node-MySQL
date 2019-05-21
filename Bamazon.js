var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
 // port
  port: 3306,
  user: "root",
  password: "Mjflo123",
  database: "bamazon"
});

connection.connect(function(error) {
  if (error) {
    throw error;
  }else{
    console.log("connected as id " + connection.threadId + "\n");
  displayAll()};
});

function displayAll() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.table(res);
    AskForItem(res);
  });
}


function AskForItem(inventory) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "item",
        message: "ID of the product they would like to buy? \n (Press Q to Quit)",
        validate: function(val) {
          return !isNaN(val) || val.toLowerCase() === "q";
        }
      }
    ])
    .then(function(val) {
      userQuit(val.item);
      var itemId = parseInt(val.item);
      var product = checkInventory(itemId, inventory);
     if (product) {
        howMany(product);
      }
      else {
    console.log("\n That item is not in the inventory. \n");
    displayAll();
      }
    });
}

function checkInventory(itemId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
      if (inventory[i].item_id === itemId) {
        return inventory[i];
      }
    }
    return null;
  }

function howMany(product) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "quantity",
        message: "How many would you like? \n (Press Q to Quit)",
        validate: function(val) {
          return val > 0 || val.toLowerCase() === "q";
        }
      }
    ])
    .then(function(val) {
      userQuit(val.quantity);
      var quantity = parseInt(val.quantity);
      if (quantity > product.stock_quantity) {
        console.log("\nNot enough inventory!");
        displayAll();
      }
      else {
        purchase(product, quantity);
      }
    });
}

function purchase(product, quantity) {
  connection.query(
    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
    [quantity, product.item_id],
    function(err, res) {
      console.log("\nSuccessfully purchased " + quantity + " " + product.product_name);
      displayAll();
    }
  );
}


function userQuit(item) {
  if (item.toLowerCase() === "q") {
    console.log("Goodbye!");
    process.exit(0);
  }
}
