// JavaScript relating to UI elements

//
// HTML Element Variables
//
var content_div = document.getElementById("content");

var timer_div = document.getElementById("timer-div");
var timer_arc = document.getElementById("timer-arc");
var timer_handle = document.getElementById("timer-handle");
var timer_label = document.getElementById("timer-label");
var timer_btn = document.getElementById("timer-btn");

var submit_div = document.getElementById("submit-div");
var submit_name = document.getElementById("submit-name");
var submit_btn = document.getElementById("submit-btn");
var reset_btn = document.getElementById("reset-btn")

var leaderboard_btn = document.getElementById("leaderboard-btn");
var leaderboard = document.getElementById("leaderboard");
var leaderboard_table = document.getElementById("leaderboard-table");
var colours_btn = document.getElementById("background-btn");

//
// Runs On Page Load
//

// Initial design features & Public Variables
drawTimerArc(timer_div.offsetWidth/2,timer_div.offsetHeight/2,timer.arcRadius,0.99999);
submit_name.style.width = `${leaderboard_btn.offsetWidth}px`;
submit_btn.style.width = `${leaderboard_btn.offsetWidth}px`;

var background = { // Public object to store properties relating to the colour of the background
    colourShift: true,
    period: 1, // In hours
    colours: ['#cdd9a1','#b6cf89','#62b177','#58a089']
}

backgroundColourFade(timer.baseStartTime)

//
// Onclick Methods
//

timer_btn.onclick = function(){
    if(timer.running){
        timer.running = false;
        timer_btn.value = "Resume";
        pauseTimer();
        fadeInElement(submit_div);
    }else{
        timer.running = true;
        timer_btn.value = "Pause";
        if(timer.ellapsedTime==0){startTimer()}
        else{resumeTimer();fadeOutElement(submit_div);} //Fades submit div out
    }
}

submit_btn.onclick = function(){    
    // Submit data to server
    sendData(submit_name.value,parseFloat(timer.ellapsedTime))
    resetPage();
    fadeOutElement(submit_div);
}

reset_btn.onclick = function(){
    resetPage();
    fadeOutElement(submit_div);
}

leaderboard_btn.onclick = function(){
    getLeaderboardData();
}

colours_btn.onclick = function(){
    if(background.colourShift){
        background.colourShift = false;
        this.value = "Colour Fade: Off"
    }else{
        background.colourShift = true;
        this.value = "Colour Fade: On "
    }
}

//
// Element Update Methods
//

function drawLeaderboard(data){
    // Note: runs as a call back when data is fetched from server

    if(data.length == 0){ // Catches case when data = []
        leaderboard_table.innerHTML = "No Entries Yet, Get Working!";
    }else{
        leaderboard_table.innerHTML = ""; // Clear table
        let keys = Object.keys(data[0]);
        generateTable(leaderboard_table, data); // generate the table first
        generateTableHead(leaderboard_table, keys); // then the head
    }

    // Fade In
    fadeInElement(leaderboard)

    // Fade out when leaderboard is showing and we click outside the leaderboard
    leaderboard.addEventListener("transitionend",function callback(){
        leaderboard.removeEventListener("transitionend",callback);

        document.addEventListener('click', function callback(event) {
            var isClickInside = leaderboard.contains(event.target) || leaderboard_btn.contains(event.target);
            if (!isClickInside) {
                fadeOutElement(leaderboard);
                document.removeEventListener("click",callback);
            }
            });
    })
}

function pushTimeToLabel(t){
    //Inp: t-time value to be displayed
    //Out: changes timer-label text accordingly

    timer_label.innerHTML = new Date(t).toISOString().substr(11, 8);
}

function drawTimerArc(x,y,r,t){
    //Inp: x-centreX, y-centreY, r-radius, t-angle of arc in [0,1]
    //Out: changes timer and handle elements to relevant arc/location

    t = t - Math.floor(t); //Ensures t in [0,1]
    var [d,start,end] = describeSVGArc(x,y,r, 1/2*Math.PI, 1/2*Math.PI+2*Math.PI*t);

    // Assign svg arc path to html arc svg element
    timer_arc.setAttribute("d",d);
    // Move the handle accordingly
    timer_handle.setAttribute("cx",end[0]);
    timer_handle.setAttribute("cy",end[1]);
    timer_handle.setAttribute("r",timer.handleRadius);
}

function fadeInElement(ele){
    ele.style.opacity = "1";
    ele.style.visibility = "visible";
}

function fadeOutElement(ele){
    ele.style.opacity = "0";
    ele.addEventListener("transitionend",function callback(){
        this.style.visibility = "hidden";
        this.removeEventListener("transitionend",callback)
    }) //Sets visability to hidden once transition ends
}

function backgroundColourFade(t){
    let T = new Date(t);
    T = (T.getHours() + T.getMinutes()/60 + T.getSeconds()/3600)/background.period;
    T = T - Math.floor(T); // So T is a fraction of how much we are through a period
    
    var i = Math.floor(T*background.colours.length); // Maps t to an index
    var j = (i+1) % background.colours.length; // Next colour in list with wrap aroun
    var J = T*background.colours.length-i; // fraction of the way between each colour

    content_div.style.backgroundColor =  lerpColor(background.colours[i], background.colours[j], J);
}

function resetPage(){
    // Reset timer and page
    timer.ellapsedTime = 0;
    submit_name.value = "";
    timer_btn.value = "Start";
    drawTimerArc(timer_div.offsetWidth/2,timer_div.offsetHeight/2,timer.arcRadius,0.99999)
    pushTimeToLabel(0)
}

//
// Helper Functions
//

function describeSVGArc(x, y, radius, startAngle, endAngle){
    //Inp: x-centreX, y-centreY, radius-in px, start/endAngle - start/end angle of arc in rads
    //Out: d - svg path obj, start-arry with coords, end-arry with coords
    //What: computes an svg arc path

    // Coords for start and end of arc
    var start = [x+(radius*Math.cos(startAngle)),y+(radius*Math.sin(startAngle))];
    var end = [x+(radius*Math.cos(endAngle)),y+(radius*Math.sin(endAngle))];

    var largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1"; //Needed of angle over pi
    
    // Constructing the SVG object
    var d = [
        "M", end[0], end[1], 
        "A", radius, radius, 0, largeArcFlag, 0, start[0], start[1]
    ].join(" ");
      
    return [d,start,end];   
}

function generateTableHead(table, data) { // Makes a html table header
    // table is html table object, data is array of strs to be used as headers

    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key.toUpperCase());
      th.appendChild(text);
      row.appendChild(th);
    }
  }
  
  function generateTable(table, data) { // Populates html table data
    // table is html table object, data is object array with key value pairs to be the table elements

    for (let element of data) {
      let row = table.insertRow();
      for (key in element) {
        let cell = row.insertCell();
        let text = ""

        if(key == "name"){
            text = document.createTextNode(element[key]);
        }else if(key == "updated"){
            text = document.createTextNode(element[key]);
        }else{
            text = document.createTextNode(new Date(element[key]).toISOString().substr(11, 8));
        }
        cell.appendChild(text);
      }
    }
  }

  function lerpColor(a, b, amount) { // Takes in two hex strings, returns a lerped hex string
    var ah = +a.replace('#', '0x')
    ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
    bh = +b.replace('#', '0x')
    br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
    rr = ar + amount * (br - ar),
    rg = ag + amount * (bg - ag),
    rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}