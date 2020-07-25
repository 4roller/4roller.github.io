let cw = (

  function () {
    const d = document;
    let totalWeight, pError;
    let cwFL, cwFR, cwRL, cwRR;
    let wrFront, wrLeft, wrRight, wrRear;
    let calculate, reset, save, name;

    const mySelecta = function () {
      totalWeight = d.querySelector('#totalWeight');
      cwFL = d.querySelector('#cw-fl');
      cwFR = d.querySelector('#cw-fr');
      cwRL = d.querySelector('#cw-rl');
      cwRR = d.querySelector('#cw-rr');
      wrFront = d.querySelector('#wr-front');
      wrRear = d.querySelector('#wr-rear');
      wrLeft = d.querySelector('#wr-left');
      wrRight = d.querySelector('#wr-right');
      pError = d.querySelector('#percentError');
      calculate = d.querySelector('#calculate');
      reset = d.querySelector('#reset');
      save = d.querySelector('#save')
      name = d.querySelector('#name');
    };

    const attachListeners = function () {
      calculate.addEventListener('click', () => cw.calculate());
      totalWeight.addEventListener('change', () => cw.calculate());
      cwFL.addEventListener('change', () => cw.calculate());
      cwFR.addEventListener('change', () => cw.calculate());
      cwRL.addEventListener('change', () => cw.calculate());
      cwRR.addEventListener('change', () => cw.calculate());
      reset.addEventListener('click', () => cw.reset());
      save.addEventListener('click', () => cw.save());
    }

    const populateFromCache = function () {
      let keys = Object.keys(window.localStorage);
      let firstKey = keys[keys.length - 1];
      console.log(firstKey);
      if (firstKey) {
        console.log("found saved");

        name.value = firstKey;
        weightStrings = window.localStorage.getItem([firstKey]);
        let arr = weightStrings.split(',');
        console.log(arr);
        totalWeight.value = arr[0];
        cwFL.value = arr[1];
        cwFR.value = arr[2];
        cwRL.value = arr[3];
        cwRR.value = arr[4];
      }
    }

    return {
      init: function () {
        mySelecta();
        attachListeners();
        populateFromCache();
        cw.calculate();
      },

      reset: () => {
        let cwArr = [cwFL, cwFR, cwRL, cwRR, wrFront, wrRear, wrLeft, wrRight, totalWeight];
        cwArr.forEach(el => {
          el.value = 0;
        });
        name.value = "--- --- ---";
      },

      save: () => {
        let saveItemsArr = [totalWeight.value, cwFL.value, cwFR.value, cwRL.value, cwRR.value];
        window.localStorage.setItem(name.value, saveItemsArr);
        console.log(window.localStorage);
      },

      calculate: () => {
        console.log('calulating');
        const totalWeightInt = parseInt(totalWeight.value);
        const FLint = parseInt(cwFL.value);
        const FRint = parseInt(cwFR.value);
        const RLint = parseInt(cwRL.value);
        const RRint = parseInt(cwRR.value);

        wrFront.value = ((FLint + FRint) / totalWeightInt * 100).toFixed(2);
        wrRear.value = ((RLint + RRint) / totalWeightInt * 100).toFixed(2);
        wrLeft.value = ((FLint + RLint) / totalWeightInt * 100).toFixed(2);
        wrRight.value = ((FRint + RRint) / totalWeightInt * 100).toFixed(2);
        let cornerTotal = FLint + FRint + RLint + RRint;
        let errorAmount = (1 - (cornerTotal / totalWeightInt)).toFixed(2);
        pError.innerHTML = "";
        if (errorAmount > 0 || errorAmount < 0) {
          pError.innerHTML = "~" + errorAmount + "% error";
        }

      },


    }

  }


)();

window.onload = function () {
  cw.init();
};
