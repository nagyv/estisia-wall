/*global describe, it */
'use strict';
var should = require('should');
var mongoose = require('mongoose');
//var mockgoose = require('mockgoose');  // some tests fail because of mockgoose
//mockgoose(mongoose);
mongoose.connect("mongodb://localhost/test");

should(5).be.exactly(5);  // to avoid jshint error

require('../lib/models');
var Wall = mongoose.model('Wall');

describe('The Wall model', function () {
  it('can be saved with basic data', function (done) {
    var wall = new Wall({
      title: 'Title',
      participants: [
        {
          'object': mongoose.Types.ObjectId(),
          'role': 'admin'
        },
        {
          'object': mongoose.Types.ObjectId(),
          'role': 'editor'
        },
        {
          'object': mongoose.Types.ObjectId(),
          'role': 'member'
        }
      ]
    });
    wall.validate(function (err) {
      should.not.exist(err);
      done();
    });
  });
  it('requires title', function (done) {
    var wall = new Wall({
      participants: [
        {
          'object': mongoose.Types.ObjectId(),
          'role': 'admin'
        },
        {
          'object': mongoose.Types.ObjectId(),
          'role': 'editor'
        },
        {
          'object': mongoose.Types.ObjectId(),
          'role': 'member'
        }
      ]
    });
    wall.validate(function (err) {
      should.exist(err);
      err.errors.should.have.property('title');
      err.errors.title.kind.should.equal('required');
      done();
    });
  });
  it('restricts participant roles', function (done) {
    var wall = new Wall({
      title: 'Title',
      participants: [
        {
          'object': mongoose.Types.ObjectId(),
          'role': 'invalid'
        }
      ]
    });
    wall.validate(function (err) {
      should.exist(err);
      err.errors.should.have.property('participants.0.role');
      err.errors['participants.0.role'].kind.should.equal('enum');
      done();
    });
  });
});

describe("A wall's Messages", function () {
  var wall, editorId, memberId;
  beforeEach(function (done) {
    editorId = mongoose.Types.ObjectId();
    memberId = mongoose.Types.ObjectId();
    Wall.create({
      title: 'Title',
      participants: [
        {
          'object': mongoose.Types.ObjectId(),
          'role': 'admin'
        },
        {
          'object': editorId,
          'role': 'editor'
        },
        {
          'object': memberId,
          'role': 'member'
        }
      ]
    }, function (err, _wall) {
      wall = _wall;
      done(err);
    });
  });
  afterEach(function (done) {
    Wall.remove({}, done);
  });

  it('can be added to a Wall', function (done) {
    wall.addMessage({
      title: 'My message',
      author: editorId,
      message: 'Lorem ipsum'
    }, function (err, message) {
        should.not.exist(err);
        should.exist(message);
        wall.messages.should.have.length(1);
        should.equal(message._id, wall.messages[0]._id);
        done();
    });
  });
  it('unknown is not allowed to add Message', function(done){
    wall.addMessage({
      title: 'My message',
      author: mongoose.Types.ObjectId(),
      message: 'Lorem ipsum'
    }, function (err) {
        should.exist(err);
        done();
    });
  });
  it('members are not allowed to add Messages', function(done){
    wall.addMessage({
      title: 'My message',
      author: memberId,
      message: 'Lorem ipsum'
    }, function (err) {
        should.exist(err);
        done();
    });
  });
  it('requires an author', function (done) {
    wall.addMessage({
      title: 'My message',
      message: 'Lorem ipsum'
    }, function (err, message) {
      should.exist(err);
      should.not.exist(message);
      done();
    });
  });
  it('requires a message', function (done) {
    wall.addMessage({
      title: 'My message',
      author: editorId
    }, function (err, message) {
      should.exist(err);
      should.not.exist(message);
      err.errors.should.have.property('messages.0.message');
      err.errors['messages.0.message'].kind.should.equal('required');
      done();
    });
  });
  it('can be read', function (done) {
    wall.addMessage({
      title: 'My message',
      author: editorId,
      message: 'Lorem ipsum'
    }, function (err, message) {
      should.not.exist(err);
      should.exist(message);
      wall.read({
        message: [0],
        reader: mongoose.Types.ObjectId()
      }, function (err, wall) {
        should.not.exist(err);
        should.exist(wall);
        wall.messages[0].readBy.should.have.length(1);
        done();
      });
    });
  });

  describe('replies', function () {
    beforeEach(function (done) {
      wall.addMessage({
        title: 'My message',
        author: editorId,
        message: 'Lorem ipsum'
      }, done);
    });
    afterEach(function(done){
      wall.messages = [];
      wall.save(done);
    });

    it('can be added', function (done) {
      wall.replyTo({
        replyTo: 0,
        message: 'My reply',
        author: editorId,
      }, function (err, wall) {
        should.not.exist(err);
        should.exist(wall);
        wall.messages[0].replies.should.have.length(1);
        done();
      });
    });
    it('replies can be read', function (done) {
      wall.read({
          message: 0,
          reader: mongoose.Types.ObjectId()
      }, function (err, wall) {
        should.not.exist(err);
        should.exist(wall);
        wall.messages[0].readBy.should.have.length(1);
        done();
      });
    });
  });
});
