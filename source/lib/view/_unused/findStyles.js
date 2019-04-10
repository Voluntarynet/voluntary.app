
/*
// find fontFamily s in a page

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

*/