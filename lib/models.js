'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

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
  replies: [MessageSchema],
  readBy: [Schema.Types.ObjectId]
});

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
 * Adds a new message to the wall
 *
 * @param data: JSON of the message with required keys title (string), author (objectId), message (string)
 * @param callback: called with (err, wall)
 */
WallSchema.method('addMessage', function(data, cb){
  this.messages.push(data);
  this.save(cb);
});
/**
 * Adds a reply to a message
 *
 * @param data: JSON of the reply with required keys replyTo (message index), message (string), author (objecId)
 * @param callback: called with (err, wall)
 */
WallSchema.method('replyTo', function(data, cb){
  this.messages[data.replyTo].replies.push({
    message: data.message,
    author: data.author
  });
  this.save(cb);
});
/**
 * Sets a read flag on a message for a reader
 *
 * @param data: JSON with keys message (message index), reader (objectId)
 * @param callback: called with (err, wall)
 */
WallSchema.method('read', function(data, cb){
  this.messages[data.message].readBy.push(data.reader);
  this.save(cb);
});

mongoose.model('Wall', WallSchema);
