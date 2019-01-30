module.exports = (app) => {
  
  const athletes = require("../controllers/athlete.controller.js");
  
  // Default homepage provided by FCC
  app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });
  
  //View all users in database
  app.get('/api/exercise/users', athletes.findAll);
  
  app.get('/api/exercise/log', athletes.findOne);
  
  app.post("/api/exercise/new-user", athletes.create);
  
  app.post("/api/exercise/add", athletes.findByIdAndUpdate);

};