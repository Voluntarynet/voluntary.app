"use strict"

/*

`   DomElement_...
`
    Helper functions for DOM elements.
    Mostly for use inside DomView.
    Not for general consumption as elements typically shouldn't be interacted with directly. 

*/

function DomElement_atInsertElement(el, index, child) {
    const children = el.children
    
    if (index < children.length) {
        el.insertBefore(child, children[index])
        return
    }
    
    if (index === children.length) {
        el.appendChild(child)
        return
    }
    
    throw new Error("invalid dom child index")
}

function DomElement_description(element) {
    let s = false

    if (element === window) {
        s = "window"
    }

    if (!s) {
        s = element.getAttribute("id")
    }

    if (!s) {
        s = element.getAttribute("class")
    }

    if (!s) {
        s = element.tagName
    }

    return s
}

window.Element_setStyleIncludingDecendants = function(e, k, v) {
    if (e.style) {
        e.style[k] = v
    }
    
    for(let i = 0; i < e.childNodes.length; i ++) {
        const child = e.childNodes[i]
        Element_setStyleIncludingDecendants(child, k, v)
    }
}