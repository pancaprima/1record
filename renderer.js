// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const webview = document.getElementById('browser');
const { ipcRenderer: ipc, remote } = require('electron');

$('#goto').on('click', (e) => {
  e.preventDefault()
  $('#intro').hide()
  $('nav').show()
  
  $('#browser').attr('src', $('#url').val())
  $('#browser').show()
  $('#browser')[0].openDevTools()
})

ipc.on('webview-clicked', (event, args) => {
  console.log('clicked', args.location)
})

ipc.on('webview-hovered', (event, args) => {
  // console.log('hovered', args.location)
})

