"use strict"

/*

    BMURLImage

*/

window.BMURLImage = class BMURLImage extends BMNode {
    
    initPrototype () {
        this.newSlot("path", "")
        this.newSlot("dataURL", "")
    }

    init () {
        super.init()
        this.setNodeMinWidth(270)
        return this
    }

    title () {
        return this.path().fileName()
    }

    subtitle () {
        return this.path().pathExtension()
    }

    setPath (aPath) {
        if (this._path !== aPath) {
            this._path = aPath
            this.loadDataURL()
        }
        return this
    }

    loadDataURL () {
        if (this.isDebugging()) {
            this.debugLog(".loadDataURL() " + this.path())
        }

        const request = new XMLHttpRequest();
        request.open("get", this.path());
        request.responseType = "blob";
        request.onload = () => { this.loadedRequest(request) };
        request.send();
        return this
    }

    loadedRequest (request) {

        if (this.isDebugging()) {
            this.debugLog(".loadedRequest() ", request)
        }

        const fileReader = new FileReader();

        fileReader.onload = () => {
            const dataURL = fileReader.result
            this.setDataURL(dataURL);

            if (this.isDebugging()) {
                this.debugLog(" setDataURL() ", dataURL)
            }

        };

        fileReader.readAsDataURL(request.response); 
        
        return this
    }

    didFetchDataURL (dataURL) {
        this.setDataURL(dataURL);
        
        /*
        // now just to show that passing to a canvas doesn't hold the same results
        var canvas = document.createElement("canvas");
        canvas.width = myImage.naturalWidth;
        canvas.height = myImage.naturalHeight;
        canvas.getContext("2d").drawImage(myImage, 0, 0);
        */

        return this
    }

}.initThisClass()
