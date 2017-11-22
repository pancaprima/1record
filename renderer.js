// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

$('#goto').on('click', (e) => {
  e.preventDefault()
  $('#intro').hide()
  $('nav').show()
  $('#browser').show()
})
