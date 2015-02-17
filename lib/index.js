/**
 * @module index
 */
'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
require('./models');
var Wall = mongoose.model('Wall');

/**
 * Wraps a function to exchange wallId to wall instance, all other arguments are passed on intact.
 *
 * The function assumes at least a 3rd callback argument, that will be called if the wall does not exist
 * or an error was raised.
 *
 * @param func
 * @param wallId
 */
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

/**
 * The estisia WallAPI provides a simple way to add a message board
 * to you node base apps.
 *
 * @exports WallAPI
 */
module.exports = {
  /**
   * Creates a new wall
   *
   * @param {string} title
   * @param {ObjectId} owner
   * @param {ParticipantList} participants
   * @param {wallCallback} cb
   *
   * @example Create wall without initial participants
   * wall.createWall('My wall', user.id, function(err, wall){});
   *
   * @example Create wall with initial participants
   * var participants = [{
   *  object: editor.id,
   *  role: 'editor'
   * }, {
   *  object: reader.id,
   *  role: 'reader'
   * }];
   * wall.createWall('My wall, admin.id, participants, function(err, wall){});
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
   * @function
   * @param {ObjectId} wallId
   * @param {wallCallback} cb
   *
   * @example
   * wall.getWall(wallId, function(err, wall){});
   */
  getWall: _.wrap(function(wall, cb) {
    cb(null, wall);
  }, wrapToWall),
  /**
   * Drops a wall
   *
   * @param {ObjectId} wallId
   * @param {wallCallback} cb
   *
   * @example
   * wall.dropWall(wallId, function(err){});
   */
  dropWall: function(wallId, cb){
    Wall.remove({_id: wallId}, cb);
  },
  /**
   * Adds participant to a wall
   *
   * @function
   * @param {ObjectId} wall
   * @param {ObjectId} participantId
   * @param {string} role one of admin, editor, member
   * @param {wallCallback} cb
   *
   * @example
   * wall.joinWall(wallId, user.id, 'editor', function(err, wall){});
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
   * @function
   * @param {ObjectId} wall
   * @param {ObjectId} participantId
   * @param {wallCallback} cb
   *
   * @example
   * wall.leaveWall(wallId, user.id, function(err, wall){});
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
   * Create a message on the wall
   *
   * @function
   * @param {ObjectId} wall
   * @param {ObjectId} author
   * @param {string} title
   * @param {string} message
   * @param {wallCallback} cb
   *
   * @example
   * wall.createMessage(wallId, user.id, 'My subject', 'Lorem ipsum', function(err, wall){});
   */
  createMessage: _.wrap(function(wall, author, title, message, cb){
    wall.addMessage({
      title: title,
      author: author,
      message: message
    }, cb);
  }, wrapToWall),
  /**
   * Add comment for a message
   *
   * @function
   * @param {ObjectId} wall
   * @param {Integer} msgIdx
   * @param {ObjectId} author
   * @param {String} message
   * @param {wallCallback} cb
   *
   * @example
   * wall.createComment(wallId, 0, user.id, 'This is a reply on the first message', function(err, wall){});
   */
  createComment: _.wrap(function(wall, msgIdx, author, message, cb) {
    wall.replyTo({
      replyTo: msgIdx,
      author: author,
      message: message
    }, cb);
  }, wrapToWall)
};

/**
 * Callback used for all the API calls
 * @callback wallCallback
 * @param {object} err
 * @param {Wall} wall - Wall instance
 */
