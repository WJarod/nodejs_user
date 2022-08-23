import assert from 'assert';
import app from './index.js';
import request from 'supertest';

var id = '';

describe('User feature', function() 
{
  describe('POST /user', function () {
    it('Create user', function (done) {
      // Use supertest to run assertions for our API
      request(app)
        .post('/user')
        .send({
          first_name: "test",
          last_name: "test",
          adress: "test",
          city: "test",
          tel: "test",
          profil_picture: "https://avatars.githubusercontent.com/u/85944519?v=4",
          email: "test@gmail.com",
          password: "test"
        })
        .expect((res) => {
          id = res.body._id;
        })
        .expect(201, done);
    });
  });
  
  describe('GET /all-users', function () {
    it('Get all users', function (done) {
      request(app)
        .get('/all-users')
        .expect(200, done);
    });
  });
  
  describe('GET /user/' + id, function () {
    it('Get user', function (done) {
      request(app)
        // Here, you should use the ids generated from the tasks you have in your db
        .get('/user/' + id)
        .expect(200, done);
    });
  });
  
  describe('PUT /user/:id' + id, function () {
    it('Updates user', function (done) {
      request(app)
        .put('/user/')
        .send({
          first_name: "updated",
          last_name: "test",
          adress: "test",
          city: "test",
          tel: "test",
          profil_picture: "https://avatars.githubusercontent.com/u/85944519?v=4",
          email: "test@gmail.com",
          password: "test"
        })
        .expect(201, done);
    });
  });
  
  describe('DELETE /user/:id' + id, function () {
    it('Deletes user', function (done) {
      request(app)
        .delete('/user/' + id)
        .expect(200, done);
    });
  });
})