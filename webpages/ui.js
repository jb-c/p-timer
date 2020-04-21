// JavaScript relating to UI elements

//
// HTML Element Variables
//

var dom = {
    leaderboard_div: document.getElementById("leaderboard"),
    leaderboard_table: document.getElementById("leaderboard-table"),
    leaderboard_btn: document.getElementById("leaderboard-btn"),

    navbar: document.getElementById("navbar"),
    navbar_hitbox: document.getElementById("navbar_hitbox"),
    lower_div: document.getElementById("lower-div"),
    submit_name: document.getElementById("submit-name"),
    submit_btn: document.getElementById("submit-btn"),
    reset_btn: document.getElementById("reset-btn"),

    content_div: document.getElementById("content"),
    timer_div: document.getElementById("timer-div"),
    timer_arc: document.getElementById("timer-arc"),
    timer_handle: document.getElementById("timer-handle"),
    timer_label: document.getElementById("timer-label"),
    timer_btn: document.getElementById("timer-btn"),

    colours_btn: document.getElementById("background-btn"),
    background: { // Object to store properties relating to the colour of the background
        colourShift: true,
        period: 0.5, // In hours
        colours: ['#FECBA5','#FBD7BB','#FCEEC5','#FFE5B4','#F9D494','#F1C470','#cdd9a1','#b6cf89','#62b177','#58a089']
    }
}

//
// Runs On Page Load
//

// Initial design features & Public Variables
drawTimerArc(dom.timer_div.offsetWidth/2,dom.timer_div.offsetHeight/2,timer.arcRadius,0.99999);
dom.submit_name.style.width = `${dom.leaderboard_btn.offsetWidth}px`;
dom.submit_btn.style.width = `${dom.leaderboard_btn.offsetWidth}px`;
dom.colours_btn.style.width = `${dom.leaderboard_btn.offsetWidth}px`;
dom.navbar_hitbox.style.width = `${dom.navbar.offsetWidth/2}px`;

backgroundColourFade(timer.baseStartTime);

//
// Onclick Methods
//
    
dom.timer_btn.onclick = function(){
    if(timer.running){
        timer.running = false;
        dom.timer_btn.value = "Resume";
        pauseTimer();
        fadeInElement(dom.lower_div);
        slideInFromLeftElement(dom.navbar);
    }else{
        timer.running = true;
        dom.timer_btn.value = "Pause";
        if(timer.ellapsedTime==0){startTimer();}
        else{resumeTimer();fadeOutElement(dom.lower_div);} //Fades submit div out

        slideOutToRightElement(dom.navbar);

        // A lot of callbacks to show and hide navbar when mouse goes in and out of the left portion of the screen
        dom.navbar_hitbox.addEventListener('mouseenter', function callback(event) {
            if(event.x < 0.2 * window.innerWidth && timer.running){ // Shownavbar
                slideInFromLeftElement(dom.navbar)
                dom.navbar_hitbox.removeEventListener('mouseenter',callback);

                dom.navbar.addEventListener('mouseleave',function second_callback(event){  // Hide navbar             
                    slideOutToRightElement(dom.navbar);
                    dom.navbar.removeEventListener('mouseleave',second_callback);
                    setTimeout(function(){ dom.navbar_hitbox.addEventListener('mouseenter',callback) }, 100); // Reset event listenrs after a small delay
                })
            }
        });
    }
}

dom.submit_btn.onclick = function(){    
    // Submit data to server
    sendData(dom.submit_name.value,parseFloat(timer.ellapsedTime))
    resetPage();
    fadeOutElement(dom.lower_div);
}

dom.reset_btn.onclick = function(){
    resetPage();
    fadeOutElement(dom.lower_div);
}

dom.leaderboard_btn.onclick = function(){
    getLeaderboardData();
}

dom.colours_btn.onclick = function(){
    if(dom.background.colourShift){
        dom.background.colourShift = false;
        this.value = "Colour Fade: Off"
    }else{
        dom.background.colourShift = true;
        this.value = "Colour Fade: On "
    }
}

//
// Element Update Methods
//

function drawLeaderboard(data){
    // Note: runs as a call back when data is fetched from server

    if(data.length == 0){ // Catches case when data = []
        dom.leaderboard_table.innerHTML = "No Entries Yet, Get Working!";
    }else{
        dom.leaderboard_table.innerHTML = ""; // Clear table
        let keys = Object.keys(data[0]);
        generateTable(dom.leaderboard_table, data); // generate the table first
        generateTableHead(dom.leaderboard_table, keys); // then the head
    }

    // Fade In
    fadeInElement(dom.leaderboard_div)

    // Fade out when leaderboard is showing and we click outside the leaderboard
    dom.leaderboard_div.addEventListener("transitionend",function callback(){
        dom.leaderboard_div.removeEventListener("transitionend",callback);

        document.addEventListener('click', function callback(event) {
            var isClickInside = dom.leaderboard_div.contains(event.target) || dom.leaderboard_btn.contains(event.target);
            if (!isClickInside) {
                fadeOutElement(dom.leaderboard_div);
                document.removeEventListener("click",callback);
            }
            });
    })
}

function pushTimeToLabel(t){
    //Inp: t-time value to be displayed
    //Out: changes timer-label text accordingly

    dom.timer_label.innerHTML = new Date(t).toISOString().substr(11, 8);
}

function drawTimerArc(x,y,r,t){
    //Inp: x-centreX, y-centreY, r-radius, t-angle of arc in [0,1]
    //Out: changes timer and handle elements to relevant arc/location

    t = t - Math.floor(t); //Ensures t in [0,1]
    var [d,start,end] = describeSVGArc(x,y,r, 1/2*Math.PI, 1/2*Math.PI+2*Math.PI*t);

    // Assign svg arc path to html arc svg element
    dom.timer_arc.setAttribute("d",d);
    // Move the handle accordingly
    dom.timer_handle.setAttribute("cx",end[0]);
    dom.timer_handle.setAttribute("cy",end[1]);
    dom.timer_handle.setAttribute("r",timer.handleRadius);
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

function slideInFromLeftElement(ele){
    ele.classList.remove('out');
    dom.navbar_hitbox.style.visibility = "hidden";
}

function slideOutToRightElement(ele){
    ele.classList.add('out');
    dom.navbar_hitbox.style.visibility = "visible";
}

function backgroundColourFade(t){
    let T = new Date(t);
    T = (T.getHours() + T.getMinutes()/60 + T.getSeconds()/3600)/dom.background.period;
    T = T - Math.floor(T); // So T is a fraction of how much we are through a period
    
    var i = Math.floor(T*dom.background.colours.length); // Maps t to an index
    var j = (i+1) % dom.background.colours.length; // Next colour in list with wrap aroun
    var J = T*dom.background.colours.length-i; // fraction of the way between each colour

    dom.content_div.style.backgroundColor =  lerpColor(dom.background.colours[i], dom.background.colours[j], J);
}

function resetPage(){
    // Reset timer and page
    timer.ellapsedTime = 0;
    dom.submit_name.value = "";
    dom.timer_btn.value = "Start";
    drawTimerArc(dom.timer_div.offsetWidth/2,dom.timer_div.offsetHeight/2,timer.arcRadius,0.99999)
    pushTimeToLabel(0);
    slideInFromLeftElement(dom.navbar);
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