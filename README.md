# voluntary.app

This project is a set of frameworks and an application for an in-browser webRTC-based secure p2p messaging app platform. 
A decentralized Twitter-like app is included as an example. 

Project website:

[https//voluntary.net](https//voluntary.net)
    
Github page:

[https://github.com/Voluntarynet/voluntary.app](https://github.com/Voluntarynet/voluntary.app)
    
Demo site:

[https://voluntary.app](https://voluntary.app)
    
User & developer slack channels:

[https://join.slack.com/t/voluntaryapp/shared_invite/enQtNDYwMjIyODQ4MTAzLWQ2YzRhMzAwZDI4OTFhZmY4MmYyNDc4YWJkY2ExMWU5M2U4ZjgyNDFhNjQxZTFjM2U0NThmZGJmYWFjZDU0ODQ](https://join.slack.com/t/voluntaryapp/shared_invite/enQtNDYwMjIyODQ4MTAzLWQ2YzRhMzAwZDI4OTFhZmY4MmYyNDc4YWJkY2ExMWU5M2U4ZjgyNDFhNjQxZTFjM2U0NThmZGJmYWFjZDU0ODQ)


## User Architecture Overview

Voluntary.net is a P2P messaging system that works inside your browser. All of your data is stored using client side browser storage. There is no 
"account" stored on a sever anywhere. Instead, the client side app creates a unique cyptographic key pair composed of a public key and a private key. 
The public key pair is the equivalent of your email address. You can share it with others and they can use it as an address to send you messages.  
The private key is stored inside your web browser and is used to cryptographically sign messages you send to others 
(in a way that proves only you could have sent it) and decrypt messages sent by others to your public key address.

When you send a message to another address, it encrypts the message so only the receiver can read it, 
and signs the message in a way that proves that you sent it. When you are connected to the internet, 
the client will try to find anyone in your contact list that's online and share the message with them, regardless of whether or not the message is for them.

A contact that your client shares a message will check the message signature to make sure it's from you and that you are likewise in their contact list. If so, it will attempt to decrypt the message. If they can decrypt it, the message is for them. If not, it's for someone else and their client will store the message and share it with any of their contacts that are interested in your messages. In this way, your message will be propogated among your contacts until it reaches the intended recipient and but without revealing who that recipient is. 



## Getting Started as a User

This project is a set of frameworks and an application for an in-browser webRTC-based secure p2p messaging app platform. 
The following is a brief tutorial of how to get started:

### opening the app

The app can be opened in several ways:

1. by opening https://voluntary.app in a web browser
2. by opening downloading the source and opening the index.html file in a web browser
3. putting the repo on your own local or remote web server and loading index.html from it

### creating an identity

1. navigate to /Identities
2. click on the + button in the next column to create a new identity
3. click on the new identity, then click on it's "profile" row
4. click on the name field and enter a name for the identity

You've now created and named an identity. 
You can find it's public key in it's Profile. 
The public key is how you'll share your identity with other people.
You can create as many identities as you like and use them to separate different parts of your life (work, friends, hobbies, etc).

### adding a contact

1. get a friend to share their public key with you 
2. navigate to one of your identities (the one you'd like to add this contact to) 
3. click on "contacts" and hit the + button at the top of the next column 
4. click on the new contact and then click on it's profile row
5. paste your friend's public key into the public key field and set the name field

You've now added a contact to one of your identities. 
You'll now be able to see their public posts.
If they add you as a contact too, they'll see your public posts and you'll be able to exchange direct messages with them.

### sending a direct message

[forthcoming]


### posting, replying, reposting, liking

[forthcoming]





## Getting Started as a Developer

This project is a set of frameworks and an application for an in-browser webRTC-based secure p2p messaging app platform. The code 

The source code is available at:

[https://github.com/Voluntarynet/voluntary.app](https://github.com/Voluntarynet/voluntary.app)

Once you've cloned the repo, you can run the app by opening:

    index.html

in your local Chrome browser. index.html is a contcatenation of all the JS and CSS resource in the project and is 
built by running the archive/archive.js script in nodejs. 
    
Alternatively, you can open:

    index_incremental.html

whice uses JS code to import all of the resources in the proper order.

The development environment I use is VSCode. I strongly recommend using it as it 
supports running the build scripts and connecting to the Chrome debugger which allows
you to add break points and click on the stack trace to open and edit the related code.

To get the build scripts to work, you'll need to install nodejs:

[https://nodejs.org/en/](https://nodejs.org/en/)

To get the launch scripts and Chrome debugging to work, you'll need to install this VSCode debugger: 

[https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)
    
When developing with the VSCode debugger, you'll want to click on the debugger tab, and use the "Launch Local Incremental File" script. 
This will allow you to set breakpoints and stack browse via the source files (vs the compiled index.html).


### Developer Overview

The project contains a number of components:

- an in-browser webRTC-based decentralized messaging platform 
- a desktop-like (e.g. AppKit) UI framework in which single page browser apps can be built with no templates or html
- a Miller column based reactive UI system with view system that automatically adjusts to work on desktop and mobile screen sizes
- a naked objects framework which dynamically generates the UI based on model objects (most apps require little or no UI code)
- an intergrated client-side transparent persistence framework (most apps only require developer to declare stored objects and fields)
- a notifications system which automatically synchronizes the UI, model, and persistence

On top of this system, decentralized apps (dapps) can quicky be built with very little code. 

#### Javascript and CSS importing

When the app launches, it runs JSImporter.js and LoadProgressBar.js. 
JSImporter handles importing JS and CSS, and LoadProgressBar presents a UI to show the progress of the loading.
JSImporter looks in the root folder for an _imports.js file. 
If found, it loads any paths (treated as relative paths) in the order they are found. 
These paths can be Javascript (including other _import.js files), CSS. 
This provides a means of doing relative library loading. 

If your import requires some callback to be called after the imports are complete, 
you can add a pushDoneCallback to the related _imports.js file. For example, the top level _imports.js ends with:

    JSImporter.pushDoneCallback( () => {
        PeerApp.shared().run()
    })

which starts the application.

The convention is to use one _import.js file per folder, and to use a single css file per folder (if needed) named _css.css.
The archive/archive.js script can be used to walk these imports to generate the index.html file when preparing a release.

#### UI Framework

The UI framework code can be found in src/lib/view/ folder. 

All view classes inherit from DivView.js, which is an







