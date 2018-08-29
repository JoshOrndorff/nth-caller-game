"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const grpc = require('grpc')
const {RNode, RHOCore} = require("rchain-api")

// Parse command-line arguments
var host   = process.argv[2] ? process.argv[2] : "localhost"
var port   = process.argv[3] ? process.argv[3] : 40401
var uiPort = process.argv[4] ? process.argv[4] : 8080

// Configure the express app and RNode connection
var myNode = RNode(grpc, {host, port})
var app = express()
app.use(bodyParser.json())
app.use(express.static(__dirname))

// Start the express app
app.listen(uiPort, () => {
  console.log("Nth Caller Dapp server started.")
  console.log(`Connected to RNode at ${host}:${port}.`)
  console.log(`started on ${uiPort}`)
})




// Handle users registering new games
app.post('/register', (req, res) => {
  let code = `@"nthCallerFactory"!("${req.body.id}", ${req.body.n})`
  let deployData = {term: code,
                    timestamp: new Date().valueOf(),
                   }

  myNode.doDeploy(deployData).then(result => {
    // Force RNode to make a block immediately
    return myNode.createBlock()
  }).then(result => {
    // Send back a response
    res.end(JSON.stringify({message: result}))
  }).catch(oops => { console.log(oops); })
})



// Handle users calling in to win
app.post('/call', (req, res) => {

  // TODO this should be unforgeable. Can I make one from JS?
  let ack = Math.random().toString(36).substring(7)

  let code = `@"${req.body.id}"!("${req.body.name}", "${ack}")`
  let deployData = {term: code,
                    timestamp: new Date().valueOf(),
                   }

  myNode.doDeploy(deployData).then(_ => {
    // Force RNode to make a block immediately
    return myNode.createBlock()
  }).then(_ => {
    // Get the data from RNode
    return myNode.listenForDataAtName(ack)
  }).then((blockResults) => {
    // If no data is on RChain
    if(blockResults.length === 0){
      res.end(JSON.stringify({success: false}))
      return
    }
    // Grab back the last message sent
    var lastBlock = blockResults.slice(-1).pop()
    var lastDatum = lastBlock.postBlockData.slice(-1).pop()
    res.end(JSON.stringify(
      // Rholang process should be a string literal
      {success: true,
       message: RHOCore.toRholang(lastDatum),
     }))
  }).catch(oops => { console.log(oops); })
})
