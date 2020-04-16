//
// Server Setup
//
var port = process.env.PORT || 5000; //Defaults to port 5000
var express = require('express');
var app = express();

var server = app.listen(port,()=>console.log("Server Started"));

//
// Loading the Leaderboard File
//

var fs = require('fs');
var leaderboard = JSON.parse(fs.readFileSync('leaderboard.json'));


//
// Setting Server Routes
//

app.use(express.static('webpages')); // host client side webpages (loads files inside webpages folder, looks for index.html first)
app.get('/leaderboard',sendLeaderboard); // Leaderboard route
app.get('/submit/:name/:time',recieveTime); // Submit time route

//
// Send & Receive Methods
//

function sendLeaderboard (reqest,response){
    response.send(JSON.stringify(leaderboard))
}

function recieveTime(request,response){
    // Parse data
    var data = request.params;
    var name = data.name;
    var time = parseFloat(data.time);

    let reply = ""; //Variable for msg reply

    addTimeToLeaderboard(name,time,function(err){
        if(err){
            reply = "Error when submitting time to server"
        }else{
            reply = "Data received"
        }
        response.send({msg:reply,value:data}); // Send message back
    });
}


//
// Task Scheduling
//

const cron = require("node-cron");

cron.schedule("0 0 * * *", function() { // Executes at 00:00 every day
    clearDailies(function(err){if(err){console.log(err)}}); // Resets daily time
});

cron.schedule("1 0 * * 1", function() { // Executes at 00:01 every Monday
    clearLeaderboard(function(err){if(err){console.log(err)}}); // Resets whole leaderboard
});

function clearDailies(callback){
    for (var i = 0;i<leaderboard.length;i++){ // Loops through the leaderboard, clearing daily times
        leaderboard[i].daily = 0;
    }
    // Save Leaderboard To JSON
    fs.writeFile('leaderboard.json',JSON.stringify(leaderboard),(err)=>callback(err))
}

function clearLeaderboard(callback){
    leaderboard = [];
        // Save Leaderboard To JSON
        fs.writeFile('leaderboard.json',JSON.stringify(leaderboard),(err)=>callback(err))
}

//
// Leaderboard Interface
//

function addTimeToLeaderboard(name,time,callback){
    let today = new Date().toLocaleDateString(); // dd/mm/yyyy
    let found = false;

    for (var i = 0;i<leaderboard.length;i++){ // Loops through the leaderboard, checking if name is found and where the time fits
        if(leaderboard[i].name == name){found = true; break}
    }
    
    if (found){ // Name in leaderboard already (in position i)
        (leaderboard[i].updated == today)? leaderboard[i].daily+=time:leaderboard[i].daily=time; // If updated today add to daily time, else ovveride
        leaderboard[i].weekly+=time;
        leaderboard[i].updated = today;

    }else{ // Name not found in leaderboard
        leaderboard.push({name:name,daily:time,weekly:time,updated:today}); // Insert into leaderboard
    }
    leaderboard.sort((a,b) => (a.weekly > b.weekly) ? -1 : ((b.weekly > a.weekly) ? 1 : 0)); // Sort leaderboard, decending based on weekly time
    // Save Leaderboard To JSON
    fs.writeFile('leaderboard.json',JSON.stringify(leaderboard),(err)=>callback(err))
}