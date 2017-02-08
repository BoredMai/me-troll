travelerTypes = [
  {
    type: 'Poor',
    minGold: 0,
    maxGold: 15,
    looks: ['poor', 'lower class', 'middle class'],
    minFear: 2,
    maxFear: 4
  },
  {
    type: 'Lower Class',
    minGold: 10,
    maxGold: 30,
    looks: ['poor', 'lower class'],
    minFear: 1,
    maxFear: 4
  },
  {
    type: 'Middle Class',
    minGold: 20,
    maxGold: 60,
    looks: ['middle class', 'upper class'],
    minFear: 0,
    maxFear: 4
  },
  {
    type: 'Upper Class',
    minGold: 40,
    maxGold: 100,
    looks: ['lower class', 'middle class', 'upper class'],
    minFear: 0,
    maxFear: 3
  }
];

fearLevels = ['calm', 'hesitant', 'distressed', 'scared', 'terrified']

state = {
  "currentGold": 12,
  "minFear": 0,
  "maxFear": 4,
  "changeFear": 0
}

bargainGold = 0;
delay = 0;

function init() {
  $('.command').hide();
  $('#input-number').on('keydown', allowNumbersOnly);
  $('#act').on('click', demandGold);
  $('#accept').on('click', acceptOffer);
  $('#reject').on('click', rejectOffer);
  
  delay = 500;
  addAction('I am a troll.');
  var localState = localStorage.getItem('MeTroll');
  if (localState) {
    state = JSON.parse(localState);
    addAction('I guard the bridge.', checkTime);
  } else {
    saveState();
    addAction('I guard the bridge.', newTraveler);
  }
}

function checkTime() {
  var date = new Date();
  var dateDiff = Math.floor((date.getTime() - state.timestamp) / (1000 * 60 * 60 * 24));
  var chieftainGold = 0;
  for (var i = 0; i < dateDiff; i++) {
    if (state.currentGold === 0) {
      break;
    }
    var percentage = Math.floor(Math.random() * 6) + 5;
    var gold = Math.round(state.currentGold * percentage / 100);
    if (gold < 5) {
      gold = state.currentGold < 5 ? state.currentGold : 5;
    }
    chieftainGold += gold;
    state.currentGold -= gold;
  }

  if (chieftainGold === 0) {
    addAction('Looks like the chieftain didn\'t disturb my pile of gold while I was gone.');
    addAction('Good.');
    updateGold();
  } else {
    addAction('My pile of gold is smaller than before.');
    addAction('The chieftain collected his tax.');
    var coinOrCoins = chieftainGold === 1 ? ' coin.' : ' coins.';
    addAction('I lost ' + chieftainGold + coinOrCoins);
    updateGold();
  }
}

function newTraveler() {
  var index = Math.floor(Math.random() * 4);
  currentType = travelerTypes[index];
  currentTraveler = {
    type: currentType.type,
    looks: currentType.looks[Math.floor(Math.random()*currentType.looks.length)],
    gold: Math.floor(Math.random() * (currentType.maxGold - currentType.minGold) + currentType.minGold),
    fear: Math.floor(Math.random() * (currentType.maxFear - currentType.minFear) + currentType.minFear)
  };

  if (currentTraveler.fear < state.minFear) {
    currentTraveler.fear = state.minFear;
  } else if (currentTraveler.fear > state.maxFear) {
    currentTraveler.fear = state.maxFear;
  }

  delay = 1500;
  addAction('...');
  addAction('Here comes a traveler.');
  addAction('They seem to be ' + currentTraveler.looks + '.');
  addAction('They look ' + fearLevels[currentTraveler.fear] + '.');
  addAction('How much should I charge them?', prepareDemand);
}

function prepareDemand() {
  $('#input-number').val('').prop({ max: 100, min: 0 });
  $('#input-number').focus();
  $('#instructions').text('Input a value between 0 and 100');
  $('#demand-gold').show();
}

function demandGold() {
  $('#demand-gold').hide();
  delay = 500;
  addAction('...');
  var gold = $('#input-number').val() === '' ? 0 : parseInt($('#input-number').val());
  if (gold === 0) {
    addAction('"You. Leave.", I say. "You can pass."');
    addAction('"What..?", they ask, in confusion.');
    addAction('"Go, before I change my mind!", I roar.');
    addAction('I watch as they scramble away and add the coins to my current stash.');
    if (state.minFear > 0) {
      state.minFear--;
    } else if (state.maxFear > 0) {
      state.maxFear--;
    }
    state.changeFear = 0;
    addAction('Am I going soft..?', newTraveler);
  } else {
    var coinOrCoins = gold === 1 ? 'coin' : 'coins';
    addAction('"Stop.", I say. "Pay ' + gold + ' ' + coinOrCoins + ' or leave, human."');
    addAction('My human speech is pretty rough, but I can see they understand.', resolveGold, gold);
  }
}

function resolveGold(gold) {
  if (currentTraveler.gold === 0) {
    travelerBegs();
  } else if (gold < Math.ceil(currentTraveler.gold / 2)) {
    travelerPays(gold);
  } else {
    var bargainChance = Math.floor(Math.random()*fearLevels.length);
    if ((gold > currentTraveler.gold) || (bargainChance >= currentTraveler.fear)) {
        travelerBargains(gold);
    } else {
      travelerPays(gold);
    }
  }
}

function travelerPays(gold) {
  state.currentGold += parseInt(gold);
  delay = 500;
  addAction('...');
  addAction('Their shoulders sag in acceptance.');
  addAction('"Alright.", they say, handing me the gold I demanded.');
  var coinOrCoins = gold === 1 ? 'coin' : 'coins';
  addAction('I wave them away and add the ' + coinOrCoins + ' to my current stash.');
  updateGold();
}

function travelerBargains(gold) {
  var maxGold = currentTraveler.gold > gold ? gold - 1 : currentTraveler.gold - 1;
  bargainGold = Math.ceil(Math.random() * maxGold) + 1;
  delay = 500;
  addAction('...');
  addAction('"I can\'t pay that much!", the traveler begs.');
  addAction('"What about ' + bargainGold + '? That I can pay!"', prepareAction);
}

function travelerBegs() {
  delay = 500;
  addAction('...');
  addAction('"I have no money! I cannot pay!", they cry.');
  addAction('"Please, let me pass!"', prepareAction);
}

function prepareAction() {
  $('#input-text').show().val('');
  $('#instructions').show().text('Accept or Reject?');
  $('#accept-or-reject').show();
}

function acceptOffer() {
  $('#accept-or-reject').hide();
  delay = 500;
  addAction('...');
  addAction('"Alright.", I nod in acceptance. Some money is better than no money.');
  var coinOrCoins = bargainGold === 1 ? 'coin' : 'coins';
  addAction('I watch as they scramble away and add the ' + coinOrCoins + ' to my current stash.');
  state.changeFear--;
  if (state.changeFear <= -3) {
    if (state.minFear > 0) {
      state.minFear--;
      addAction('Am I going soft..?');
    } else if (state.maxFear > 0) {
      state.maxFear--;
      addAction('Am I going soft..?');
    }
    state.changeFear = 0;
  }
  state.currentGold += parseInt(bargainGold);
  updateGold();
}

function rejectOffer() {
  $('#accept-or-reject').hide();
  delay = 500;
  addAction('...');
  addAction('I can\'t accept that.');
  addAction('I roar, launching myself at the traveler.');
  addAction('Soon enough, they\'re dead.');
  state.changeFear++;
  if (state.changeFear >= 3) {
    if (state.maxFear < fearLevels.length - 1) {
      state.maxFear++;
      addAction('They\'ll think twice before challenging me.');
    } else if (state.minFear < fearLevels.length - 1) {
      state.minFear++;
      addAction('They\'ll think twice before challenging me.');
    }
    state.changeFear = 0;
  }
  updateGold();
}

function updateGold() {
  var coinOrCoins = state.currentGold === 1 ? ' coin.' : ' coins.';
  addAction('I currently have ' + state.currentGold + coinOrCoins, newTraveler);
  saveState();
}

function addAction(text, callback, params) {
  setTimeout(function() {
    $('#actions').append('<span>' + text + '</span>');
    if (callback) {
      callback(params);
    }
  }, delay);
  delay += 1500;
}

function allowNumbersOnly(e) {
  // Allow: backspace, delete, tab, escape, enter
  if (e.key === 'Enter') {
      e.preventDefault();
    return;
  }

  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
        // Allow: Ctrl+A, Command+A
      (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || 
        // Allow: home, end, left, right, down, up
      (e.keyCode >= 35 && e.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
  }

  // Ensure that it is a number and stop the keypress
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
  } else {
    var newGold = $('#input-number').val() + e.key;
    if (parseInt(newGold) > 100) {
      e.preventDefault();
    }
  }
}

function saveState() {
  state.timestamp = new Date().getTime();
  localStorage.setItem('MeTroll', JSON.stringify(state));
}