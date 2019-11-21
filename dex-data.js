const { exec } = require('child_process');

setInterval(post, 1000)

function post() {
  price = getRandomIntInclusive(100000,2000000)
  quantity = getRandomIntInclusive(1000000,10000000)
  flip = getRandomInt(2)
  side = "bid"
  console.log(flip)
  if (flip==0) {
    side = "ask"
  }

  command = "xarcli tx order post 1 "+side+" "+price+" "+quantity+" 600 --from zafx --chain-id=xar-chain-zafx -y"
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
