const readline = require('readline-sync');

var orders = {};

let result = readline.question("Would you like to, 1).Start a new order(New), 2).Edit an  existing order(Edit), or 3).view all orders(View)? ");

if (result === "New" || "new" || "1") {
    newOrder()

} else if (result === "Edit" || "edit" || "2") {
    editOrder()
} else if (result === "View" || "view" || "3") {
    viewOrders()
} else {
    console.log("That is not an option.");

}

function newOrder() {
    let name = readline.question("What is the name for the order? ")
    orders.appernd(name)
    let address = readline.question("What is the (FAKE!!!) address for the order ")
    let items = readline.question("What item would you like to add your order? ")
    let price = readline.question("What is the price of that item? ")
    let Continue = readline.question("Would you like to add another item to your list?(Yes, or No) ")
    let condition = true
    while (condition = true) {
        if (Continue = "Yes" || "yes") {
            items = readline.question("What item would you like to add your order? ")
            price = readline.question("What is the price of that item? ")
            Continue = readline.question("Would you like to add another item to your list?(Yes, or No) ")
        } else if (Continue = "No" || "no") {
            condition = false
        } else {"that is not an option."}
    }
}

function editOrder() {

}

function viewOrders() {

}