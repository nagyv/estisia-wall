'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
require('./models');
var Wall = mongoose.model('Wall');

function wrapToWall(func, wallId){
  if(arguments.length < 3) {
    throw Error('Missing arguments.');
  }

  var args = Array.prototype.slice.call(arguments).splice(1);  // drop func
  var cb = args[args.length-1];

  Wall.findById(wallId, function(err, wall){
    if(err) {
      cb(err);
    } else if(wall === null) {
      cb(new Error('Wall does not exist'));
    } else {
      args[0] = wall;
      func.apply(this, args);
    }
  });
}

module.exports = {
  /**
   * Creates a new wall
   *
   * @param {string} title
   * @param {ObjectId} owner
   * @param {Participant object list} participants
   * @param {Function} cb(err,wall)
   */
  createWall: function(title, owner, participants, cb){
    if(!cb) {
      cb = participants;
      participants = [];
    }
    participants.push({
      'object': owner,
      'role': 'admin'
    });
    Wall.create({
      title: title,
      participants: participants
    }, cb);
  },
  /**
   * Returns a Wall instance
   *
   * @param {ObjectId} wallId
   * @param {Function} cb(err, wall)
   */
  getWall: _.wrap(function(wall, cb) {
    cb(null, wall);
  }, wrapToWall),
  /**
   * Drops a wall
   *
   * @param {ObjectId} wallId
   * @param {Function} cb(err)
   */
  dropWall: function(wallId, cb){
    Wall.remove({_id: wallId}, cb);
  },
  /**
   * Adds participant to a wall
   *
   * @param {ObjectId} wall
   * @param {ObjectId} participantId
   * @param {string} role one of admin, editor, member
   * @param {Function} cb(err, wall)
   */
  joinWall: _.wrap(function(wall, participantId, role, cb) {
    wall.participants.push({
      object: participantId,
      role: role
    });
    wall.save(cb);
  }, wrapToWall),
  /**
   * Removes participant from the wall
   *
   * @param {ObjectId} wall
   * @param {ObjectId} participantId
   * @param {Function} cb(err, wall)
   */
  leaveWall: _.wrap(function(wall, participantId, cb) {
    wall.participants = _.reject(wall.participants, function(p){
      return p.object.equals( participantId );
    });

    if(_.filter(wall.participants, function(p){
      return p.role === 'admin';
    }).length === 0) {
      cb(new Error('The last admin can not be removed'));
    } else {
      wall.save(cb);
    }
  }, wrapToWall),
  /**
   *
   * @param wall
   * @param author
   * @param title
   * @param message
   * @param cb
   */
  createMessage: _.wrap(function(wall, author, title, message, cb){
    wall.addMessage({
      title: title,
      author: author,
      message: message
    }, cb);
  }, wrapToWall),
  /**
   *
   * @param wall
   * @param msgIdx
   * @param author
   * @param message
   * @param cb
   */
  createComment: _.wrap(function(wall, msgIdx, author, message, cb) {
    wall.replyTo({
      replyTo: msgIdx,
      author: author,
      message: message,
    }, cb);
  }, wrapToWall)
};