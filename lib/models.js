/**
 * The data-layer for a message wall
 * @module models
 */
'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  Schema = mongoose.Schema;

/**
 * Message schema, contains replies too
 * @constructor Message
 */
var MessageSchema = new Schema({
  subject: {
    type: String
  },
  author: {
    type: Schema.Types.ObjectId,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  readBy: [Schema.Types.ObjectId],
  replies: [{
    subject: {
      type: String
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    readBy: [Schema.Types.ObjectId]
  }]
});

/**
 * Our root class that runs everything
 *
 * @constructor Wall
 */
var WallSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  participants: [{
    object: {
      type: Schema.Types.ObjectId,
      required: true
    },
    role: {
      type: String,
      required: true,
      default: 'member',
      enum: ['member', 'editor', 'admin']
    }
  }],
  messages: [MessageSchema]
});

/**
 * Helper method to check is a given ObjectID has the necessary role
 *
 * @function isParticipant
 * @memberof module:models~Wall
 * @this module:models~Wall
 * @param {ObjectId} object
 * @param {Array} roles - defaults to all
 * @returns Participant or null
 */
WallSchema.method('isParticipant', function(object, roles) {
  if(!roles) {
    roles = ['admin', 'editor', 'member'];
  }
  return _.find(this.participants, function(p){
    return p.object.equals( object ) && roles.indexOf(p.role) > -1;
  });
});

/**
 * Adds a new message to the wall
 *
 * @function addMessage
 * @memberof module:models~Wall
 * @this module:models~Wall
 * @param data - JSON of the message with required keys title (string), author (objectId), message (string)
 * @param {module:WallAPI~wallCallback} callback
 */
WallSchema.method('addMessage', function(data, cb){
  if(this.isParticipant(data.author, ['admin', 'editor'])) {
    this.messages.push(data);
    this.save(cb);
  } else {
    cb(new Error('Author is not allowed to create a message on this wall'));
  }
});
/**
 * Adds a reply to a message
 *
 * @function replyTo
 * @memberof module:models~Wall
 * @this module:models~Wall
 * @param data - JSON of the reply with required keys replyTo (message index), message (string), author (objecId)
 * @param {module:WallAPI~wallCallback} callback
 */
WallSchema.method('replyTo', function(data, cb){
  if(this.isParticipant(data.author)) {
    this.messages[data.replyTo].replies.push({
      message: data.message,
      author: data.author
    });
    this.save(cb);
  } else {
    cb(new Error('Author is not allowed to create a replies on this wall'));
  }
});
/**
 * Sets a read flag on a message for a reader
 *
 * @function read
 * @memberof module:models~Wall
 * @this module:models~Wall
 * @param data - JSON with keys message (message index), reader (objectId)
 * @param {module:WallAPI~wallCallback} callback
 */
WallSchema.method('read', function(data, cb){
  this.messages[data.message].readBy.push(data.reader);
  this.save(cb);
});

mongoose.model('Wall', WallSchema);
