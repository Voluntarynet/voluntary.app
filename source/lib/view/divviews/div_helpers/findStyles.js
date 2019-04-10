/**
 * List unique CSS properties for all DOM elements
 * Initially created to list unique font stacks on a page
 * @see {@link http://stackoverflow.com/a/35022690/ Inspired by this StackOverflow answer}
 *
 * @see {@link https://gist.github.com/macbookandrew/f33dbbc0aa582d0515919dc5fb95c00a/ URL for this file}
 *
 * @author AndrewRMinion Design (https://andrewrminion.com)
 * @version 1.1
 *
 * @license MIT
 * @copyright AndrewRMinion Design
 *
 * @example Show all unique font stacks in use on the current page
 *          console.log(styleInPage('fontFamily'));
 *
 * @example Show a list of all DOM elements with their computed font stack
 *          console.log(styleInPage('fontFamily', true));
 *
 * @example Highlight all DOM elements using a particular font stack (pass in the array key from styleInPage)
 *          var fontStacksInUse = styleInPage('fontFamily');
 *          console.log(fontStacksInUse);
 *          highlightInPage(8);
 */

/**
 * Get an array of elements with their computed styles
 * @param   {string}  css     CSS property, camelCased for JS
 * @param   {boolean} verbose whether to output an array of all elements with their style properties
 * @returns {array}   array of unique properties, or if verbose is true, array of all elements with their properties
 */
function styleInPage(css, verbose) {
    // polyfill getComputedStyle
    if (typeof getComputedStyle == "undefined") {
        getComputedStyle = function (elem) {
            return elem.currentStyle;
        }
    }

    // set vars
    var style,
        thisNode,
        styleId,
        allStyles = [],
        nodes = document.body.getElementsByTagName('*');

    // loop over all elements
    for (var i = 0; i < nodes.length; i++) {
        thisNode = nodes[i];
        if (thisNode.style) {
            styleId = '#' + (thisNode.id || thisNode.nodeName + '(' + i + ')');
            style = thisNode.style.fontFamily || getComputedStyle(thisNode, '')[css];

            // get element’s style
            if (style) {
                if (verbose) {
                    allStyles.push([styleId, style]);
                } else if (allStyles.indexOf(style) == -1) {
                    allStyles.push(style);
                }

                // add data-attribute with key for allStyles array
                thisNode.dataset.styleId = allStyles.indexOf(style);
            }

            // get element:before’s style
            styleBefore = getComputedStyle(thisNode, ':before')[css];
            if (styleBefore) {
                if (verbose) {
                    allStyles.push([styleId, styleBefore]);
                } else if (allStyles.indexOf(styleBefore) == -1) {
                    allStyles.push(styleBefore);
                }

                // add data-attribute with key for allStyles array
                thisNode.dataset.styleId = allStyles.indexOf(styleBefore);
            }

            // get element:after’s style
            styleAfter = getComputedStyle(thisNode, ':after')[css];
            if (styleAfter) {
                if (verbose) {
                    allStyles.push([styleId, styleAfter]);
                } else if (allStyles.indexOf(styleAfter) == -1) {
                    allStyles.push(styleAfter);
                }

                // add data-attribute with key for allStyles array
                thisNode.dataset.styleId = allStyles.indexOf(styleAfter);
            }
        }
    }
    return allStyles;
}

/**
 * Highlight elements with the specified style
 * @param {integer} styleId data-style-id to highlight
 */
function highlightInPage(styleId) {
    var thisNode,
        allNodes = document.body.getElementsByTagName('*'),
        nodes = document.body.querySelectorAll('[data-style-id="' + styleId + '"]');

    // remove previous highlights
    for (var i = 0; i < allNodes.length; i++) {
        allNodes[i].classList.remove('style-highlight');
    }

    // add highlight to specified nodes
    for (var i = 0; i < nodes.length; i++) {
        thisNode = nodes[i];
        thisNode.classList.add('style-highlight');
    }
}

/**
 * Clear all highlights
 */
function clearHighlights() {
    highlightInPage();
}

/**
 * Add blank stylesheet for highlight rule
 * @returns {CSSStyleSheet} new blankstylesheet
 */
var sheet = (function() {
    // Create the <style> tag
    var style = document.createElement("style");

    // WebKit hack :(
    style.appendChild(document.createTextNode(""));

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style.sheet;
})();

/**
 * Add specified CSS rule to the specified stylesheet
 * @param {CSSStyleSheet} sheet    a CSSStyleSheet object
 * @param {string}        selector CSS selector rule; include “.” for classes or “#” for IDs
 * @param {string}        rules    CSS properties for this selector
 * @param {integer}       index    index detailing where to add the new rule
 */
function addCSSRule(sheet, selector, rules, index = 0) {
    if ("insertRule" in sheet) {
        sheet.insertRule(selector + "{" + rules + "}", index);
    } else if ("addRule" in sheet) {
        sheet.addRule(selector, rules, index);
    }
}

// add a yellow background to highlighted elements
addCSSRule(sheet, ".style-highlight", "background-color: yellow");
