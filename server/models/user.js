const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'name']);
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};


UserSchema.statics.findByCredentials = function (name, password) {
  var User = this;

  return User.findOne({name}).then((user) => {
    if (!user) {
      // return Promise.reject();
      resolve();
    }

    return new Promise((resolve, reject) => {
      if (password == user.password) {
        resolve(user);
      } else {
        reject();
      }
    });

    // return new Promise((resolve, reject) => {
    //   bcrypt.compare(password, user.password, (err, res) => {
    //     if (res) {
    //       resolve(user);
    //     } else {
    //       reject();
    //     }
    //   });
    // });

  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};



var User = mongoose.model('User', UserSchema);

module.exports = {User}
