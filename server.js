"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const grpc = require('grpc')
const {RNode, RHOCore} = require("rchain-api") //npm install --save github:JoshOrndorff/RChain-API

// Connect to the RNode
var host   = process.argv[2] ? process.argv[2] : "localhost"
var port   = process.argv[3] ? process.argv[3] : 40401
var uiPort = process.argv[4] ? process.argv[4] : 8080

// Start the express app
var myNode = RNode(grpc, {host, port})
var app = express()
app.use(bodyParser.json())
app.use(express.static(__dirname))

app.listen(uiPort, () => {
  console.log("Nth Caller Dapp server started.")
  console.log(`Connected to RNode at ${host}:${port}.`)
  console.log(`started on ${uiPort}`)
})




// Handle users registering new games
app.post('/register', (req, res) => {
  var code = `@"nthCallerFactory"!("${req.body.id}", ${req.body.n})`
  var deployData = {term: code,
                     timestamp: new Date().valueOf()
                     // from: '0x1',
                     // nonce: 0,
                   }

  myNode.doDeploy(deployData).then(result => {
    return myNode.createBlock()
  }).then(result => {
    res.end(JSON.stringify({message: result}))
  }).catch(oops => { console.log(oops); })
})



// Handle users calling in to win
app.post('/call', (req, res) => {

  // TODO this should be unforgeable. Can I make one from JS?
  var ack = Math.random().toString(36).substring(7)

  var code = `@"${req.body.id}"!("${req.body.name}", "${ack}")`
  var deployData = {term: code,
                    timestamp: new Date().valueOf()
                    // from: '0x1',
                    // nonce: 0,
                   }

  myNode.doDeploy(deployData).then(_ => {
    return myNode.createBlock()
  }).then(_ => {
    // Get the data from the node
    return myNode.listenForDataAtName(ack)
  }).then((blockResults) => {
    console.log(blockResults.length)
    if(blockResults.length === 0){
      // TODO how to handle case there no blocks come back
      console.warn("No blocks returned! Should get 404")
      res.code = 404
      res.end("No data found")
      return // Do I need return here?
    }
    var lastBlock = blockResults.slice(-1).pop()
    var lastDatum = lastBlock.postBlockData.slice(-1).pop()
    res.end(JSON.stringify({message: RHOCore.toRholang(lastDatum)}))
  }).catch(oops => { console.log(oops); })
})
