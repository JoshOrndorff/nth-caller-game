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

    // Setup the request
    let request = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        id: newGameId.value,
        n: n.value,
      })
    }

    // Actually send it
    fetch('/register', request)
    .then(res => {return res.json()})
    .then(data => {
      console.log(data.message)
    })
  }

  /**
   * Grabs gameId and username from DOM and calls the
   * corresponding game. Reports result in DOM.
   */
  function call(){

    // Setup the request
    let request = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        id: callGameId.value,
        name: name.value,
      })
    }

    // Actually send it
    fetch('/call', request)
    .then(res => {return res.json()})
    .then(data => {
      resultP.innerHTML = data.message //TODO change so right thing goes in dom.
    })
  }
})
