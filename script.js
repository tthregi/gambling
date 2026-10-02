(function(){
  "use strict";

  var TIERS = [
    { p: 0.001, mult: 100, key: "jackpot" },
    { p: 0.010, mult: 8,   key: "medium"  },
    { p: 0.360, mult: 2,   key: "small"   },
    { p: 0.629, mult: 0,   key: "none"    }
  ];

  function rollTier(){
    var r = Math.random();
    var acc = 0;
    for (var i = 0; i < TIERS.length; i++){
      acc += TIERS[i].p;
      if (r < acc) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  var OFFSYMS = ["⭐","🍋","🍇","🍀"];

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function symbolsFor(tier){
    if (tier.key === "jackpot") return ["7️⃣","7️⃣","7️⃣"];
    if (tier.key === "medium")  return ["🔔","🔔","🔔"];
    if (tier.key === "small")   return ["🍒","🍒","🍒"];
    if (Math.random() < 0.5){
      var s = pick(["🍒","🔔"]);
      var off = pick(OFFSYMS);
      var res = [s, s, off];
      for (var i = res.length - 1; i > 0; i--){
        var j = Math.floor(Math.random()*(i+1));
        var t = res[i]; res[i] = res[j]; res[j] = t;
      }
      return { arr: res, nearMiss: true };
    }
    return { arr: [pick(OFFSYMS), pick(OFFSYMS), pick(OFFSYMS)], nearMiss: false };
  }

  var START_BALANCE = 20;
  var state = {
    balance: START_BALANCE,
    spins: 0,
    staked: 0,
    won: 0
  };

  var el = {
    reel0: document.getElementById("reel0"),
    reel1: document.getElementById("reel1"),
    reel2: document.getElementById("reel2"),
    spinBtn: document.getElementById("spinBtn"),
    msg: document.getElementById("msg"),
    balance: document.getElementById("statBalance"),
    spins: document.getElementById("statSpins"),
    staked: document.getElementById("statStaked"),
    won: document.getElementById("statWon"),
    net: document.getElementById("statNet"),
    expected: document.getElementById("statExpected"),
    resetBtn: document.getElementById("resetBtn")
  };

  function renderStats(){
    el.balance.textContent = state.balance;
    el.spins.textContent = state.spins;
    el.staked.textContent = state.staked;
    el.won.textContent = state.won;
    var net = state.won - state.staked;
    el.net.textContent = (net > 0 ? "+" : "") + net;
    el.net.className = "val mono " + (net < 0 ? "neg" : (net > 0 ? "pos" : ""));
    var expected = Math.round(state.staked * -0.10 * 10) / 10;
    el.expected.textContent = (expected === 0 ? "0" : expected);
  }

  function setReels(arr){
    el.reel0.textContent = arr[0];
    el.reel1.textContent = arr[1];
    el.reel2.textContent = arr[2];
  }

  function doSpin(){
    if (state.balance < 1){
      el.msg.textContent = "Elfogytak a zsetonjaid — pontosan ez a lényeg.";
      el.spinBtn.disabled = true;
      return;
    }
    el.spinBtn.disabled = true;
    [el.reel0, el.reel1, el.reel2].forEach(function(r){ r.classList.add("spin"); });

    var tier = rollTier();
    var symResult = symbolsFor(tier);
    var arr = symResult.arr ? symResult.arr : symResult;

    state.balance -= 1;
    state.staked += 1;
    state.spins += 1;

    setTimeout(function(){
      setReels(arr);
      [el.reel0, el.reel1, el.reel2].forEach(function(r){ r.classList.remove("spin"); });

      var payout = tier.mult;
      state.balance += payout;
      state.won += payout;
      renderStats();

      if (tier.key === "jackpot"){
        el.msg.textContent = "Főnyeremény! Ez 1000-ből kb. egyszer fordul elő.";
        el.msg.className = "msg win";
      } else if (tier.key === "medium"){
        el.msg.textContent = "Szép nyeremény — de ez a ritka eset, nem a szabály.";
        el.msg.className = "msg win";
      } else if (tier.key === "small"){
        el.msg.textContent = "Kis nyeremény. Ez tartja életben az érzést, hogy „megy ez”.";
        el.msg.className = "msg win";
      } else if (symResult.nearMiss){
        el.msg.textContent = "Majdnem! De ez pontosan ugyanolyan vesztés, mint bármelyik másik.";
        el.msg.className = "msg nearmiss";
      } else {
        el.msg.textContent = "Nincs nyeremény.";
        el.msg.className = "msg";
      }

      el.spinBtn.disabled = state.balance < 1;
      if (state.balance < 1){
        el.msg.textContent += " Elfogytak a zsetonjaid.";
      }
    }, 550);
  }

  el.spinBtn.addEventListener("click", doSpin);

  el.resetBtn.addEventListener("click", function(){
    state = { balance: START_BALANCE, spins: 0, staked: 0, won: 0 };
    renderStats();
    setReels(["🍒","🔔","⭐"]);
    el.msg.textContent = START_BALANCE + " zsetonnal indulsz.";
    el.msg.className = "msg";
    el.spinBtn.disabled = false;
  });

  renderStats();


})();


