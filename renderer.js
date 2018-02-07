// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const webview = document.getElementById('js-browser');
const { ipcRenderer: ipc, remote, clipboard } = require('electron');

$('.js-intro__submit').on('click', (e) => {
  e.preventDefault()
  $('.js-intro').hide()
  $('nav').show()
  
  $('#js-browser').attr('src', $('.js-intro__url').val())
  $('#js-browser').show()
})

$(".js-bottom-menu__left_new-url").on('click', (e) => {
  e.preventDefault()
  $('.js-intro').show()
  $('nav').hide()
  $('#js-browser').hide()
  deactivateInspector()
})

$('.js-bottom-menu__left_inspect').on('click', (e) => {
  let inspectBtn = $('.js-bottom-menu__left_inspect').first()
  if (inspectBtn.hasClass('toggled-on')) {
    inspectBtn.removeClass('toggled-on')
    webview.send('deactivate-inspector')
  } else {
    inspectBtn.addClass('toggled-on')
    webview.send('activate-inspector')
  }
})

ipc.on('webview-clicked', (event, args) => {
  let locationText = $(".js-bottom-menu__right_location").first()
  locationText.text(args.location)
  clipboard.writeText(args.location)
})

ipc.on('inspector-shortcut', (events, args) => {
  $('.js-bottom-menu__left_inspect').click()
})

ipc.on('shift-keydown', (events) => {
  activateInspector()
})

ipc.on('shift-keyup', (events) => {
  deactivateInspector()
})

$(".js-bottom-menu__right_location").on('click',(e) => {
  e.preventDefault()
  clipboard.writeText($(".js-bottom-menu__right_location").first().text())
})

$(".js-bottom-menu__left_history-back").on('click',(e) => {
  e.preventDefault()
  webview.goBack()
})

$(".js-bottom-menu__left_history-refresh").on('click',(e) => {
  e.preventDefault()
  webview.reload()
})

$(".js-bottom-menu__left_history-forward").on('click',(e) => {
  e.preventDefault()
  webview.goForward()
})

window.addEventListener('keydown', (event) => {
  if (event.key == 'Shift') activateInspector()
}, true)

window.addEventListener('keyup', (event) => {
  if (event.key === 'Shift') deactivateInspector()
}, true)

webview.addEventListener('new-window', (event) => {
  webview.src= event.url
})

webview.addEventListener('did-start-loading', (event) => {
  $(".loading").first().removeClass('hidden')
  window.setTimeout(() => {
    if(!$(".loading").first().hasClass('hidden')) {
      $(".loading").first().addClass('hidden')
    }
  }, 5000)
})

webview.addEventListener('did-stop-loading', (event) => {
  $(".loading").first().addClass('hidden')
})

function activateInspector() {
  let inspectBtn = $('.js-bottom-menu__left_inspect').first()
  if (!inspectBtn.hasClass('toggled-on')) {
    inspectBtn.addClass('toggled-on')
    webview.send('activate-inspector')
  }
}

function deactivateInspector() {
  let inspectBtn = $('.js-bottom-menu__left_inspect').first()
  if (inspectBtn.hasClass('toggled-on')) {
    inspectBtn.removeClass('toggled-on')
    webview.send('deactivate-inspector')
  }
}

