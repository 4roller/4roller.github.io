//
//  Jason Leung 2011
//  
//
//
//



YAHOO.util.Event.onDOMReady(function() {

  //Profiling
  var k = new Date;
  var start = parseInt(k.getTime());

  
  var populateList = function(){
    //  Creates AJAX call - no libraroes
    //  Checks for browser implrementations
    if (window.XMLHttpRequest) {
	    // code for IE7+, Firefox, Chrome, Opera, Safari
    	xmlhttp=new XMLHttpRequest();
    }
    else {
	    // code for IE6, IE5
    	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("GET","movieList.xml",false);
    xmlhttp.send();
    xml=xmlhttp.responseXML;

    //If sanity prevails and we get an xml object, start display
    if(xml){
      var nameArr = xml.getElementsByTagName("Name");
      var posterArr = xml.getElementsByTagName("Poster");
      var spaceIdArr = xml.getElementsByTagName("Spaceid");
      var html = "";
      for(var i=0; i< nameArr.length; i++) {
        var title = nameArr[i].childNodes[0].nodeValue;
        var poster = posterArr[i].childNodes[0].nodeValue;
        var spaceId = spaceIdArr[i].childNodes[0].nodeValue;
  	    html +=  '<li id="li' + (i+1) + '"><a href=""><img alt="Movie Poster ' + title + '" src="' + poster + '"/></a>	<label>' + title  + '</label><var>' + spaceId + '</var></li>';
    }
      document.getElementById('scroller').innerHTML = html;
    }
  };


  var addListeners = function() {
    var scroller =  document.getElementById('scroller');
    //scroller.addEventListener('mouseover', changeTitle, false);
    scroller.addEventListener('click', selectItem, false);
    var next =  document.getElementById('next');
    next.addEventListener('click', creepForth, false);
    var prev =  document.getElementById('prev');
    prev.addEventListener('click', creepBack, false);
  };



  //Yes, I know, global variables.. tsk tsk.
  var sPos = 0;
  var idx = 5;
  
  var creepForth = function(e) {
    e.preventDefault();
    idx += 3;
    creepTo(idx);        
  };
  
  var creepBack = function(e) {
    e.preventDefault();
    idx -= 3;
    creepTo(idx);
  };
  
  var creepTo = function(idx) {
    sPos = parseInt(sPos);
    //MAGIC NUMBERS to fudge display isses converting from pixels to percentages, could be done better.
    stuffing = (window.innerWidth * .010);
    fudge = ((-110 * 0.62) + (window.innerWidth * 0.089)) + (4*stuffing)  ;
    idx = ((window.innerWidth / 2) ) +  (idx * -110)  - fudge ;  
    sPos = parseInt(document.getElementById('scroller').style['left']);

    if(YAHOO.util.Anim) {
      var attributes = {
        left: { to: idx },
      };
      var myAnim = new YAHOO.util.Anim('scroller', attributes);
      myAnim.duration = 0.499;
      myAnim.animate();
    }
    else {
      // timming without the Animation Library
      setTimeout(function() {
        document.getElementById('scroller').style['left'] =  idx+ "px";
      }, 50);
    }
  };

  var changeTitle = function(e) { 
      document.getElementById('title').innerHTML =  ''; 


/*
    if(e.target.src != null) {
      var title = e.target.parentNode.parentNode.children[1].innerHTML;
      document.getElementById('title').innerHTML =  title; 

      if(YAHOO.util.Anim) {
        var attributes = {
          opacity: { from: -0.7, to: 1},
        };
        var myAnim = new YAHOO.util.Anim('title', attributes);
        myAnim.duration = 0.8;
        myAnim.animate();
      }
    }
*/
  };

  var clearSelect = function(e) {
    var y = e.target.parentNode.parentNode.parentNode.childNodes.length;
    var li = e.target.parentNode.parentNode.parentNode.childNodes;
    for(var x=0; x< y; x++) {
      if(li[x].childNodes[0].childNodes[0].className == 'select') {
        var img = li[x].childNodes[0].childNodes[0];
		setTimeout(function() {	
	        img.className = 'unselect';
	        img.style.opacity = ''; }, 210); 

        if(YAHOO.util.Anim) {
          var attributes = {
            opacity: { from: 0.9, to: 0.6},
            width: { from: 100, to: 60}
          };
          var myAnim = new YAHOO.util.Anim(img, attributes);
          myAnim.duration = 0.2;
          myAnim.animate();
        }
      }
    }
  }

  var selectItem = function(e) { 
    e.preventDefault();
    //Timing Profile
    x = new Date;
    s = parseInt(x.getTime());

    info(e);
    changeTitle(e);

    if(e.target.src != null) {
      clearSelect(e);
      var img = e.target;
      img.className = 'select';
      liId = e.target.parentNode.parentNode.id;
      idx = parseInt(liId.replace('li', '')) * 1; 
      creepTo(idx);
      if(YAHOO.util.Anim) {
        var attributes = {
          opacity: { from: 0, to: 1},
          width: { from: 60, to: 100}
        };
        var myAnim = new YAHOO.util.Anim(e.target, attributes);
        myAnim.duration = 0.72;
        myAnim.animate();
      }
    }
    //Timing Profile
    y = new Date;
    f = parseInt(y.getTime());
    console.log(f-s+"ms");
  };

  var intro = function() {
    if(YAHOO.util.Anim) {
      var attributes = {
        opacity: { from: 0, to: 1},
        top: { from: -100, to: 0}
      };
      var myAnim = new YAHOO.util.Anim('scroller', attributes);
      myAnim.duration = 1;
      myAnim.animate();
      
      var attributes1 = {
        opacity: { from: 0, to: 1},
      };
      var myAnim1 = new YAHOO.util.Anim('title', attributes1);
      myAnim1.duration = 1.7;
      myAnim1.animate();
    }
    
  }

  var info = function(e) {
	
	
	var spaceId = e.target.parentNode.parentNode.children[2].innerHTML;

    if (window.XMLHttpRequest) {
    	xmlhttp=new XMLHttpRequest();
    }
    else {
    	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    var queryURL = "query.php?plot=full&i=" + spaceId;
  
    xmlhttp.open("GET",queryURL,false);
    xmlhttp.send();
    rawJson = xmlhttp.responseText;
	thing = JSON.parse(rawJson, function(key,value) {
		return value;	
	});


  var info = document.getElementById('info');
	var title = document.getElementById('iTitle');
	var year = document.getElementById('iYear');
	var plot = document.getElementById('iPlot');
	var rated = document.getElementById('iRated');
	var released = document.getElementById('iReleased');
	var genre = document.getElementById('iGenre');
	var director = document.getElementById('iDirector');
	var writer = document.getElementById('iWriter');
	var runtime = document.getElementById('iRuntime');
	var rating = document.getElementById('iRating');
	var actors = document.getElementById('iActors');
	var poster = document.getElementById('iPoster');
	setTimeout(function() {
	
	title.innerHTML = "<h2>" + thing.Title + "</h2>";	
	rated.innerHTML = "Rated: " + thing.Rated;
  rated.className = thing.Rated;
	plot.innerHTML = '&ldquo;' + thing.Plot + ' &rdquo;';	
	released.innerHTML = "Release: " + thing.Released;	
	genre.innerHTML = thing.Genre;	
	director.innerHTML = "Direction: " + thing.Director;	
	writer.innerHTML = "Writing: " + thing.Writer;	
	runtime.innerHTML = "Runtime: " + thing.Runtime;	
	rating.innerHTML = "User Rating: " + thing.Rating;	
  actorStr = thing.Actors
	actors.innerHTML = actorStr.replace(/, /g, "&nbsp; &diams; &nbsp;");
  poster.innerHTML = thing.Poster;
	year.innerHTML = thing.Year;



 }, 200);

	

    if(YAHOO.util.Anim) {
      var attributes = {
        opacity: { from: -1, to: 1},
      };
      var myAnim = new YAHOO.util.Anim(info, attributes);
      myAnim.duration = 0.9;
      myAnim.animate();
    }

    
  }



  populateList();
  addListeners();
  intro();


  var l = new Date;
  var finish = parseInt(l.getTime());
  tt = finish - start;
  console.log("tt:" + tt +"ms");

});

