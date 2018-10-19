# voluntary.app

This project is a set of frameworks and an application for an in-browser webRTC-based secure p2p messaging app platform. 
A decentralized Twitter-like app is included as an example. 

Project website:

https//voluntary.net
    
Github page:

    [https://github.com/Voluntarynet/voluntary.app](https://github.com/Voluntarynet/voluntary.app)
    
Demo site:

    https://voluntary.app
    
User & developer slack channels:

	[https://join.slack.com/t/voluntaryapp/shared_invite/enQtNDYwMjIyODQ4MTAzLWQ2YzRhMzAwZDI4OTFhZmY4MmYyNDc4YWJkY2ExMWU5M2U4ZjgyNDFhNjQxZTFjM2U0NThmZGJmYWFjZDU0ODQ](https://join.slack.com/t/voluntaryapp/shared_invite/enQtNDYwMjIyODQ4MTAzLWQ2YzRhMzAwZDI4OTFhZmY4MmYyNDc4YWJkY2ExMWU5M2U4ZjgyNDFhNjQxZTFjM2U0NThmZGJmYWFjZDU0ODQ)



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

When releasing a version to go to the voluntary.app or distributed for user to run locally, 
you'll want to run the  "Launch Local Index File" script. This will build the index.html file from the JS and CSS files.


### Developer Overview

The project contains a number of components:

- an in-browser webRTC-based decentralized messaging platform 
- a desktop-like (e.g. AppKit) UI framework in which apps can be built with no templates or html
- a Miller column based scalable, reactive UI system which automatically adjusts to work on desktop and mobile
- a naked objects framework which dynamically generate the UI based on model objects (most apps require no UI code)
- an intergrated client-side transparent persistence framework (most apps require developer to declare stored objects and fields)
- a notifications system which automatically synchronizes the UI, model, and persistence

On top of this system, decentralized apps (dapps) can quicky be built with very little code. 




