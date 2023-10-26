const request = require('supertest');
const app = require('../app');

test('Should return 200 status', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
});

test('Test response text', async () => {
    const response = await request(app).get('/health');
    expect(response.text).toBe('You keep using that word. I do not think it means what you think it means.');
})

describe('Test endpoints', () => {
    const testOrder = {
        "phoneNumber": "9999999999",
        "product": "test"
      };
    var id;

    it('test add order', async () => {
        const response = await request(app)
            .post('/orders')
            .send(testOrder);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(expect.objectContaining(testOrder));
        id = response.body.orderId;
    });

    
    it('test get order', async () => {
    const phoneNumber = testOrder.phoneNumber;

    const response = await request(app).get(`/orders/${phoneNumber}`);

    expect(response.statusCode).toBe(200);
    });

    it('test update order', async () => {
        const updatedOrder = {
            "phoneNumber": "8888888888",
            "product": "test updated",
            "orderId": 555555
          };
    
        const response = await request(app).put(`/orders/${id}`).send(updatedOrder);
    
        expect(response.statusCode).toBe(200);
        expect(response.body.product).toBe("test updated");
        expect(response.body.phoneNumber).toBe("8888888888");
    });

    it ('test delete order', async () => {
        const response = await request(app).delete(`/orders/${555555}`);
        expect(response.statusCode).toBe(200);
    });
});
