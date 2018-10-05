# Write Your First Dapp
This repository is a tutorial on writing your first decentralized application on RChain. It assumes some familiarity with the command line, [RNode software](https://developer.rchain.coop), and the [node.js ecosystem](https://nodejs.org/en/). I will walk you through building a simple be-the-tenth-caller game dapp in a hands-on way. I encourage you to experiment as we move along. RChain is still in a pre-release state and its ecosystem is still developing. When we have to work around an issue with the current RNode, I do my best to point it out.

Written By: Joshy Orndorff

RNode Version: [0.6.3](https://github.com/rchain/rchain/releases/tag/v0.6.3)

## Just Make This Thing Run!
It's ~~nice~~ necessary to know what you're building before you start building it. So you may want to launch the project and play with it before you build it from scratch.

1. Install RNode ([instructions](https://blog.rchain.coop/?s=install+rnode)) (I owe you better instructions)
2. Install node.js and npm ([instructions](https://nodejs.org/en/))
3. Clone the repository `git clone https://github.com/JoshOrndorff/nth-caller-game`
4. Change into the project directory `cd nth-caller-game`
5. Install dependencies `npm install`
6. Start a fresh, pre-configured RNode `npm run fresh`
7. Deploy the rholang smart contract `npm run deploy-contract`
8. (Optional) Run the integration tests `npm test`
9. Launch the dapp frontend `npm start <RNode host> <RNode gRPC port> <frontend port>`
10. Navigate to the user interface in your favorite browser at `localhost:<frontend port>`

## Dapp Writing Fundamentals
Before we begin, let's talk game plan. These are the big-picture steps that you'll need to follow in order to write any dapp.

1. Design the smart contract -- ours is called `nthCaller.rho`
2. Design an interface -- We're using plain ugly html.
3. Connect the interface to the contract -- We'll use the RChain-API and express node modules
4. Deploy your contract
5. Use your dapp
6. Celebrate :)

## The Nth Caller Game
Local radio stations often run competitions where the hundredth caller wins tickets to a concert. This dapp allows us to play the same game on the blockchain.

Anyone can create a new nthcaller game by specifying a gameID and the number of callers needed before the game ends. After that anyone can call the smart contract and the correct caller will win. Because we're on the blockchain we are assured that the game runs fairly and correctly, and cannot be stopped or censored.


# Let's Build It!
This tutorial is written to build the project completely from scratch. All you need to get started is an empty project folder, a text editor, and a positive attitude. I encourage you to build from scratch at least once, and you'll get extra programming street-cred if you do.

For those who prefer to have the starter code already in place, you can grab it from github.
```
git clone https://github.com/JoshOrndorff/nth-caller-game
cd nth-caller-game
git checkout starter
```

## The Smart Contract
The code that runs on the blockchain is written in a [rholang](https://developer.rchain.coop/tutorial/) which was designed specifically for the concurrent computing capabilities of the RChain platform. Create a new file named `nthCaller.rho` and put this content in it

```scala
contract @"nthCallerFactory"(gameId, @n) = {
  new countCh in {

    // Count state channel starts at one
    countCh!(1)|

    // Contestants call with their name and a channel
    // to receive their result
    contract gameId(@name, result) = {

      for(@oldCount <- countCh) {

        if (n == oldCount) {
         result!("Congrats " ++ name ++ ", You win!")
        }
        else {
          result!("Sorry, " ++ name ++ ", try again.")|
          countCh!(oldCount + 1)
        }
      }
    }
  }
}
```

The contract `@"nthCallerFactory"` listens on a public name so anyone can call it with a gameID for their game, and a which caller number is the winning caller. When someone does call it, a new contract is created with it's original count set to 1. Every time a caller calls up the game contract, they provide their name. As long as the game is still going, the game contract replies by telling the caller that they won, or to try again. A nice, but subtle, feature of the game contracts is that the game automatically ends when a caller wins. Any calls made after the game is over will not be answered at all.

To get more familiar with the features of rholang, you may appreciate our [rholang tutorial](https://developer.rchain.coop/tutorial/) A new beginner-oriented tutorial will be released soon.

Before we can use this code we need to deploy it to RChain. ([RNode User Guide](https://blog.rchain.coop/?s=install+rnode))
```
# Step 1: Start a fresh RNode (in standalone mode)
$ rnode run --standalone --no-upnp --validator-private-key <your key>

# Step 2: Deploy the contract (use a second terminal)
$ rnode deploy --from 0x0 --nonce 0 --phlo-price 0 --phlo-limit 0 nthCaller.rho
```
Or if you cloned the starter code, just
```
npm run fresh
npm run deploy-contract
```

You now have the smart contract deployed to the network and ready to be used. Since we haven't written the user interface yet, let's test it with some other rholang code. Create `integrationTest.rho` with these tests written in.

```scala
new myGame, ack, stdoutAck(`rho:io:stdoutAck`) in {

  stdoutAck!("Creating new game. Third caller wins.", *ack)|
  @"nthCallerFactory"!(*myGame, 3)|

  for(_ <- ack) {
    myGame!("Alice", *ack)   | for(res <- ack) {
    stdoutAck!(*res, *ack)   | for(_ <- ack) {

    myGame!("Bob", *ack)     | for(res <- ack) {
    stdoutAck!(*res, *ack)   | for(_ <- ack) {

    myGame!("Charlie", *ack) | for(res <- ack) {
    stdoutAck!(*res, *ack)   | for(_ <- ack) {

    myGame!("Denise", *ack)  | for(res <- ack) {
    stdoutAck!(*res, *ack)
  }}}}}}}}

}
```

These tests read just like a story. A new 3rd-caller-wins game is created on the channel `myGame`. Alice, Bob, Charlie, and Denise call in in that order. Alice, and Bob called too early and are told, "sorry, try again". Charlie, calls third and wins. Denise calls too late and doesn't get an answer. All those braces are because rholang is naturally concurrent. To make the callers call in a specific order, we have to nest each call deeper than the last.

You can run these tests by deploying them to your node.
```
# If you're building from scratch
$ rnode deploy --from 0x0 --nonce 0 --phlo-price 0 --phlo-limit 0 integrationTest.rho

# If you're building from starter code
$ npm test
```

## Writing a UI
We'll write our user interface in HTML and javascript so that users can play the game in a web browser. We use `fetch` to make calls to the server. If you're not familiar with fetch, you can get a [crash course](https://www.youtube.com/watch?v=Oive66jrwBs) or just copy-paste the code I've written for you.

For now, the index.html contains some brief instructions, controls to register a new game, and a reference to our client-side javascript.
```html
<!DOCTYPE html>

<html>
<head>
  <script type="text/javascript" src="page.js"></script>
  <meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
</head>
<body>

  <p>Nth Caller game. Be the correct caller, win the prize.</p>

  <h1>Register a new game</h1>
  Game ID: <input id="new-game-id" type="text" />
  Winning Caller: <input id="n" type="number" />
  <button id="register">Register</button>

  <!--TODO Add call in feature later -->

</body>
</html>
```

The logic that handles the button click goes in `page.js`

```javascript
"use strict"

document.addEventListener("DOMContentLoaded", () => {

  // Grab DOM items
  let newGameId = document.getElementById('new-game-id')
  let n = document.getElementById('n')
  //TODO Add controls for call later

  // Event Listeners
  document.getElementById('register').addEventListener('click', register)
  //TODO Add click listener to make call later

  /**
   * Grabs gameId and winning number of calls from DOM and registers
   * a new game contract
   */
  function register(){
    // Validate form data
    if (newGameId.value === "" || n.value === ""){
      console.log("GameId and Winning Caller are required. No Game Registered.")
      return
    }

    // Setup the request
    let body = {
      id: newGameId.value,
      n: parseInt(n.value, 10),
    }

    // Actually send it
    makePost('/register', body)
    .then(data => {
      console.log(data.message)
    })

    // Clear the DOM to prevent double posts
    newGameId.value = ""
  }

  //TODO Add event handler to make a call later

  /**
   * Abstract the boring part of making a post request
   * @param route The request destination as a string. ex: '/call'
   * @param body An object of the data to be passed
   * @return A promise for a response object
   */
  function makePost(route, body){
    let request = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify(body)
    }

    return fetch(route, request)
    .then(res => {return res.json()})
  }
})

```

The `makePost` function at the bottom abstracts away the boring parts of making an POST request to the server using JSON. We'll use this function again later when we implement calling in to win the game. If you'd like to understand it better, watch the fetch API video I linked above.

The actual event handler does as its comments say. It first ensures that neither the `gameId` nor the `n` fields are blank, and the makes an object representing the query data. We pass the object off as a request to `/register` on the server that we're about to write, and finally log the result in the javascript console.


## Connecting the UI to the blockchain

We now have a _beautiful_ front end that makes http POST requests, and a running RNode that speaks gRPC. We'll glue them together using an express.js web server. Again, you can take a [crash course](https://www.youtube.com/watch?v=gnsO8-xJ8rs) or just copy-paste the code I've prepared. We'll also be using the [RChain-API node module](https://github.com/joshorndorff/RChain-API). Big thanks to Dan Connolly.

```javascript
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


//TODO Add route for calling in to win later
```

When the server receive a registration message from the browser, it generates the appropriate rholang code to register a game, adds a timestamp to it, and deploys it the RNode. Deploys only go out to RChain when the node makes a new block, so we force it to do so immediately. Finally, we return whatever message we got back from the RNode to the user's web browser.



## Try It Out

To make this all work we need to install the necessary node modules and start the express server that we just wrote.
```
$ npm install --save body-parser express grpc github:JoshOrndorff/RChain-API
$ node server.js
```

In your web browser, navigate to `localhost:8080`. Choose a name and winning caller for the game you're about to register and click the button. In the javascript console you should see a success message. You can confirm that the deploy worked by looking at RNode's output which should contain something like

```
CASPER: Received Deploy #1535532821590 -- @{"nthCallerFactory"}!("J...
CASPER: Beginning send of Block #1 (56a54eac33...) -- Sender ID 464f6780d7... -- M Parent Hash eb28a3a5a8... -- Contents ad3fe3e348...-- Shard ID rchain to peers...
CASPER: Sent 56a54eac33... to peers
CASPER: Added 56a54eac33...
CASPER: New fork-choice tip is block 56a54eac33....
```


## Calling In to Win
We can now add the feature to call the contract and try to win. This is similar to how we implemented register, and I encourage you to try it yourself before I show the code.

To call in and try to win, the user has to supply the gameId that they want to call, and their own name. So let's give them fields for that in the html file. Replace the comment from before with:

```html
<h1>Play an existing game</h1>
Game ID: <input id="call-game-id" type="text" />
Your Name: <input id="name" type="text" />
<button id="call">Call</button>
<p id="status"></p>
```

Now in your `page.js` you can replace the three comments with
```javascript
let callGameId = document.getElementById('call-game-id')
let name = document.getElementById('name')
let resultP = document.getElementById('status')
```

```javascript
document.getElementById('call').addEventListener('click', call)
```

```javascript
/**
 * Grabs gameId and username from DOM and calls the
 * corresponding game. Reports result in DOM.
 */
function call(){
  // Validate form data
  if (callGameId.value === "") {
    console.log("GameId is required. No Call Made.")
    return
  }

  // Setup the request
  let body = {
    id: callGameId.value,
    name: name.value,
  }

  // Actually send it
  makePost('/call', body)
  .then(data => {

    // See whether we found any data
    if (!data.success) {
      console.log("No such game found in RChain")
    }
    else {
      resultP.innerHTML = data.message
    }
  })
}
```

This click handler is slightly more complex this time because it is possible that the user tried to cal la gameId that has never been registered. This will be true server-side as well. In `server.js` replace the comment with

```javascript
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
```

At this point you will need to kill the web server with `ctrl + C` and restart it with `node server.js`. Refresh your browser tab, and give it a whirl. I bet if you call enough times you'll win!

Pro tip: This dapp will leave games registered in the blockchain between runs, and if you have more than one active game on the same name, you never know which one you're calling. Those of you who built from scratch may want to clear out the state of RChain and start over occasionally. Just delete you data directory which is probably `~/.rnode`. Or you may just want to complete the optional step to add the npm scripts below.


## Optional Steps
At this point you've got a working dapp that implements all features of the nth caller game. Congratulations! But a good piece of software is never complete right? Here are a few things you can do to make this dapp even nicer.

**Facelift**
For one thing, our UI looks straight out of 1997. A little styling would go a long way. All it takes is adding the line `<link type="text/css" rel="stylesheet" href="page.css" />` to the head of your `index.html` file, and downloading [page.css](https://github.com/JoshOrndorff/nth-caller-game/blob/master/page.css). (sorry, that link is dead. I owe you css.)

**NPM Scripts**
If you built from scratch, you may be wondering how to get those nice npm scripts. All it takes is saving [my .rnode directory](https://github.com/JoshOrndorff/nth-caller-game/tree/master/.rnode), and adding the scripts to your `package.json` file.

```javascript
"scripts": {
  "test": "rnode deploy --from 0x0 --nonce 0 --phlo-price 0 --phlo-limit 0 integrationTest.rho && rnode propose",
  "fresh": "rm -rf .rnode/rspace rm -rf .rnode/casper-block-store && rnode run --data_dir .rnode",
  "deploy-contract": "rnode deploy --from 0x0 --nonce 0 --phlo-price 0 --phlo-limit 0 nthCaller.rho && rnode propose",
  "with-nodemon": "nodemon server.js"
}
```


## Feedback
I sincerely hope that this guide was helpful and made your path to your first dapp a bit easier. I will continue to improve this guide as new node features development tools are release. I'd also love your feedback. I'm ``@JoshyOrndorff` on the [rchain discord](https://discord.gg/fvY8qhx).
