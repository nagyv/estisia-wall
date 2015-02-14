/*global describe, it */
'use strict';
var should = require('should');
var _ = require('lodash');
var estisiaWall = require('../');

var mongoose = require('mongoose');
//var mockgoose = require('mockgoose');  // some tests fail because of mockgoose
//mockgoose(mongoose);

should(5).be.exactly(5);  // to avoid jshint error

describe('estisia-wall node module', function () {
  it('provides a createWall method', function () {
    estisiaWall.should.have.property('createWall');
  });
  it('provides joinWall method', function(){
    estisiaWall.should.have.property('joinWall');
  });
  it('provides leaveWall method', function(){
    estisiaWall.should.have.property('leaveWall');
  });
  it('provides getWall method', function(){
    estisiaWall.should.have.property('getWall');
  });
  it('provides dropWall method', function(){
    estisiaWall.should.have.property('dropWall');
  });

  describe('createWall', function(){
    it('creates a new Wall', function(done){
      var ownerId = mongoose.Types.ObjectId();
      estisiaWall.createWall(
        'My wall',
        ownerId,
        function(err, wall){
          should.not.exist(err);
          should.exist(wall);
          wall.title.should.equal('My wall');
          wall.participants[0].object.should.equal(ownerId);
          wall.participants[0].role.should.equal('admin');
          done();
        });
    });
    it('works with several participants too', function(done){
      var ownerId = mongoose.Types.ObjectId();
      var memberId = mongoose.Types.ObjectId();
      estisiaWall.createWall(
        'My wall',
        ownerId,
        [{object: memberId, role:'member'}],
        function(err, wall){
          should.not.exist(err);
          should.exist(wall);
          wall.title.should.equal('My wall');
          wall.participants[0].object.should.equal(memberId);
          wall.participants[0].role.should.equal('member');
          wall.participants[1].object.should.equal(ownerId);
          wall.participants[1].role.should.equal('admin');
          done();
        });
    });
  });

  describe('dropWall', function() {
    var wallId;
    beforeEach(function (done) {
      estisiaWall.createWall(
        'Title',
        mongoose.Types.ObjectId(),
        function (err, _wall) {
          wallId = _wall.id;
          done(err);
      });
    });
    it('drops the wall', function(done){
      estisiaWall.dropWall(wallId, function(err){
        should.not.exist(err);
        estisiaWall.getWall(wallId, function(err){
          should.exist(err);
          done();
        });
      });
    });
  });

  describe('joinWall', function(){
    var wallId;
    beforeEach(function (done) {
      estisiaWall.createWall(
        'Title',
        mongoose.Types.ObjectId(),
        function (err, _wall) {
          wallId = _wall.id;
          done(err);
      });
    });
    afterEach(function (done) {
      estisiaWall.dropWall(wallId, done);
    });

    it('adds user to Wall with given role', function(done){
      estisiaWall.joinWall(wallId, mongoose.Types.ObjectId(), 'editor', function(err, wall){
        should.not.exist(err);
        wall.participants.should.have.length(2);
        wall.participants[1].role.should.equal('editor');
        done();
      });
    });
  });

  describe('leaveWall', function(){
    var wallId, memberId, ownerId2, ownerId;
    beforeEach(function (done) {
      ownerId = mongoose.Types.ObjectId();
      ownerId2 = mongoose.Types.ObjectId();
      memberId = mongoose.Types.ObjectId();
      estisiaWall.createWall(
        'My wall',
        ownerId,
        [
          {object: memberId, role:'member'},
          {object: ownerId2, role:'admin'}
        ],
        function(err, _wall){
          wallId = _wall.id;
          done(err);
        });
    });
    afterEach(function (done) {
      estisiaWall.dropWall(wallId, done);
    });

    it('removes the user', function(done){
      estisiaWall.leaveWall(wallId, memberId, function(err, wall){
        should.not.exist(err);
        _.map(wall.participants, function(p){
          return p.object.should.not.equal(memberId);
        });
        wall.participants.should.have.length(2);
        done();
      });
    });
    it('removes admin', function(done){
      estisiaWall.leaveWall(wallId, ownerId, function(err, wall){
        should.not.exist(err);
        _.map(wall.participants, function(p){
          return p.object.should.not.equal(ownerId);
        });
        wall.participants.should.have.length(2);
        done();
      });
    });
    it('can not remove last admin', function(done){
      estisiaWall.leaveWall(wallId, ownerId, function(err, wall){
        should.not.exist(err);
        estisiaWall.leaveWall(wall, ownerId2, function(err){
          should.exist(err);
          done();
        });
      });
    });

  });

  describe('getWall', function(){
    var wallId;
    beforeEach(function (done) {
      estisiaWall.createWall(
        'Title',
        mongoose.Types.ObjectId(),
        function (err, _wall) {
          wallId = _wall.id;
          done(err);
      });
    });
    afterEach(function (done) {
      estisiaWall.dropWall(wallId, done);
    });

    it('returns the Wall instance', function(done){
      estisiaWall.getWall(wallId, function(err, _wall){
        should.not.exist(err);
        wallId.should.equal(_wall.id);
        done();
      });
    });
    it('throws error if wall not exist', function(done){
      estisiaWall.getWall(mongoose.Types.ObjectId(), function(err){
        should.exist(err);
        done();
      });
    });
  });
});
