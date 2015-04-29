/* Copyleft 2013 */
/*jslint browser: true*/
/*globals console*/
// Spacechaser
// Gemaakt door Jaimie de Rijk voor het vak programeren, Deeltoets 3

var canvas = document.getElementById("board");
var context = canvas.getContext('2d');
canvas.setAttribute('width', 1280);
canvas.setAttribute('height', 800);
var schip1 = document.getElementById("schip1");     // haalt de images op
var schip2 = document.getElementById("schip2");
var turret = document.getElementById("turret");
var bullet = document.getElementById("bullet");
var pause = document.getElementById("pause");
var reloading = document.getElementById("reloading");
var explosion17 = document.getElementById("explosion17");   //http://www.aber.ac.uk/~dcswww/Dept/Teaching/CourseNotes/current/CS25210//slides/sprites.html       

var ship1 = {x:800,y:300}         //posties van de 2 schepen en turret ship1=enemy
var ship2 = {x:100,y:250,turretAngle:0}

var firePosition = {x:ship2.x+175,y:ship2.y+104} //positie van af waar geschoten wordt
var orientation = {you:ship2.turretAngle,enemy:ship1.turretAngle};                  //slaat de hoek van schieten op het moment van schieten.
//interval voor  animatie
var intervalFireDraw  ;
var intervalExplosion ;//= setInterval()
var intervalEnemy;// = setInterval();
var intervalHitCheck;// = setInterval();
var boem = {sx:0,sy:0}          //posities waar explosies plaatsvinden
var intervalBool = {fireDraw:false,explosion:false,shipExplosion:false} //booleans die bijhouden welke animatie getekent moet worden
var enemyStop ={random:0,counter:1,half:0.2};       // properties die gebruikt worden bij het random heen en weer bewegen.
var hitPoints =200;                                 // levensbalk
//variabele voor reload
var fired = false;
var firedTimeout ;// = setTimeout();

var repeatState=false;  //voor de pauze knop

function drawRotatedImage(image, x, y, angle) { //http://creativejs.com/2012/01/day-10-drawing-rotated-images-into-canvas/
 
    // save the current co-ordinate system 
    // before we screw with it
    context.save(); 
 
    // move to the middle of where we want to draw our image
    context.translate(x, y);
 
    // rotate around that point, converting our 
    // angle from degrees to radians * TO_RADIANS
    context.rotate(angle );
 
    // draw it up and to the left by half the width
    // and height of the image 
    context.drawImage(image, -(image.width/2), -(image.height/2));
 
    // and restore the co-ords to how they were when we began
    context.restore(); 
}
var updateDraw = function () {
    //enemyship
    context.drawImage(schip1,ship1.x,ship1.y)
    //your ship
    context.drawImage(schip2,ship2.x,ship2.y)
    drawRotatedImage(turret,ship2.x+175,ship2.y+104,ship2.turretAngle);
    //Healthbar  enemy 
    context.beginPath();
    context.fillStyle="green";
    context.fillRect(850,50,hitPoints,20); 
    context.beginPath();
    context.lineWidth="6";
    context.strokeStyle="7c7977";
    context.rect (850,50,200,20);
    context.stroke();      
    
    //bullet
    if (intervalBool.fireDraw==true) {
        drawRotatedImage (bullet,firePosition.x-15*Math.cos(orientation.you),firePosition.y+15*Math.sin(orientation.you),orientation.you)
            if (fired==true) {  //reloading
        context.drawImage(reloading,100,100)
        }    
    }
    //explosion
    else if (intervalBool.explosion==true) {
        context.drawImage(explosion17,boem.sx,boem.sy,64,64,firePosition.x+30,firePosition.y-20,50,50)
        if (fired==true) {      //reloading
        context.drawImage(reloading,100,100)
        }    
    }
    //ship explosion
    else if (intervalBool.shipExplosion==true) {
    context.drawImage(explosion17,boem.sx,boem.sy,64,64,firePosition.x+100 ,firePosition.y-100,200,200)
    }
    
    // border pause
    else if (repeatState==false) {
        pause.classList.add("paused");
        // context.beginPath();
        // context.lineWidth="6";
        // context.strokeStyle="green";
        // context.rect (518,670,200,100);
        // context.stroke();
    }
}
var moveShip = function () {            // aangeroepen via pijltje omhoog en omlaag
    context.clearRect(0,0,1800,800)          //(x,y,width,height)
    updateDraw();
}
var enemyShipMove = function () {
    if (enemyStop.random>enemyStop.counter) {        
        if (ship1.y>150 && enemyStop.half<=0.5  ) {     // ship mag niet voorbij 150y
            ship1.y -= 5;                               // veranderd positie schip1
            enemyStop.counter++                         // wordt tot een random getal opgeteld. maakt bewegingen langduriger.
            //console.log (ship1.y)
            context.clearRect(0,0,1800,800)
            updateDraw();
        }
        else if (ship1.y<=650 && enemyStop.half>=0.5 ) {    // ship mag niet voorbij 650y
            ship1.y += 5;
            enemyStop.counter++
            //console.log (ship1.y)
            context.clearRect(0,0,1800,800)
            updateDraw();
        }
        else {
            enemyStop.counter=0;                                        //counter reset
            enemyStop.random =Math.floor((Math.random() * 50) + 10)      // random getal tot waar moet worden opgeteld
            enemyStop.half=Math.random();                               // halve kans voor omhoog of omlaag
        };
    }
    else {
        enemyStop.counter=0;
        enemyStop.random =Math.floor((Math.random() * 50) + 1)
        enemyStop.half=Math.random();
        
    };
};                   
//shooting
var firedSet = function (){         //opgeroepen met spatie
    fired=true;
    firedTimeout = setTimeout(firedFalse, 4000);        //Tijd voor reload
};
var firedFalse = function () {                      // reload klaar
    fired = false;
    clearTimeout(firedTimeout);
};
var fire = function () {        // wordt opgeroepen door spatie keycode 32
    if (fired==false) {         // zolang er nog niet geschoten is.
        orientation.you = ship2.turretAngle     //hoek waar in het plaatje getekend moet worden.
        clearInterval(intervalFireDraw);        // voorkomt versnelling
        intervalFireDraw=setInterval(fireDraw,30)   //start het tekenen
        console.log ("fire")
        intervalBool.fireDraw=true;                 // geeft door aan update draw dat er bullets getekend mogen worden
        firePosition = {x:ship2.x+180,y:ship2.y+104}// update fire position
    }
    else {
        console.log ("reloading"+fired)
    };
};
var fireDraw = function() {             //laat de kogels tekenen. wordt steeds opgeroepen door intervalFiredraw
    
    context.clearRect(0,0,1800,800)
    
    firePosition.x += Math.cos(orientation.you) * 10;           //positie van bullets 
    firePosition.y += Math.sin(orientation.you) * 10;
    console.log (firePosition.x)
    updateDraw();

}    
var hitCheck = function (){
    if (firePosition.x < ship1.x + schip1.width  && firePosition.x + bullet.width  > ship1.x &&
        firePosition.y < ship1.y + schip1.height && firePosition.y + bullet.height > ship1.y && intervalBool.fireDraw==true) {  //komt bullet in contact met schip
        hitPoints-=50;              // schade aftrekken
        clearInterval(intervalFireDraw);    // stop met bullet tekenen
        intervalBool.fireDraw=false;    
        console.log (hitPoints);
        if (hitPoints<=0) {         //wanneer hitpoints minder dan 0 
            intervalBool.shipExplosion=true;        // grotere explosie
            console.log("big explosion");
            ship1.x=2000;
            document.getElementById("win").className = "show";  // show win
        }
        else { 
            intervalBool.explosion=true;    // niet minder dan 0 = kleine explosie
        }
        intervalExplosion=setInterval(explosion,60)
        moveShip();            // haalt laatste drawing van bullet weg  
    }
    else if (intervalBool.fireDraw==true) {    
        if (firePosition.x < 0 || firePosition.x > 1280 ||firePosition.y < 0 || firePosition.y > 800) { // misgeschoten en er is geschoten
        clearInterval(intervalFireDraw);
        intervalBool.fireDraw=false;
        moveShip();
        };
    };      
};
var explosion = function(){                    // loopt door de sprite plaatjes heen                         
    if (boem.sx==256) {
        boem.sx=0
        if (boem.sy==0) {
            boem.sy+=64
        }
        else if (boem.sy==64) {
            boem.sy+=64
        }
        else if (boem.sy==128) {
            boem.sy+=64
        }
        else if (boem.sy==192) {
            boem.sy+=64
        }
        else if (boem.sy==256) {
            boem.sy+=64
        }
        else {                              // heeft alles laten zien dus stopt de animatie
            clearInterval(intervalExplosion);
            intervalBool.explosion=false;
            intervalBool.shipExplosion=false;
            boem.sx=0
            boem.sy=0
        }
    }
    else {
        context.clearRect(0,0,1800,800)   
        boem.sx+=64        
        updateDraw();
    };
    
};

var repeat = function () {          // functie verbonden aan de pauze knop
    pause.classList.remove("paused");
    if (repeatState==false){
        intervalEnemy=setInterval(enemyShipMove,30)
        repeatState=true;
        console.log ("on")
        updateDraw()
    } else if (repeatState==true){
        clearInterval(intervalEnemy);
        repeatState=false;
        console.log("off")
        updateDraw()
    }
}
var start = function (){            //start voor de hitchecker
    intervalHitCheck = setInterval(hitCheck,30);
}
updateDraw();   //laat alles de eerste keer tekenen
start();        
pause.addEventListener("click",repeat)  //click event op pause plaatje
window.onkeydown = function (event) { 
    switch(event.keyCode){
        case 37: // links turret draait naar links
            ship2.turretAngle-=0.1;
            moveShip();
        break;
        case 39: // rechts turret draait naar rechts
            ship2.turretAngle+=0.1;
            moveShip();
        break;
        case 38: // omhoog schip naar boven
            ship2.y-=5
            moveShip ()
        break;
        case 40: // omlaag schip naar onder
            ship2.y+=5
            moveShip ()
        break;
        case 32://spatie
            if (repeatState==true) {    //pause knop uit
                if (fired==false) {     //nog aan het reloaden
                    fire();
                    firedSet ();
                };
            };
        break;
    }
}
