const XPATH_STRATEGY = "XPATH"
const CSS_SELECTOR_STRATEGY = "CSS_SELECTOR"
const SHORTEST_STRATEGY = "SHORTEST"
var page

function setPage(new_page) {
  page = new_page
}
function findElementLocation(el, strategy) {
  let location
  switch (strategy) {
    case SHORTEST_STRATEGY:
      location = getShortestLocation(el)
      break;
    case CSS_SELECTOR_STRATEGY:
      location = getCSSLocation(el)
      break;
    case XPATH_STRATEGY:
      location = getXPathLocation(el)
      break;
    default:
      break;
  }
  return location
}

function getShortestLocation(el) {
  el = validateElement(el)
  let strategy = SHORTEST_STRATEGY,
      css = {
        "parents" : getAllElementLocations(el, CSS_SELECTOR_STRATEGY),
        "location": '',
        "minimum_valid": null
      },
      xpath = {
        "parents" : getAllElementLocations(el, XPATH_STRATEGY),
        "location": '',
        "minimum_valid": null,
        "minimum_valid_index" : Number.MAX_SAFE_INTEGER
      }

  for (let i = 0; i < css.parents.length; i++ ) {
    css.location = css.parents[i] + ' ' + css.location,
    xpath.location = '/' + xpath.parents[i] + xpath.location
    // If using ":nth-child()" selectors and this selector has no ID / isn't the html or body tag:
    if ( !css.parents[i].match(/#/) && !css.parents[i].match(/^(html|body)$/) ) {
      // If there's no CSS class, or if the semi-complete CSS selector path matches multiple elements:
      if ( !css.parents[i].match(/\./) || $( css.location ).length > 1 ) {
        // Count element's previous siblings for ":nth-child" pseudo-selector:
        let nth
        for ( nth = 1, c = el; c.previousElementSibling; c = c.previousElementSibling, nth++ );
        // Append ":nth-child()" to CSS path:
        if (nth > 1) css.location = css.location.trim() + ":nth-child(" + nth + ")";
      }
    }
    css.location = css.location.replace(/^[ \t]+|[ \t]+$/, '')
    let cssNodes = page.querySelectorAll(css.location)
    for (let j=0; j < cssNodes.length; j++) {
      if ( j==0 && el.isSameNode(cssNodes[j]) ) {
          css.minimum_valid = css.location
          break
      } else {
          let xpathNodes = page.evaluate('/' + xpath.location, page, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)
          let xpathNode = xpathNodes.iterateNext()
          let nodeIteration = 1
          while (xpathNode) {
            if (nodeIteration < xpath.minimum_valid_index && el.isSameNode(xpathNode)) {
              xpath.minimum_valid = (nodeIteration==1) ? "/" + xpath.location : "(/" + xpath.location +")["+nodeIteration+"]"
              break
            }
            nodeIteration++
            xpathNode = xpathNodes.iterateNext()
          }
      }
    }
    if (css.minimum_valid) break
  }
  
  if (css.minimum_valid) {
    if (xpath.minimum_valid) {
      if (xpath.minimum_valid.length > css.minimum_valid.length) return css.minimum_valid
    } else return css.minimum_valid
  } 
  return xpath.minimum_valid
}

function getCSSLocation(el) {
  //to-do next
  return null
}

function getXPathLocation(el) {
  //to-do next
  return null
}

function validateElement(el) {
  let currentElement = el
  while ( currentElement ) {
    if (currentElement.nodeName.toLowerCase() == "a") el = currentElement
    currentElement = currentElement.parentNode !== page ? currentElement.parentNode : false;
  }
  return el
}

function getAllElementLocations(el, strategy) {
  let currentElement = el,
      parentElementLocations = []

  // Go up the list of parent nodes and build unique identifier for each:
  while ( currentElement ) {
    // Get the node's HTML tag name in lowercase:
    let tagName = currentElement.nodeName.toLowerCase()
    let tagId, tagClasses
    switch (strategy) {
      case CSS_SELECTOR_STRATEGY:
        tagId = ( currentElement.id ) ? ( '#' + currentElement.id ) : false
        tagClasses = ( currentElement.className ) ? ( '.' + currentElement.className.replace(/\s+/g,".") ) : ''
        break;
      case XPATH_STRATEGY:
        tagId = ( currentElement.id ) ? ( "[@id='" + currentElement.id + "']" ) : false
        tagClasses = ( currentElement.className ) ? ( "[@class='" + currentElement.className + "']" ) : ''
      default:
        break;
    }
 
    let elementLocation
    if ( tagId ) elementLocation = tagName + tagId
    else if ( tagClasses ) elementLocation = tagName + tagClasses
    else elementLocation = tagName

    // Try build a unique identifier for this parent node by attributes
    let specialAttributes = getSpecialAttributes(currentElement)
    if ( specialAttributes.has_special_attributes ) elementLocation = checkWithAttributes(currentElement, strategy, tagName, elementLocation, specialAttributes.data)

    // Add this element location to the parentElementLocations array:
    parentElementLocations.push( elementLocation )

    // If this element has an ID, stop here:
    if ( tagId ) break;
    
    // Go up to the next parent node:
    currentElement = currentElement.parentNode !== page ? currentElement.parentNode : false;
  } // endwhile

  return parentElementLocations
}

function getSpecialAttributes(el) {
  // Get special attributes from this node
  let specialAttributes = ['name', 'href', 'value'],
      hasSpecialAttribute = false,
      elementSpecialAttributes = []
  
  for (let i in specialAttributes) {
    let attrValue
    if ( attrValue = el.getAttribute(specialAttributes[i]) ) { 
      elementSpecialAttributes.push({ 
        'name' : specialAttributes[i],
        'value': attrValue
      })
      hasSpecialAttribute = true
    }
  }
  return {
    "has_special_attributes" : true,
    "data" : elementSpecialAttributes
  }
}

function checkWithAttributes (el, strategy, tagName, currentLocation, elementSpecialAttributes) {
  let finalLocation = currentLocation,
      iteratorCounter = (tagName == currentLocation) ? 1 : 2 //iterate through tagName and currentLocation to get best location
  for (let i=0; i < iteratorCounter; i++) {
    let tempLocation = (iteratorCounter == 1) ? tagName : currentLocation,
        attr = ''
    for (let j in elementSpecialAttributes) {
      let eAttr = elementSpecialAttributes[j]
      switch (strategy) {
        case CSS_SELECTOR_STRATEGY:
          attr = attr + "[" + eAttr.name + "=" + "'" + eAttr.value + "'" +"]"
          if ( el.isSameNode(page.querySelector(tempLocation + attr)) ) finalLocation = tempLocation + attr
          break
        case XPATH_STRATEGY:
          attr = attr + "[@" + eAttr.name + "=" + "'" + eAttr.value + "'" +"]"
          let xpathNode = page.evaluate('//' + tempLocation + attr, page, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext()
          if (el.isSameNode(xpathNode)) finalLocation = tempLocation + attr
          break
        default:
          break
      }
      if (finalLocation != currentLocation) break
    }
  }
  return finalLocation
}

module.exports = { setPage, findElementLocation, XPATH_STRATEGY, CSS_SELECTOR_STRATEGY, SHORTEST_STRATEGY }