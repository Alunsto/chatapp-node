var prompt = require("prompt");
var mysql = require('mysql');

var fs = require('fs');

prompt.start();

var configSchema = {
  properties: {
    databaseHost: {
      message: "Database host name",
      required: true,
      default: "localhost"
    },
    databaseUser: {
      message: "Database user name",
      required: true,
      default: "root"
    },
    databasePassword: {
      message: "Database password",
      hidden: true
    },
    host: {
      message: "Where this will be hosted (ex. example.com)",
      required: true,
      default: "localhost:3000"
    },
    nodeEnvironment: {
      message: "What sort of environment is this (production/development)",
      required: true,
      default: "production"
    }
  }
}

prompt.get(configSchema, function(err, result) {

  var configText = `module.exports = {
    database: {
      host: "` + result.databaseHost + `",
      user: "` + result.databaseUser + `",
      password: "` + result.databasePassword + `",
      database: "chatapp"
    },
    host: "` + result.host + `",
    nodeEnvironment: "` + result.nodeEnvironment + `"
  }`;

  fs.writeFile("./config.js", configText, function(err) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("config.js created");

    var config = require('./config');

    fs.readFile("./chatapp.sql", 'utf8', function(err, data) {

      var connection = mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        multipleStatements: true
      });

      connection.connect(function(err) {
        if (err) {
          console.log(err);
          console.log("Ensure your database is setup correctly");
          return;
        }
        console.time("Finished setting up database in: ");
        connection.query(data, function(err, rows, fields) {
          if (err) {
            console.log(err);
            return;
          }
          console.timeEnd("Finished setting up database in: ");
          console.log("Setup is completed, you may close this window");
          return;
          //process.exit(0);
        });
      });
    });
  });
});
