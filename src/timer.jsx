import React from 'react';
import Button from 'react-bootstrap/Button';

function Timer(props) {
    let initialTime = new Date(parseFloat(props.initialTime))

    return(
    <div>
        <svg style={{'display':'inline','overflow':'visible','position':'absolute','width':'100%','height':'100%','top':'0','left':'0'}}>
            <path d={describeTimerSVGArc(0,0,100,0.01)} stroke="black" fill="green" strokeWidth="2" fillOpacity="0.5"/>
        </svg>
        <h1>{ initialTime.toISOString().substr(11, 8) }</h1>
        <Button variant="outline-primary" size='lg'>Primary</Button>{' '}



    </div>
    )
}

export default Timer;


function describeTimerSVGArc(x, y, radius, t){
    //Inp: x-centreX, y-centreY, radius-in px, start/endAngle - start/end angle of arc in rads
    //Out: d - svg path obj, start-arry with coords, end-arry with coords
    //What: computes an svg arc path

    // Coords for start and end of arc
    t*=2*Math.PI
    var start = [x,y] // Start at the bottom of the circle (0,-1) if viewed on the unit circle
    var end = [x+radius,y];

    var largeArcFlag = t <= Math.PI ? "0" : "1"; //Needed of angle over pi
    
    // Constructing the SVG object
    var d = [
        "m", start[0], start[1], 
        "A", radius, radius, Math.PI/2, largeArcFlag, 1, end[0], end[1]
    ].join(" ");
      
    return d;   
}