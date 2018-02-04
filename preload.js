const inspector = require('./inspector');
const { ipcRenderer: ipc, remote } = require('electron');
var inspect;
var iframe = {
  "choosen" : false,
  "choosing" : false,
  "location" : ""
}

function bindListener(event) {
  inspector.setPage(document)
  document.addEventListener("mouseover", inspectorMouseOver, true);
  document.addEventListener("mouseout", inspector.inspectorMouseOut, true);
  document.addEventListener('click', inspectorOnClick, true)
  document.addEventListener("keydown", unbindListener, true);
}

function unbindListener(event) {
  document.removeEventListener("mouseover", inspectorMouseOver, true);
  document.removeEventListener("mouseout", inspector.inspectorMouseOut, true);
  document.removeEventListener("click", inspectorOnClick, true);
  document.removeEventListener("keydown", unbindListener, true);
  inspector.inspectorCancel()
}

function inspectorOnClick(event) {
  event.preventDefault()
  let location = inspector.inspectorOnClick(event)
  ipc.sendTo(1,'webview-clicked', { 'location':location })
  return false
}

function inspectorMouseOver(event) {
  let location = inspector.inspectorOnClick(event)
  inspector.inspectorMouseOver(event)
  ipc.sendTo(1,'webview-hovered', { 'location':location })
}

ipc.on('activate-inspector', (event, args) => {
  inspect = bindListener(event);
})

ipc.on('deactivate-inspector', (event, args) => {
  inspect = unbindListener(event);
})

window.addEventListener('keydown', function (event) {
  if (event.key == 'Shift') ipc.sendTo(1,'shift-keydown')
}, true)

window.addEventListener('keyup', function (event) {
  if (event.key === 'Shift') ipc.sendTo(1,'shift-keyup')
}, true)

