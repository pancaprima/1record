var last;
var smartSelector = require('./smart-selector');

/**
* MouseOver action for all elements on the page:
*/
function inspectorMouseOver(e) {
  // NB: this doesn't work in IE (needs fix):
  var element = e.target;

  // Set outline:
  element.style.outline = '3px solid #563d7c';

  // Set last selected element so it can be 'deselected' on cancel.
  last = element;
}


/**
* MouseOut event action for all elements
*/
function inspectorMouseOut(e) {
  // Remove outline from element:
  e.stopImmediatePropagation()
  e.target.style.outline = '';
}


/**
* Click action for hovered element
*/
function inspectorOnClick(e) {
  e.preventDefault();
  e.stopImmediatePropagation()

  return smartSelector.findElementLocation(e.target, smartSelector.SHORTEST_STRATEGY)
}


/**
* Function to cancel inspector:
*/
function inspectorCancel() {
  // Unbind inspector mouse and click events:
  last.style.outline = 'none'
}

function setPage(doc) {
  smartSelector.setPage(doc)
}

module.exports = { inspectorMouseOver, inspectorMouseOut, inspectorOnClick, inspectorCancel, setPage };