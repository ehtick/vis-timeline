// DOM utility methods

/**
 * this prepares the JSON container for allocating SVG elements
 * @param {Object} JSONcontainer
 * @private
 */
export function prepareElements(JSONcontainer) {
  // cleanup the redundant svgElements;
  for (var elementType in JSONcontainer) {
    if (!Object.prototype.hasOwnProperty.call(JSONcontainer, elementType))
      continue;
    JSONcontainer[elementType].redundant = JSONcontainer[elementType].used;
    JSONcontainer[elementType].used = [];
  }
}

/**
 * this cleans up all the unused SVG elements. By asking for the parentNode, we only need to supply the JSON container from
 * which to remove the redundant elements.
 *
 * @param {Object} JSONcontainer
 * @private
 */
export function cleanupElements(JSONcontainer) {
  // cleanup the redundant svgElements;
  for (var elementType in JSONcontainer) {
    if (!Object.prototype.hasOwnProperty.call(JSONcontainer, elementType))
      continue;
    const elementTypeJsonContainer = JSONcontainer[elementType];
    for (var i = 0; i < elementTypeJsonContainer.redundant.length; i++) {
      elementTypeJsonContainer.redundant[i].parentNode.removeChild(elementTypeJsonContainer.redundant[i]);
    }
    elementTypeJsonContainer.redundant = [];
  }
}

/**
 * Ensures that all elements are removed first up so they can be recreated cleanly
 * @param {Object} JSONcontainer
 */
export function resetElements(JSONcontainer) {
  prepareElements(JSONcontainer);
  cleanupElements(JSONcontainer);
  prepareElements(JSONcontainer);
}

/**
 * Allocate or generate an SVG element if needed. Store a reference to it in the JSON container and draw it in the svgContainer
 * the JSON container and the SVG container have to be supplied so other svg containers (like the legend) can use this.
 *
 * @param {string} elementType
 * @param {Object} JSONcontainer
 * @param {Object} svgContainer
 * @returns {Element}
 * @private
 */
export function getSVGElement(elementType, JSONcontainer, svgContainer) {
  var element;
  // allocate SVG element, if it doesnt yet exist, create one.
  if (Object.prototype.hasOwnProperty.call(JSONcontainer, elementType)) { // this element has been created before
    // check if there is an redundant element
    if (JSONcontainer[elementType].redundant.length > 0) {
      element = JSONcontainer[elementType].redundant[0];
      JSONcontainer[elementType].redundant.shift();
    }
    else {
      // create a new element and add it to the SVG
      element = document.createElementNS('http://www.w3.org/2000/svg', elementType);
      svgContainer.appendChild(element);
    }
  }
  else {
    // create a new element and add it to the SVG, also create a new object in the svgElements to keep track of it.
    element = document.createElementNS('http://www.w3.org/2000/svg', elementType);
    JSONcontainer[elementType] = {used: [], redundant: []};
    svgContainer.appendChild(element);
  }
  JSONcontainer[elementType].used.push(element);
  return element;
}


/**
 * Allocate or generate an SVG element if needed. Store a reference to it in the JSON container and draw it in the svgContainer
 * the JSON container and the SVG container have to be supplied so other svg containers (like the legend) can use this.
 *
 * @param {string} elementType
 * @param {Object} JSONcontainer
 * @param {Element} DOMContainer
 * @param {Element} insertBefore
 * @returns {*}
 */
export function getDOMElement(elementType, JSONcontainer, DOMContainer, insertBefore) {
  var element;
  // allocate DOM element, if it doesnt yet exist, create one.
  if (Object.prototype.hasOwnProperty.call(JSONcontainer, elementType)) { // this element has been created before
    // check if there is an redundant element
    if (JSONcontainer[elementType].redundant.length > 0) {
      element = JSONcontainer[elementType].redundant[0];
      JSONcontainer[elementType].redundant.shift();
    }
    else {
      // create a new element and add it to the SVG
      element = document.createElement(elementType);
      if (insertBefore !== undefined) {
        DOMContainer.insertBefore(element, insertBefore);
      }
      else {
        DOMContainer.appendChild(element);
      }
    }
  }
  else {
    // create a new element and add it to the SVG, also create a new object in the svgElements to keep track of it.
    element = document.createElement(elementType);
    JSONcontainer[elementType] = {used: [], redundant: []};
    if (insertBefore !== undefined) {
      DOMContainer.insertBefore(element, insertBefore);
    }
    else {
      DOMContainer.appendChild(element);
    }
  }
  JSONcontainer[elementType].used.push(element);
  return element;
}




/**
 * Draw a point object. This is a separate function because it can also be called by the legend.
 * The reason the JSONcontainer and the target SVG svgContainer have to be supplied is so the legend can use these functions
 * as well.
 *
 * @param {number} x
 * @param {number} y
 * @param {Object} groupTemplate: A template containing the necessary information to draw the datapoint e.g., {style: 'circle', size: 5, className: 'className' }
 * @param {Object} JSONcontainer
 * @param {Object} svgContainer
 * @param {Object} labelObj
 * @returns {vis.PointItem}
 */
export function drawPoint(x, y, groupTemplate, JSONcontainer, svgContainer, labelObj) {
  var point;
  if (groupTemplate.style == 'circle') {
    point = getSVGElement('circle', JSONcontainer, svgContainer);
    point.setAttributeNS(null, "cx", x);
    point.setAttributeNS(null, "cy", y);
    point.setAttributeNS(null, "r", 0.5 * groupTemplate.size);
  }
  else {
    point = getSVGElement('rect', JSONcontainer, svgContainer);
    point.setAttributeNS(null, "x", x - 0.5 * groupTemplate.size);
    point.setAttributeNS(null, "y", y - 0.5 * groupTemplate.size);
    point.setAttributeNS(null, "width", groupTemplate.size);
    point.setAttributeNS(null, "height", groupTemplate.size);
  }

  if (groupTemplate.styles !== undefined) {
    point.setAttributeNS(null, "style", groupTemplate.styles);
  }
  point.setAttributeNS(null, "class", groupTemplate.className + " vis-point");
  //handle label


  if (labelObj) {
    var label = getSVGElement('text', JSONcontainer, svgContainer);
    if (labelObj.xOffset) {
      x = x + labelObj.xOffset;
    }

    if (labelObj.yOffset) {
      y = y + labelObj.yOffset;
    }
    if (labelObj.content) {
      label.textContent = labelObj.content;
    }

    if (labelObj.className) {
      label.setAttributeNS(null, "class", labelObj.className  + " vis-label");
    }
    label.setAttributeNS(null, "x", x);
    label.setAttributeNS(null, "y", y);
  }

  return point;
}

/**
 * draw a bar SVG element centered on the X coordinate
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} className
 * @param {Object} JSONcontainer
 * @param {Object} svgContainer
 * @param {string} style
 */
export function drawBar (x, y, width, height, className, JSONcontainer, svgContainer, style) {
  if (height != 0) {
    if (height < 0) {
      height *= -1;
      y -= height;
    }
    var rect = getSVGElement('rect',JSONcontainer, svgContainer);
    rect.setAttributeNS(null, "x", x - 0.5 * width);
    rect.setAttributeNS(null, "y", y);
    rect.setAttributeNS(null, "width", width);
    rect.setAttributeNS(null, "height", height);
    rect.setAttributeNS(null, "class", className);
    if (style) {
      rect.setAttributeNS(null, "style", style);
    }
  }
}

/**
 * get default language
 * @returns {string}
 */
export function getNavigatorLanguage() {
  try {
    if (!navigator) return 'en';
    if (navigator.languages && navigator.languages.length) {
      return navigator.languages;
    } else {
      return navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en';
    }
  } 
  catch(error) {
    return 'en';
  }
}
