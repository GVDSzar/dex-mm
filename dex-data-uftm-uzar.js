const { exec } = require('child_process');
const zar = require('@zar-network/javascript-sdk')
const ecc = require("tiny-secp256k1")
const hexEncoding = require("crypto-js/enc-hex")
const SHA256 = require("crypto-js/sha256")
const request = require('request')
const axios = require('axios')
const PKEY = ''

const EC = require('elliptic').ec;
const CURVE = "secp256k1"
/*

- id: "1"
  baseassetdenom: uftm
  quoteassetdenom: uzar
  name: uftm/uzar

*/

const market = "uftm/uzar"
const targetprice = 1627700

const generatePubKey = privateKey => {
  const curve = new EC(CURVE)
  const keypair = curve.keyFromPrivate(privateKey)
  const pubKeyHex = keypair.getPublic(true, 'hex')
  return {type:"tendermint/PubKeySecp256k1",value:Buffer.from(pubKeyHex, 'hex').toString('base64')}
}

const sortObject = obj => {
  if (obj === null) return null
  if (typeof obj !== "object") return obj
  // arrays have typeof "object" in js!
  if (Array.isArray(obj))
    return obj.map(sortObject)
  const sortedKeys = Object.keys(obj).sort()
  const result = {}
  sortedKeys.forEach(key => {
    result[key] = sortObject(obj[key])
  })
  return result
}
const sha256 = (hex) => {
  if (typeof hex !== "string") throw new Error("sha256 expects a hex string")
  if (hex.length % 2 !== 0) throw new Error(`invalid hex string length: ${hex}`)
  const hexEncoded = hexEncoding.parse(hex)
  return SHA256(hexEncoded).toString()
}
const generateSignature = (signBytesHex, privateKey) => {
  const msgHash = sha256(signBytesHex)
  const msgHashHex = Buffer.from(msgHash, "hex")
  const signature = ecc.sign(msgHashHex, Buffer.from(privateKey, "hex")) // enc ignored if buffer
  return signature.toString("base64")
}

function serialize(tx) {
  if (!tx.signatures) {
    throw new Error("need signature")
  }

  let msg = tx.msgs[0]

  const stdTx = {
    tx: {
      msg: [msg],
      signatures: tx.signatures,
      memo: tx.memo,
      type: tx.type,
      fee: {
        amount: [],
        gas: "200000"
      }
    },
    mode: tx.mode,
  }

  return JSON.stringify(stdTx)
}

function sendTransaction(signedTx) {
  const signedBz = serialize(signedTx)
  return sendRawTransaction(signedBz)
}

function sendRawTransaction(signedBz) {
  const options = {
    method: "post",
    url: "http://54.194.212.72:1317/txs",
    data: signedBz,
    headers: {
      "content-type": "text/plain",
    }
  }
  axios.request(options)
  .then((res) => {
    console.log(res.data)
    setTimeout(fillOrders, 1000);
  })
  .catch((error) => {
    console.error(error)
  })
}

//setInterval(fillOrders, 1000)
fillOrders()

function fillOrders() {

  request('http://54.194.212.72:1317/auth/accounts/xar18x4jd345dwz49rgvjdyupghd4meg9caf0cx7ww', function (error, response, body) {

    if (error) {
      console.log(error)
    } else {
      var json = ''
      try {
        json = JSON.parse(body)
      } catch (err) {
        console.log(err)
      }
      var account_number = json.result.value.account_number
      var sequence = json.result.value.sequence
      flip = getRandomInt(2)
      side = "bid"
      price = getRandomIntInclusive(1000000,1637799)
      quantity = getRandomIntInclusive(1000000,10000000)

      if (flip==0) {
        side = "ask"
        price = getRandomIntInclusive(1607701,2000000)
        quantity = getRandomIntInclusive(1000000,10000000)
      }

      var msg = {
        value: {
          Direction: side.toUpperCase(),
          MarketID: "1",
          Owner: "xar18x4jd345dwz49rgvjdyupghd4meg9caf0cx7ww",
          Price: price.toString(),
          Quantity: quantity.toString(),
          TimeInForce: 600,
        },
        type: "order/Post",
      }


      broadcastTx = sign(PKEY,msg, account_number, sequence)
      sendTransaction(broadcastTx)
    }
  })
}


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
/**
* generate the sign bytes for a transaction, given a msg
* @param {Object} concrete msg object
* @return {Buffer}
**/
function getSignBytes(message, msg) {
 if (!msg) {
   throw new Error("msg should be an object")
 }
 const fee = {
   amount: [],
   gas: "200000"
 }

 const signMsg = {
   "account_number": message.account_number.toString(),
   "chain_id": message.chain_id,
   "fee": fee,
   "memo": message.memo,
   "msgs": [msg.value],
   "sequence": message.sequence.toString(),
 }
 console.log(JSON.stringify(sortObject(signMsg)))
 return Buffer.from(JSON.stringify(sortObject(signMsg)))
}

/**
* attaches a signature to the transaction
* @param {Elliptic.PublicKey} pubKey
* @param {Buffer} signature
* @return {Transaction}
**/
function addSignature(message, pubKey, signature) {
 message.signatures = [{
   pub_key: pubKey,
   signature: signature,
 }]
 return message
}

/**
* sign transaction with a given private key and msg
* @param {string} privateKey private key hex string
* @param {Object} concrete msg object
* @return {Transaction}
**/
function sign(privateKey, msg, account_number, sequence) {
 if(!privateKey){
   throw new Error("private key should not be null")
 }

 if(!msg){
   throw new Error("signing message should not be null")
 }

 var message = {
   type:'cosmos-sdk/StdTx',
   sequence:sequence,
   account_number:account_number,
   chain_id:'xar-chain-zafx',
   msgs: [msg],
   memo: '',
   source: '',
   mode: 'sync',
 }

 const signBytes = getSignBytes(message, msg)
 const privKeyBuf = Buffer.from(privateKey, "hex")
 const signature = generateSignature(signBytes.toString("hex"), privKeyBuf)
 message = addSignature(message, generatePubKey(privKeyBuf), signature)
 return message
}
