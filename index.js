/* jshint esnext: true */
$(document).ready( () => {
  const COUNTIES = ["los-angeles", "orange-county", "santa-barbara"];
  let globalObject = {};
  let chosenCounties = [];
  let chosenSurfers = [];
  let username = '';
  COUNTIES.forEach(county => {
    getSwell(county, globalObject);
  });

  function handleCountyName(county) {
    var temp = county.split('-');
    for (i=0; i<temp.length; i++) {
      temp[i] = temp[i].charAt(0).toUpperCase() + temp[i].slice(1);
    }
    return temp.join(' ');
  }

  function isFiring(county, globalObject) {
    let swell = globalObject[county].swell;
    let wind = globalObject[county].wind;
    let tide = globalObject[county].tide;
    county = handleCountyName(county);

    if (isChillSwell(swell) && isChillWind(wind) && isGoodTide(tide)) {
      return `DUDE, it's FIRING in ${county}`;
    } else if (isChillSwell(swell) && isChillWind(wind)) {
      return `If you're not a kook get out to ${county}`;
    } else if (isChillWind(wind) && isGoodTide(tide)) {
      return `A real man would go out to ${county}`;
    } else if (isChillSwell(swell) && isGoodTide(tide)) {
      return `It's going to be a bumpy ride in ${county}`;
    } else {
      return `Buy a plane ticket and get the hell out of ${county}`;
    }
  }
  function isChillSwell(swell) {
    return swell[0] > 2;
  }
  function isChillWind(wind) {
    return wind[0].direction_text !== 'W' && wind[0].speed_kts < 7;
  }
  function isGoodTide(tide) {
    return tide[0] > 0.5 && tide[0] < 4;
  }

  function getSwell(county, globalObject) {
    $.ajax({
      method: 'GET',
      url: 'http://api.spitcast.com/api/county/swell/' + county + '/',
      success: swellData => {
        let swellArray = [];
        globalObject[county] = {};
        const meterToFeet = 3.28084;
        swellData.forEach(obj => {
          obj.hst = (obj.hst * meterToFeet).toFixed(2);
          swellArray.push(obj.hst);
        });
        globalObject[county].swell = swellArray;
        getTide(county, globalObject);
      },
      error: err => {
        console.error('error with swell get request', err);
      }
    });
  }

  function getTide(county, globalObject) {
    $.ajax({
      method: 'GET',
      url: 'http://api.spitcast.com/api/county/tide/' + county + '/',
      success: tideData => {
        let tideArray = [];
        tideData.forEach(obj => {
          tideArray.push(obj.tide.toFixed(2));
        });
        globalObject[county].tide = tideArray;
        getWind(county, globalObject);
      }
    });
  }

  function getWind(county, globalObject) {
    $.ajax({
      method: 'GET',
      url: 'http://api.spitcast.com/api/county/wind/' + county + '/',
      success: windData => {
        let windArray = [];
        let windObject;
        windData.forEach(obj => {
          windObject = {};
          windObject.direction_text = obj.direction_text;
          windObject.speed_kts = obj.speed_kts;
          windArray.push(windObject);
        });
        globalObject[county].wind = windArray;
      },
    });
  }

  $(document).on('click', '.unclicked', function() {
    $(this).toggleClass("toggleWhite");
  });

  $(document).on('click', 'img', function() {
    $(this).toggleClass("toggleImage");
  });

  $(document).on('click', '#submit', function(e) {
    e.preventDefault();
    for (let i = 0; i < $('.toggleWhite').length; i++) {
      chosenCounties.push($('.toggleWhite')[i].id);
    }
    for (let i = 0; i < $('.toggleImage').length; i++) {
      chosenSurfers.push($('.toggleImage')[i].id);
    }
    if ($('.input').val() !== '') {
      username = $('.input').val();
      $('form').fadeOut(500);
      $('form').remove();
      let userData = {
        'name': username,
        'counties': chosenCounties,
        'surfers': chosenSurfers
      };
      updateDom(username, chosenCounties, chosenSurfers);
    }
  });

  function updateDom(username, chosenCounties, chosenSurfers) {
    $('body').append("<div id='mainContainer'><div id='conditionsContainer'>" + username + " check out the conditions: </div>\
                    <div id='countiesContainer'></div></div>");
    for(var i = 0; i< chosenCounties.length; i++ ) {
        $("#countiesContainer").append(handleCountyName(chosenCounties[i]) + " :");
         $("#countiesContainer").append("<div class ='conditionResult'>" + isFiring(chosenCounties[i], globalObject) + "</div>");
    }

  }
});
