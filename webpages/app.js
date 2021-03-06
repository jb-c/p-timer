//
// Timer & Timer Methods
//

timer = {startTime: new Date().getTime(),
         baseStartTime: new Date().getTime(), //Make a copy of the start time for use in colour shift function
         ellapsedTime: 0,
         running:false,
         updateInterval: 10, //ms
         arcPeriod: 15, // mins
         arcRadius: 170, // px
         handleRadius: 10 // px
        } // Global timer obj, no need to encapsulate as only one timer

function startTimer(){
    timer.startTime=new Date().getTime(); //Time when timer was started
    timer.baseStartTime = new Date().getTime();
    // Set update method to execute every timer.updateInterval milliseconds    
    timer.updateCallback = setInterval(()=>updateTimerAndLabels(),timer.updateInterval);
}

function pauseTimer(){
    clearInterval(timer.updateCallback);
}

function resumeTimer(){
    timer.startTime = new Date().getTime() - timer.ellapsedTime;
    timer.updateCallback = setInterval(()=>updateTimerAndLabels(),timer.updateInterval);
}

function updateTimerAndLabels(){
    var now = new Date().getTime();
    timer.ellapsedTime = now-timer.startTime;

    backgroundColourFade(timer.baseStartTime + timer.ellapsedTime);

    drawTimerArc(dom.timer_div.offsetWidth/2,dom.timer_div.offsetHeight/2,timer.arcRadius,timer.ellapsedTime/(timer.arcPeriod*60000))
    pushTimeToLabel(timer.ellapsedTime);
}

//
// Data Setter & Getter Methods
//

function sendData(name,time){
    if(name==""){name="anon"} // Catch null case

    fetch('./submit/'+name+'/'+time) // Go to relevant api path
    .then(function(res){
        return res.text();
    })
    .then((data)=>{
        data = JSON.parse(data); // Response data
        // Could do something here if needed...
    })
}

function getLeaderboardData(){
    fetch('./leaderboard')
        .then(function(res){
            return res.text();
        })
        .then((data)=>{
            data = JSON.parse(data); // Responce data, should be leaderboard.json
            drawLeaderboard(data); // Pass data to drawLeaderboard function
        })
}