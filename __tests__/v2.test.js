'use strict';

const supergoose = require('@code-fellows/supergoose');
const server = require('../src/server');
const request = supergoose(server.server);
const bcrypt = require('bcrypt');
process.env.SECRET = 'haha';
require('dotenv').config();


let users = {
  admin: { username: 'admin', password: 'password', role: 'admin' },
  editor: { username: 'editor', password: 'password', role: 'editor' },
  user: { username: 'user', password: 'password', role: 'user' },
};

describe('admin', () => {
  let token;
  let id;

  test('sign up', async () => {
    const response = await request.post('/signup').send({ username: 'admin', password: 'password', role: 'admin' });
    expect(response.status).toBe(201);
    token = response.body.token;

  })
  test('sign in', async () => {
    const response = await request.post('/signin').auth('admin', 'password');
    expect(response.status).toBe(200);
    token = response.body.token;
  })

  test('post method', async () => {
    const response = await request.post('/api/v2/food').send({
      name: "tomato",
      calories: 1500,
      type: "fruit"
    }).set({ "Authorization": `Bearer ${token}` });
    expect(response.status).toBe(201);
    expect(response.body.name).toBeDefined();
    expect(response.body.name).toBe("tomato");
    expect(response.body.type).toEqual("FRUIT");
    id = response.body._id;
  })
  test('get with no id', async () => {
    const response = await request.get('/api/v2/food').set({ "Authorization": `Bearer ${token}` });
    expect(response.status).toBe(200);
    expect(response.body[0].name).toBeDefined();
    expect(response.body[0].name).toBe("tomato");
    expect(response.body[0].type).toEqual("FRUIT");
  })
  test('get with id', async () => {
    const response = await request.get(`/api/v2/food/${id}`).set({ "Authorization": `Bearer ${token}` });
    expect(response.status).toBe(200);
    expect(response.body.name).toBeDefined();
    expect(response.body.name).toBe("tomato");
    expect(response.body.type).toEqual("FRUIT");
    expect(response.body._id).toEqual(id);
  })
  test('put', async () => {
    const response = await request.put(`/api/v2/food/${id}`).send({
      name: "updated",
      calories: 1500,
      type: "vegetable"
    }).set({ "Authorization": `Bearer ${token}` });
    expect(response.status).toBe(200);
    expect(response.body.name).toBeDefined();
    expect(response.body.name).toBe("updated");
    expect(response.body.type).toEqual("VEGETABLE");
    expect(response.body._id).toEqual(id);
  })
  test('delete method', async () => {
    const response = await request.delete(`/api/v2/food/${id}`).set({ "Authorization": `Bearer ${token}` });
    expect(response.status).toBe(200);
    expect(response.body).toBe("");
    const response1 = await request.get(`/api/v2/food/${id}`).set({ "Authorization": `Bearer ${token}` });
    expect(response1.status).toBe(200);
    expect(response1.body).toBe(null);
  })
})