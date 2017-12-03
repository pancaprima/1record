const inspector = require('./inspector');
const { ipcRenderer: ipc, remote } = require('electron');
var inspect;

document.addEventListener('DOMContentLoaded', function(event) {
  inspect = bindListener(event);
});

function bindListener(event) {
  inspector.inspectorStart(document)
  document.addEventListener("mouseover", inspectorMouseOver, true);
  document.addEventListener("mouseout", inspector.inspectorMouseOut, true);
  document.addEventListener('click', inspectorOnClick, true)
  document.addEventListener("keydown", unbindListener, true);
}

function unbindListener(event) {
  if (event.which === 27) {
    document.removeEventListener("mouseover", inspectorMouseOver, true);
    document.removeEventListener("mouseout", inspector.inspectorMouseOut, true);
    document.removeEventListener("click", inspectorOnClick, true);
    document.removeEventListener("keydown", unbindListener, true);
    inspector.inspectorCancel()
  }
}

function inspectorOnClick(event) {
  e.preventDefault()
  let location = inspector.inspectorOnClick(event)
  ipc.sendTo(1,'webview-clicked', { 'location':location })
  return false
}

function inspectorMouseOver(event) {
  let location = inspector.inspectorOnClick(event)
  inspector.inspectorMouseOver(event)
  ipc.sendTo(1,'webview-hovered', { 'location':location })
}

