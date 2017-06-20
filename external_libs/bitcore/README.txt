
To add components with .min.js files, add the new repo reference to the file:

	bower.json

and then run:

	bower install

in this folder. 


ALSO:


needed to change 

	require('bitcore') 

occurances in bitcore-message.js to 

	require('bitcore-lib')