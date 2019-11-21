const { exec } = require('child_process');


/*

- id: "1"
  baseassetdenom: uftm
  quoteassetdenom: uzar
  name: uftm/uzar

*/

const market = "uftm/uzar"
const targetprice = 1627700

setInterval(fillOrders, 1000)

function fillOrders() {

  flip = getRandomInt(2)
  side = "bid"
  price = getRandomIntInclusive(100000,1627799)
  quantity = getRandomIntInclusive(1000000,10000000)

  console.log(flip)
  if (flip==0) {
    side = "ask"
    price = getRandomIntInclusive(1627701,20000000)
    quantity = getRandomIntInclusive(1000000,10000000)
  }


  command = "xarcli tx order post 1 "+side+" "+price+" "+quantity+" 600 --from xar-validator-12 --chain-id=xar-chain-panda-12 -y"
  exec(command, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
