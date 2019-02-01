const moment = require('moment');
const Athlete = require("../models/athlete.model.js");

// Create and save a new athlete
exports.create = (req, res) => {
  const desiredUserName = req.body.username;
  
  //ensure username is not blank
  if(!desiredUserName) { 
   return res.status(400).send({
     message: "Desired username cannot be empty"
   });
  }
  
  //ensure username has not already been taken
  //Create new athlete shortcut
  const newUser = new Athlete({
    "username": desiredUserName
  })
  
  //Save newly created athlete in collection
  newUser.save()
  .then(athlete => {
   res.send({ "username": athlete.username, "_id": athlete._id }); 
   console.log("Saved new record");
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Error has occured in saving new user"
    });
  });
};

// Retrieve and return all athletes from the database.
exports.findAll = (req, res) => {
  Athlete.find({}, {username: 1}) //only return username field
  .then(athletes => {
    console.log(athletes);
    res.send(athletes);
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Error occured in retrieving all users"
    });
  });
};

// Find a single athlete with an athleteId
exports.findOne = (req, res) => {
    //store query ID requested
    const userId = req.query.userId;
  
    //store optional parameters
    let fromDate = moment(req.query.from, "YYYY-MM-DD").toDate();
    let toDate = moment(req.query.to, "YYYY-MM-DD").toDate();
    let logLimit = parseInt(req.query.limit);
  
    //validate date queries entered
    if( !moment(fromDate, "YYYY-MM-DD", true).isValid() ) {
      fromDate = null;
    };
    if( !moment(toDate, "YYYY-MM-DD", true).isValid() ) {
      toDate = null;
    };
  
    //compile search criteria based on optional query parameters
    const searchCriteria = {
      "_id" : userId
    };
    
    Athlete.findOne( searchCriteria )
    .then(athlete => {
      //return error if no results found
        if(!athlete) {
            return res.status(404).send({
                message: "No record matching search criteria found"
            });            
        }
      
      let results = athlete.log //store log array
       
      if(fromDate) {
         results = results.filter( (item) => {
         return item.date >= fromDate
         });
       }
       
       if(toDate) {
         results = results.filter( (item) => {
         return item.date <= toDate
         });
       }
       
       if(fromDate && toDate) {
         results = results.filter( (item) => {
         return item.date >= fromDate && item.date <= toDate
         });
       }
      
        //console.log(athlete);
        res.send({
          "_id": athlete._id,
          "username":athlete.username,
          "count": results.length,
          "log": results
        }); //send athlete data if user is found
      
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Athlete with id: " + userId + " not found."
            });                
        }
        return res.status(500).send({
          message: "Error in retrieving record with userId: " + userId + " Error: " + err.message
        });
    });
};

// Update exercise log for user identified by the athleteId in the request
exports.findByIdAndUpdate = (req, res) => {
  
    //store requestedUserId & description
    const userId = req.body.userId;
    const activityDescription = req.body.description;
    const activityDuration = req.body.duration;
    const enteredDate = req.body.date;
    const activityDate = enteredDate == "" ? moment().toDate() : moment(req.body.date, "YYYY-MM-DD").toDate();
    const newLog = { description: activityDescription, duration: activityDuration, date: activityDate };
  
    Athlete.findByIdAndUpdate(
      userId,  //id
      {$push: { log: newLog }},    //push new exercise onto log
      { fields: {"_id": 0, "username": 1}, runValidators: true }
    ).then(athlete =>{
      console.log("Updating athlete log");
      res.send({username: athlete.username, description: activityDescription, duration: activityDuration, date: activityDate }) 
    }).catch(err => {
      res.status(500).send({
      message: err.message || "Error occured in updating exercise log for athlete"
      });
    });
};