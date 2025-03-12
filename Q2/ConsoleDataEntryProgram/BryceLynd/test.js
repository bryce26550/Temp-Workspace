const readline = require('readline-sync');

var orders = [];

function mainMenu() {
    let result = readline.question("Would you like to, 1). Start a new order, 2). Edit an existing order, or 3). View all orders? ");

    if (result === "1") {
        newOrder();
    } else if (result === "2") {
        editOrder();
    } else if (result === "3") {
        viewOrders();
    } else {
        console.log("That is not an option.");
        mainMenu();
    }
}

function newOrder() {
    let name = readline.question("What is the name for the order? ");
    let address = readline.question("What is the (FAKE!!!) address for the order? ");
    let order = {
        name: name,
        address: address,
        items: [],
        subtotal: 0,
        salesTax: 0,
        shipping: 0,
        total: 0
    };
    orders.push(order);
    mainMenu();
}

function editOrder() {
    if (orders.length === 0) {
        console.log("No orders to edit.");
        mainMenu();
        return;
    }

    console.log("Existing orders:");
    orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.name}`);
    });

    let orderNumber = parseInt(readline.question("Enter the number of the order you want to edit: ")) - 1;
    if (orderNumber < 0 || orderNumber >= orders.length) {
        console.log("Invalid order number.");
        editOrder();
        return;
    }

    let order = orders[orderNumber];
    let editing = true;
    while (editing) {
        let action = readline.question("Would you like to, 1). Add an item, or 2). Finish editing? ");
        if (action === "1") {
            let itemName = readline.question("What item would you like to add to your order? ");
            let quantity = parseInt(readline.question("What is the quantity of that item? "));
            let price = parseFloat(readline.question("What is the price of that item? "));
            let item = {
                name: itemName,
                quantity: quantity,
                price: price
            };
            order.items.push(item);
        } else if (action === "2") {
            calculateTotals(order);
            editing = false;
        } else {
            console.log("That is not an option.");
        }
    }
    mainMenu();
}

function calculateTotals(order) {
    order.subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    order.salesTax = order.subtotal * 0.06;
    order.shipping = order.subtotal < 50 ? 5 : 0;
    order.total = order.subtotal + order.salesTax + order.shipping;
}

function viewOrders() {
    if (orders.length === 0) {
        console.log("No orders to show.");
    } else {
        orders.forEach(order => {
            console.log(`Order for ${order.name}, Address: ${order.address}`);
            order.items.forEach(item => {
                console.log(`- ${item.name}, Quantity: ${item.quantity}, Unit Price: $${item.price.toFixed(2)}`);
            });
            console.log(`Subtotal: $${order.subtotal.toFixed(2)}`);
            console.log(`Sales Tax: $${order.salesTax.toFixed(2)}`);
            console.log(`Shipping: $${order.shipping.toFixed(2)}`);
            console.log(`Total: $${order.total.toFixed(2)}`);
            console.log('-----------------------------------');
        });
    }
    mainMenu();
}

mainMenu();