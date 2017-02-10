travelerTypes = [
  {
    type: 'Poor',
    minGold: 0,
    maxGold: 10,
    looks: [ 'They wear a travel cape over their clothes, a backpack on their shoulders.',
             'They look weak and weary, as if they haven\'t seen food in days.',
             'Their clothes are simple, worn. They\'re clothes of a hard worker.',
             'Judging by their looks, they\'ve seen better days.' ],
    minFear: 3,
    maxFear: 5
  },
  {
    type: 'Lower Class',
    minGold: 11,
    maxGold: 40,
    looks: [ 'They wear a travel cape over their clothes, a backpack on their shoulders.',
             'Their clothes are simple, worn. They\'re clothes of a hard worker.',
             'They seem to have walked quite a bit to get here, yet they don\'t look tired.',
             'They have strong, callous hands, the result of years of hard work.' ],
    minFear: 2,
    maxFear: 5
  },
  {
    type: 'Middle Class',
    minGold: 41,
    maxGold: 80,
    looks: [ 'They wear a travel cape over their clothes, a backpack on their shoulders.',
             'They seem to have walked quite a bit to get here, yet they don\'t look tired.',
             'They have clean clothes, and seem to know their way around the land.',
             'They look healthy and well fed, sharp eyes looking ahead on the road.'],
    minFear: 1,
    maxFear: 5
  },
  {
    type: 'Upper Class',
    minGold: 81,
    maxGold: 100,
    looks: [ 'They wear a travel cape over their clothes, a backpack on their shoulders.',
             'They have clean clothes, and seem to know their way around the land.',
             'Their clothes look expensive. You don\'t see these types around too much.',
             'They walk with a different gait. More... proper, one would say.'],
    minFear: 0,
    maxFear: 4
  }
];

fearLevels = [
  { 
    description: 'daring',
    acceptance:  ['They let out a chuckle and shake their head.',
                  '"Here\'s your tax, troll.", they say, letting the coins fall on the ground as they walk past me.',
                  'I grunt and huff, collecting them as I secretly wish for that one to die a painful death.'],
    rejection: '"Hah!", they scoff. "No way I\'m paying that."',
    bargain: 'They throw $coin coins at my feet, chuckling as they make their way past me.',
    nopay: 'They let out a snort, smirking as they attempt to walk past me.'
  },
  { 
    description: 'calm',
    acceptance: ['"Alright.", they say, with a nod.',
                 'They reach into a pouch, collecting the coins and handing them over before stepping on the bridge.',
                 'I watch them go for a few moments before storing the coins in my stash.'],
    rejection: '"That\'s a bit too much, isn\'t it?", they ponder.',
    bargain: '"What about $coin coins? That\'s more affordable, and also fair."'
  },
  { 
    description: 'hesitant',
    acceptance: ['Their shoulders sag in acceptance. "O-okay. Just a moment."',
                 'They hand me a pouch cointaining all the coins before leaving, looking over their shoulders.',
                 'Silly. I don\'t need to follow him. He paid.'],
    rejection: '"I... I don\'t carry that much coin.", they mumble, fiddling with their coin pouch.',
    bargain: '"Would $coin be enough?"'
  },
  { 
    description: 'distressed',
    acceptance: ['"...okay. Okay, I\'ll... okay.", they whisper, reaching towards their belt.',
                 'They unclip a coin pouch from their belt, counting the coins quickly before putting them on my outstretched hand and hurrying away.',
                 'I can hear their steps as I stash the coins away.'],
    rejection: 'I hear them curse as they run a hand through their hair. "I can\'t... I can\'t pay that."',
    bargain: '"I can only afford $coin coins. Please, troll, sir, ma\'am, let me pass."'
  },
  { 
    description: 'scared',
    acceptance: ['I can see a wave of relief passing through their face.',
                 '"H-here you... here you go.", they mumble, setting the coins on a pile before walking towards the bridge, eyes glancing at me.',
                 'I don\'t look at them. I only need their coin.'],
    rejection: 'Their face go white, hands shaking as they reach for their coins.',
    bargain: '"I don\'t... I...", they mumble. "$coin coins, that\'s all I can g-give you."'
  },
  { 
    description: 'terrified',
    acceptance: ['It takes a moment for them to understand my request, giving a trembling nod in reply.',
                 'They hurry to give me the payment, pretty much dropping the coins on the floor before rushing away, unable to even look at me.',
                 'I watch as they scramble away before collecting my coins, putting them in my stash.'],
    rejection: 'Their legs give away, and I could smell their fear from miles away.',
    bargain: '"I-I beg you...", they whisper, laying out $coin on the ground. "P-please, let... p-please, I have to pass..!"'
  }
];

chieftainTax = {
  minPercentage: 5,
  maxPercentage: 10,
  undisturbed: ['Looks like the chieftain didn\'t disturb my pile of gold while I was gone.', 'Good.'],
  disturbed: ['My pile of gold is smaller than before.',
              'The chieftain collected his tax.',
              'I lost $coin coins.']
}

slayedTroll = [ '...',
                'Here comes a traveler.',
                'I hear more footsteps. There\'s another with them.',
                'Many others. Before I can react, I am surrounded.',
                'This is not good.',
                'I fight, I yell, I roar, but I am one, and they are many. I managed to defeat some of them, but it isn\'t long until my body cannot take it anymore.',
                'I fall, defeated in battle.',
                'As I die, I hear their captain talk about the fat bounty they\'ll get when they deliver my head to their boss.',
                'The last sound I hear is the axe coming down onto my neck.']

state = {
  currentGold: 0,
  minFear: 0,
  maxFear: fearLevels.length - 1,
  changeFear: 0
}

bargainGold = 0;
delay = 0;

function init() {
  $("#actions").empty();
  $('.command').hide();
  $('#input-number').on('keydown', allowNumbersOnly);
  $('#act').on('click', demandGold);
  $('#accept').on('click', acceptOffer);
  $('#reject').on('click', rejectOffer);
  $('#restart').on('click', startGame);
  
  startGame();
}

function startGame() {
  delay = 1500;
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
    var percentage = Math.floor(Math.random() * (chieftainTax.maxPercentage - chieftainTax.minPercentage + 1)) + chieftainTax.minPercentage;
    var gold = Math.round(state.currentGold * percentage / 100);
    if (gold < 5) {
      gold = state.currentGold < 5 ? state.currentGold : 5;
    }
    chieftainGold += gold;
    state.currentGold -= gold;
  }

  delay = 1500;
  if (chieftainGold === 0) {
    addMultiple(chieftainTax.undisturbed);
  } else {
    addMultiple(chieftainTax.disturbed, chieftainGold);
  }
  updateGold();
}

function newTraveler() {
  var gold = Math.floor(Math.random() * 101);
  var type = 0;
  while (gold > travelerTypes[type].maxGold) {
    type++;
  }
  var currentType = travelerTypes[type];
  currentTraveler = {
    type: type,
    looks: currentType.looks[Math.floor(Math.random()*currentType.looks.length)],
    gold: gold,
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
  addAction(currentTraveler.looks);
  addAction('They look ' + fearLevels[currentTraveler.fear].description + '.');
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
  delay = 1500;
  addAction('...');
  var gold = $('#input-number').val() === '' ? 0 : parseInt($('#input-number').val());
  if (gold === 0) {
    addAction('"You. Leave.", I say. "You can pass."');
    addAction('"What..?", they ask, in confusion.');
    addAction('"Go, before I change my mind!", I roar.');
    addAction('And with that, they leave. No looking back.');
    reduceFear(true);
  } else {
    var coinOrCoins = gold === 1 ? 'coin' : 'coins';
    addAction('"Stop.", I say. "Pay ' + gold + ' ' + coinOrCoins + ' or leave, human."');
    addAction('My human speech is pretty rough, but I can see they understand.', resolveGold, gold);
  }
}

function resolveGold(gold) {
  gold = parseInt(gold);
  if (currentTraveler.gold === 0) {
    bargainGold = 0;
    travelerBegs();
  } else {
    var maxPercentage = (30 + (currentTraveler.fear * 10)) / 100;
    if (gold <= Math.ceil(currentTraveler.gold * maxPercentage)) {
      travelerPays(gold);
    } else {
      travelerBargains(gold);
    }
  }
}

function travelerPays(gold) {
  state.currentGold += parseInt(gold);
  delay = 1500;
  addAction('...');
  var fearLevel = fearLevels[currentTraveler.fear];
  addMultiple(fearLevel.acceptance, gold);
  updateGold();
}

function travelerBargains(gold) {
  if (currentTraveler.fear === 0) {
    var noPay = Math.round(Math.random());
  }
  
  var maxGold = currentTraveler.gold > gold ? gold - 1 : currentTraveler.gold - 1;
  var minGold = Math.round(currentTraveler.gold * (currentTraveler.fear * 10) / 100);
  bargainGold = Math.ceil(Math.random() * maxGold) + minGold;
  if (bargainGold > maxGold) {
    bargainGold = maxGold;
  }
  delay = 1500;
  addAction('...');
  var fearLevel = fearLevels[currentTraveler.fear];
  addAction(fearLevel.rejection);
  if (noPay) {
    bargainGold = 0;
    addAction(fearLevel.nopay, prepareAction);
  } else {
    var bargain = fearLevel.bargain.replace('$coin', bargainGold);
    if (bargainGold === 1) {
      bargain = bargain.replace(/coins/g, 'coin');
    }
    addAction(bargain, prepareAction);
  }
}

function travelerBegs() {
  delay = 1500;
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
  delay = 1500;
  addAction('...');
  if (bargainGold === 0) {
    if (currentTraveler.fear === 0) {
      addAction('Such mockery. Such arrogance.');
      addAction('Yet, I didn\'t react. I let them leave, feeling my pride shatter.');
      reduceFear(true);
    } else {
      addAction('This one has nothing left, it seems. Nothing I can take..');
      addAction('"You can pass, this time.", I say. "But don\'t come back until you get coin."');
      addAction('They thank me and rush past me, crossing the bridge before have a chance to change my mind.')
      reduceFear(true);
    }
  } else {
    var fearLevel = fearLevels[currentTraveler.fear];
    var acceptLines = fearLevel.acceptance.slice(1);
    addAction('"Alright.", I nod in acceptance. Some money is better than no money.');
    addMultiple(acceptLines);
    state.currentGold += parseInt(bargainGold);
    reduceFear();
  }
}

function rejectOffer() {
  $('#accept-or-reject').hide();
  delay = 1500;
  addAction('...');
  addAction('I can\'t accept that.');
  addAction('I roar, launching myself at the traveler.');
  addAction('Soon enough, they\'re dead.');
  if (currentTraveler.gold > 0) {
    addAction('I grab their coin pouch, adding its contents to my stash.');
    state.currentGold += currentTraveler.gold;
  }
  increaseFear();
}

function reduceFear(force) {
  state.changeFear -= currentTraveler.type - 1;

  if ((state.changeFear <= -travelerTypes.length) || (force)) {
    if (state.minFear > 0) {
      state.minFear--;
    } else if (state.maxFear > 0) {
      state.maxFear--;
    }
    state.changeFear = 0;
    addAction('Am I going soft..?');
  }
  updateGold();
}

function increaseFear() {
  state.changeFear += currentTraveler.type + 1;
  if (state.changeFear >= travelerTypes.length) {
    if (state.maxFear < fearLevels.length - 1) {
      state.maxFear++;
    } else if (state.minFear < fearLevels.length - 1) {
      state.minFear++;
    }
    state.changeFear = 0;
    addAction('They\'ll think twice before challenging me.');
  }
  updateGold();
}

function updateGold() {
  var coinOrCoins = state.currentGold === 1 ? ' coin.' : ' coins.';
  addAction('I currently have ' + state.currentGold + coinOrCoins, checkDanger);
  saveState();
}

function checkDanger() {
  var dangerLevel = state.minFear + state.maxFear - (fearLevels.length - 1);
  if (dangerLevel > 0) {
    var increment = 100 / fearLevels.length;
    var attackChance = Math.ceil(Math.random() * 100);
    console.log("Danger", dangerLevel);
    console.log("increment", increment);
    console.log('Chance', attackChance);
    if (attackChance <= increment * dangerLevel) {
      state = {
        currentGold: 0,
        minFear: 0,
        maxFear: fearLevels.length - 1,
        changeFear: 0
      };
      saveState();
      delay = 1500;
      addMultiple(slayedTroll);
      addAction(null, function() {
        $('#restart').show();
      });
    } else {
      newTraveler();
    }
  } else {
    newTraveler();
  }
}

function addAction(text, callback, params) {
  setTimeout(function() {
    if (text) {
      $('#actions').append('<span>' + text + '</span>');
    }
    if (callback) {
      callback(params);
    }
  }, delay);
  delay += 1500;
}

function addMultiple(array, gold) {
  for (var i = 0; i < array.length; i++) {
    var line = array[i];
    if (gold) {
      if ((line.indexOf('coins') > -1) && (parseInt(gold) === 1)) {
        line = line.replace(/coins/g, 'coin');
      }
      if (line.indexOf('$coin') > -1) {
        line = line.replace('$coin', gold.toString())
      }
    }
    addAction(line);
  }
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