"use strict"


/*

    FontFace

    Supports using import system to load fonts via Javascript by
    dynamically adding font link elements to document.head.

*/




window.BMFontFace = DomView.extend().newSlots({
    type: "BMFontFace",
    path: null,
    name: null,
    url: "https://fonts.googleapis.com/css?family=Open+Sans:400italic,400,300,700", // example
}).setSlots({
    init: function () {
        this.setElementType("link") // TODO: use a method override instead?
        DomView.init.apply(this)
    },


    createElement: function() {
        const e = document.createElement(this.elementType())
        e.setAttribute('rel', 'stylesheet');
        e.setAttribute('type', 'text/css');
        //e.setAttribute('href', this.url());
        //this.setUrl(this.url())
        return e
    },

    setUrl: function(aUrlString) {
        this.element().setAttribute('href', aUrlString);
        return this
    },

    url: function() {
        return this.element().getAttribute("href");
    },

})


/*
element.style.fontFamily = "Arial, Sans Serif";
Now, to import a font, simply add a stylesheet or <style> element to the DOM, which has a font-face rule:

var link = document.createElement('link');
link.setAttribute('rel', 'stylesheet');
link.setAttribute('type', 'text/css');
link.setAttribute('href', 'https://fonts.googleapis.com/css?family=Open+Sans:400italic,400,300,700');
document.head.appendChild(link);
*/

/*

also see: typekit/webfontloader


<script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
<script>
  WebFont.load({
    google: {
      families: ['Droid Sans', 'Droid Serif']
    }
  });
</script>


<script>
   WebFontConfig = {
      typekit: { id: 'xxxxxx' }
   };

   (function(d) {
      var wf = d.createElement('script'), s = d.scripts[0];
      wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
      wf.async = true;
      s.parentNode.insertBefore(wf, s);
   })(document);
</script>


*/

/*

// ------------------------------------------------------------------
//getting the File object from a drop operation

var file = e.dataTransfer.files[0];
var reader = new FileReader();
reader.onload = function(event) {
    var contents = event.target.result;
    //most important thing here - appending style into HEAD (jQuery)
    $('head').append('<style type="text/css">@font-face { font-family:"myFont";
    src: url("'+contents+'"); }</style>');
};

reader.onerror = function(event) {
    console.error("File could not be read! Code " + event.target.error.code);
};

//read file
reader.readAsDataURL(file);
*/

/*
xFinal CSS appended to head look's like this:

<style type="text/css">
    @font-face {
        font-family: "myFont";
        src: url("data:;base64;Ahs5hD3..."); // here come's the URL of 'cached' font. A lots of letters and digits
    }
</style>

ANSWER:

I don't have the time right now, to try it out, but as I've read your code, the issue may/should be, that you don't support a mime time in your data uri:

 src: url("data:;base64;Ahs5hD3..."
A rather "agressive" counter-example:

src: url(data:application/x-font-woff;charset=utf-8;base64,d09GRg
I'll get back to trying it out and digging into it.

*/
