const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Function to read data from the orders.json
function readOrdersFromFile(callback) {
    fs.readFile('../data/orders.json', 'utf8', (err, data) => {
        if (err) {
            return callback(err, null);
        }
        try {
            const orders = JSON.parse(data);
            callback(null, orders);
        } catch (parseError) {
            callback(parseError, null);
        }
    });
}

// Function to write data to the orders.json
function writeOrdersToFile(orders, callback) {
    fs.writeFile('../data/orders.json', JSON.stringify(orders, null, 2), 'utf8', (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Add order endpoint
app.post('/orders', (req, res) => {
    const newOrder = req.body;

    readOrdersFromFile((readError, existingOrders) => {
        if (readError) {
            return res.status(500).json({ error: 'Error reading orders.json' });
        }

        // Assign order number
        newOrder.orderId = existingOrders.length + 1;
        existingOrders.push(newOrder);

        writeOrdersToFile(existingOrders, (writeError) => {
            if (writeError) {
                return res.status(500).json({ error: 'Error writing orders.json' });
            }

            res.status(201).json(newOrder);
        });
    });
});

// List all orders by customer with a given phoneNumber
app.get('/orders/:phoneNumber', (req, res) => {
    const phoneNumber = req.params.phoneNumber;

    readOrdersFromFile((readError, orders) => {
        if (readError) {
            return res.status(500).json({ error: 'Error reading orders.json' });
        }

        // Find order based on phoneNumber
        const ordersByPhone = orders.filter(order => order.phoneNumber === phoneNumber);

        res.json(ordersByPhone);
    });
});

// Update an order by order ID
app.put('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const updatedOrder = req.body;

    readOrdersFromFile((readError, orders) => {
        if (readError) {
            return res.status(500).json({ error: 'Error reading orders.json' });
        }

        // Get index of order with orderId
        const orderIndex = orders.findIndex(order => order.orderId == orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Replace order with updatedOrder
        orders[orderIndex] = updatedOrder;

        writeOrdersToFile(orders, (writeError) => {
            if (writeError) {
                return res.status(500).json({ error: 'Error writing orders.json' });
            }

            res.json(updatedOrder);
        });
    });
});

// Cancel an order by order ID
app.delete('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    readOrdersFromFile((readError, orders) => {
        if (readError) {
            return res.status(500).json({ error: 'Error reading orders.json' });
        }

        // Get index of order with orderId
        const orderIndex = orders.findIndex(order => order.orderId == orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Filter for orders without orderId
        orders = orders.filter(order => order.orderId != orderId);

        writeOrdersToFile(orders, (writeError) => {
            if (writeError) {
                return res.status(500).json({ error: 'Error writing orders.json' });
            }

            res.json({ message: 'Order canceled successfully' });
        });
    });
});

app.get('/health', (req, res) => {
   res.send('You keep using that word. I do not think it means what you think it means.');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;