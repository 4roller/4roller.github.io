/* DistrictMine Javascript */
var DistrictMineJS = (function() {

  // Google Map Variables     
  var map; 
  var markersArray = [];
  var API_KEY = 'AIzaSyCcdAQ2zf5JwAKPfP2u2x6ADtv6tXFTMII';
  var libraries = 'weather,places,visualization';

  // Yelp Keys
  var auth = { 
    consumerKey: "GtpeackRWLh4vghGQ48Lxw", 
    consumerSecret: "91buToIy6mUEj1RbPOMHzZSxz5I",
    accessToken: "2s0iIjnhqlcZwdpEZsDguxx1OACQA0Uc",
    accessTokenSecret: "NOfSFef3cLlc4RvS7aAqrGNUfOI",
    serviceProvider: { 
      signatureMethod: "HMAC-SHA1"
    }
  };

  var terms = 'food';
  var near = 'Santa+Monica';

  var accessor = {
    consumerSecret: auth.consumerSecret,
    tokenSecret: auth.accessTokenSecret
  };

  parameters = [];
  parameters.push(['term', terms]);
  parameters.push(['location', near]);
  parameters.push(['callback', 'cbFn']);
  parameters.push(['oauth_consumer_key', auth.consumerKey]);
  parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
  parameters.push(['oauth_token', auth.accessToken]);
  parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

  var message = { 
    'action': 'http://api.yelp.com/v2/search',
    'method': 'GET',
    'parameters': parameters 
  };

  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  var parameterMap = OAuth.getParameterMap(message.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

  var jsonp = function(url, cb) {
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = url;
    document.querySelector('head').appendChild(script);
    cbFn = function(data) {
      cb(data);
    }
  }

  var thing = $.param(parameterMap);
  var stuff;
  jsonp(message.action + "?" + thing, function(data) {
     stuff = data;
  });


  return {

    // Asynchronously loads the Google Maps API
    loadScript: function() {
      var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "http://maps.googleapis.com/maps/api/js?libraries=" + 
                      libraries + "&key=" + API_KEY + "&sensor=false&callback=DistrictMineJS.init";
        document.body.appendChild(script);
    },

    init: function() {
      var mapOptions = {
        //Santa Monica, California
        center: new google.maps.LatLng(34.0450, -118.4400),
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.querySelector("#map-canvas"), mapOptions);

      var styles = [{
          stylers: [
            { hue: "#00ffe6" },
            { saturation: -100 }
          ]
        },{
          featureType: "road",
          elementType: "geometry",
          stylers: [
            { lightness: 100 },
            { visibility: "simplified" }
          ]
        },{
          featureType: "road",
          elementType: "labels",
          stylers: [
            { visibility: "on" }
          ]
      }];
      var styles = [{}];
      
      // Set Styles on Map
      map.setOptions({styles: styles});

      // var loc = new google.maps.LatLng(34.0477459, -118.440078);
      // var loc2 = new google.maps.LatLng(34.029242 , -118.470345);
      // var loc3 = new google.maps.LatLng(34.059690 , -118.417441);
      
      // this.addMarker(loc);
      // this.addMarker(loc2);
      // this.addMarker(loc3);

      this.initEvents();


    }, 
    initEvents: function() {
      document.querySelector('button').addEventListener('click', function() {
        DistrictMineJS.doThis();
      });




    },
    doThis: function() {
      console.log(stuff);
      Object.keys(stuff.businesses).forEach(function(key) {
          console.log(key, stuff.businesses[key].location.coordinate);
          var coordObj = stuff.businesses[key].location.coordinate;
          var loc = new google.maps.LatLng(coordObj.latitude, coordObj.longitude);
          DistrictMineJS.addMarker(loc);
      });

    },
    addMarker: function(location) {

      //Radius Map style for marker
      var circleOptions = {
        strokeColor: "#00FF00",
        strokeOpacity: 0.3,
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.1,
        map: map,
        center: location,
        radius: 100
      };

      marker = new google.maps.Marker({
        position: location,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 2
        }, 
        map: map,
        draggable: true
      });

      circle = new google.maps.Circle(circleOptions);

    }



  }})();





DistrictMineJS.loadScript();
