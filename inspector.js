/**
 * Simple JavaScript DOM Inspector v0.1.2
 *
 * Highlights hovered elements with a 2px red outline, and then provides the hovered element
 * on click to the callback function, which can do anything with it.
 *
 * By default, the inspector just console.logs a jQuery-style CSS selector path for the element.
 * 
 * The CSS path-building code works up the given element's parent nodes to create an optimised
 * selector string, stopping at the first parent with an #id, but can also create an
 * ultra-specific full CSS path, right down to 'html'.
 * 
 * Optionally, it can check to see if any part of the CSS path matches multiple elements, or if
 * any element in the CSS path has no #id or .class, and add specific ":nth-child()"
 * pseudo-selector to match the element, eg. "html body #content p img:nth-child(1)"
 * 
 * Hit escape key to cancel the inspector.
 * 
 * NB: XPath code removed as it didn't really work very well, need to write from scratch.
 * 
 * Started putting in IE support, but won't work in IE just yet, check back next week for that
 * (so far, tested in FF4, Chrome, Safari, Opera 11.)
 * 
 * No warranty; probably won't break the internet. Improvements and linkbacks welcome!
 * 
 * - Joss
 */


var last;
var page;

/**
* Get full CSS path of any element
* 
* Returns a jQuery-style CSS path, with IDs, classes and ':nth-child' pseudo-selectors.
* 
* Can either build a full CSS path, from 'html' all the way to ':nth-child()', or a
* more optimised short path, stopping at the first parent with a specific ID,
* eg. "#content .top p" instead of "html body #main #content .top p:nth-child(3)"
*/
function cssPath(el) {
  let fullPath    = 0,  // Set to 1 to build ultra-specific full CSS-path, or 0 for optimised selector
      useNthChild = 0,  // Set to 1 to use ":nth-child()" pseudo-selectors to match the given element
      specialAttributes = ['name', 'href', 'value'],
      currentElement = el,
      cssPathStr = '',
      testPath = '',
      parents = [],
      parentSelectors = [],
      attributes = [],
      tagName,
      cssId,
      cssClass,
      tagSelector,
      vagueMatch,
      nth,
      i,
      c;

  // Go up the list of parent nodes and build unique identifier for each:
  while ( currentElement ) {
    vagueMatch = 0;

    // Get the node's HTML tag name in lowercase:
    tagName = currentElement.nodeName.toLowerCase();
    
    // Get node's ID attribute, adding a '#':
    cssId = ( currentElement.id ) ? ( '#' + currentElement.id ) : false;
    
    // Get node's CSS classes, replacing spaces with '.':
    cssClass = ( currentElement.className ) ? ( '.' + currentElement.className.replace(/\s+/g,".") ) : '';
    
    // Get special attributes from this node
    let hasSpecialAttribute = false
    let elementSpecialAttributes = []
    for (let i in specialAttributes) {
      let attrValue
      if ( attrValue = currentElement.getAttribute(specialAttributes[i]) ) { 
        elementSpecialAttributes.push({ 
          'name' : specialAttributes[i],
          'value': attrValue
        })
        hasSpecialAttribute = true
      }
    }

    // Try build a unique identifier for this parent node by ID
    if ( cssId ) {
      // Matched by ID:
      tagSelector = tagName + cssId + cssClass;
    } else if ( cssClass ) {
      tagSelector = tagName + cssClass;
    } else {
      vagueMatch = 1
      tagSelector = tagName
    }

    // Try build a unique identifier for this parent node by attributes
    let specialAttributesVague = 1
    if ( hasSpecialAttribute ) {
      result = checkWithAttributes(currentElement, tagName, tagSelector, elementSpecialAttributes)
      vagueMatch = result.vague
      specialAttributesVague = result.vague
      tagSelector = result.tagSelector
    }

    if (tagName == "a") {
      parentSelectors = []
      el = currentElement
    }

    // Add this full tag selector to the parentSelectors array:
    parentSelectors.push( tagSelector )

    // If doing short/optimised CSS paths and this element has an ID, stop here:
    if ( cssId && !fullPath )
      break;
    
    // Go up to the next parent node:
    currentElement = currentElement.parentNode !== page ? currentElement.parentNode : false;
    
  } // endwhile

  // Build the CSS path string from the parent tag selectors:
  let minimumValidSelector = ''
  let finalCssPath = ''
  for ( i = 0; i < parentSelectors.length; i++ ) {
    cssPathStr = parentSelectors[i] + ' ' + cssPathStr;// + ' ' + cssPathStr;

    // If using ":nth-child()" selectors and this selector has no ID / isn't the html or body tag:
    if ( useNthChild && !parentSelectors[i].match(/#/) && !parentSelectors[i].match(/^(html|body)$/) ) {
      
      // If there's no CSS class, or if the semi-complete CSS selector path matches multiple elements:
      if ( !parentSelectors[i].match(/\./) || $( cssPathStr ).length > 1 ) {
        
        // Count element's previous siblings for ":nth-child" pseudo-selector:
        for ( nth = 1, c = currentElement; c.previousElementSibling; c = c.previousElementSibling, nth++ );
        
        // Append ":nth-child()" to CSS path:
        cssPathStr += ":nth-child(" + nth + ")";
      }
    }
    finalCssPath = cssPathStr.replace(/^[ \t]+|[ \t]+$/, '')
    if (el.isSameNode(document.querySelector(finalCssPath))) {
      if (minimumValidSelector == '') minimumValidSelector = finalCssPath
      if (document.querySelectorAll(finalCssPath).length == 1) {
        minimumValidSelector = finalCssPath
        break
      }
    }
  }
  if (minimumValidSelector == '') console.warn("can't generate selector for this element", el, finalCssPath )

  return minimumValidSelector;
}

function checkWithAttributes (el, tagName, tagSelector, elementSpecialAttributes) {
  let attrQuery = ''
  let vague = 1
  let finalTagSelector = ''
  let iteratorCounter = (tagName == tagSelector) ? 1 : 2
  for (let i=0; i < iteratorCounter; i++) {
    tempTagSelector = (iteratorCounter == 1) ? tagName : tagSelector
    for (let j in elementSpecialAttributes) {
      let eAttr = elementSpecialAttributes[j]
      attrQuery = attrQuery + "[" + eAttr.name + "=" + "'" + eAttr.value + "'" +"]"
      finalTagSelector = tempTagSelector + attrQuery
      if ( el.isSameNode(document.querySelector(finalTagSelector)) ) {
        vague = 0
        break
      }
    }
    if (!vague) break
     else finalTagSelector = tagSelector
  }
  
  return {
    "vague" : vague,
    "tagSelector" : finalTagSelector
  }
}


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
  e.target.style.outline = '';
}


/**
* Click action for hovered element
*/
function inspectorOnClick(e) {
  e.preventDefault();

  return cssPath(e.target);
}


/**
* Function to cancel inspector:
*/
function inspectorCancel() {
  // Unbind inspector mouse and click events:
  page = null
  last.style.outline = 'none'
}

function inspectorStart(doc) {
  page = doc
}

module.exports = { inspectorMouseOver, inspectorMouseOut, inspectorOnClick, inspectorCancel, inspectorStart};