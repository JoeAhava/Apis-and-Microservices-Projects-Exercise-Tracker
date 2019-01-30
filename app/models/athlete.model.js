const mongoose = require('mongoose');

const athleteSchema = mongoose.Schema({
  "username": {type: String, required: true},
  "log": [{
    "description": {type: String, required: true},
    "duration": {type: Number, required: true},
    "date": {type: Date, required: false}
  }]
});

athleteSchema.pre('save', function (next) {
  const self = this;
  console.log(self.username);
  mongoose.models["Athlete"].findOne({username: self.username}, function(err, user) {
      if (!user) {
          next();
      } else {
          next(new Error("Username already exists. Please try again with a new username."));
      }
  });
});

module.exports = mongoose.model("Athlete", athleteSchema);