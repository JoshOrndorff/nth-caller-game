"use strict"

document.addEventListener("DOMContentLoaded", () => {

  // Grab DOM items
  let newGameId = document.getElementById('new-game-id')
  let n = document.getElementById('n')
  let callGameId = document.getElementById('call-game-id')
  let name = document.getElementById('name')
  let resultP = document.getElementById('status')

  // Event Listeners
  document.getElementById('register').addEventListener('click', register)
  document.getElementById('call').addEventListener('click', call)

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

  /**
   * Grabs gameId and username from DOM and calls the
   * corresponding game. Reports result in DOM.
   */
  function call(){
    // Validate form data
    if (callGameId.value === ""){
      console.log("GameId is required. No Call Made.")
      return
    }

    let body = {
      id: callGameId.value,
      name: name.value,
    }

    makePost('/call', body)
    .then(data => {
      resultP.innerHTML = data.message //TODO change so right thing goes in dom.
    })
  }

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
