# Write Your Frist Dapp
This repository is a tutorial on writing your first decentralized application on RChain. It assumes moderate familiarity with the command line, RNode software, and the node.js ecosystem. I will walk you through building a simple be-the-tenth-caller game dapp in a hands-on way. I encourage you to experiment as we move along. RChain is still in a pre-release state and its ecosystem is still developing. When we have to work around an issue with the current RNode, I do my best to point it out.

Written By: Joshy Orndorff

## Just make this thing run!
It's ~~nice~~ necessary to know what you're building before you start building it. So you may want to launch the project before we even begin.

1. Install RNode ([instructions](todo))
2. Install node and npm ([instructions](todo))
3. Clone the repo `git clone TODO`
4. Change into the project directory `cd TODO`
5. Install dependencies `npm install`
6. Start a fresh, pre-configured RNode with the contract deployed `npm run fresh`
7. (Optional) Run the integration tests `npm test`
8. Launch the dapp frontend `npm start <RNode host> <RNode gRPC port> <frontend port>`
9. Navigate to the user interface in your favorite browser at `localhost:<frontend port>`

## Dapp Writing Fundamentals
Before we begin, I'll show you the plan. These are the big-picture steps that you'll need to follow in order to write any dapp.

1. Design the smart contract -- ours is called `nthCaller.rho`
2. Design an interface -- We're using plain ugly html.
3. Connect the interface to the contract -- We'll use the RChain-API and express node modules
4. Deploy your contract
5. Use your dapp
6. Celebrate :)

## The Nth Caller Game
Local radio stations often run competitions where the hundredth caller wins tickets to a concert. This dapp allows us to play the same game on the blockchain.

Anyone can create a new nthcaller game by specifying a gameID and the winning caller number. After that anyone can call the smart contract and the correct caller will win. Because we're on the blockchain we are assured that the game runs fairly and correctly, and cannot be stopped or censored.



# Let's Build It!

## The smart contract
The code that runs on the blockchain is written in a language called rholang which was designed specifically for the concurrent computing capabilities of the RChain platform. Create a new file named `nthCaller.rho` and put this content in it

```

```

TODO Brief explanation of code.

To get more familiar with the features of rholang, you may appreciate our [rholang tutorial](IOU a link)


Before we can use this code we need to deploy it to RChain

Start a standalone node without upnp networking features and running casper. TODO figure out how to make this manageable

``` complaining
start a node to generate the data_dir, then kill it.
hunt through the data_dar to find a secret key and copy it
put that same key on the commandline when you start the node the second time.
You're done, but if you ever want a fresh data-dir you'll have to do it all again.
```


## Writing a UI
Cover html, but also client-side javascript
Only do the new game feature at this point
https://www.youtube.com/watch?v=Oive66jrwBs

## Connecting the UI to the blockchain
crashcourse on express and bodyparser: https://www.youtube.com/watch?v=gnsO8-xJ8rs

Show it works by showing the node output

## Calling In
We can now add the feature to call the contract and try to win. This is similar to before, and if you may want to try it yourself before I show the code. To call in and try to win, the user has to supply the gameId that they want to call, and their own name.

code

## Possible Expansions

Private games.







## Feedback
I sincerely hope that this guide was helpful and made your path to your first dapp a bit easier. I will continue to improve this guide as new node features are release. I'd also love your feedback

(link or something to submit feedback)
