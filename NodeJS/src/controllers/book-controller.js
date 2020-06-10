const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("postgres://kronk:GfEuJUBq37jWU3tgD48mHQ2@localhost:5432/bookchain_test");

const db = require("../models");
const Books = require("../models/Books.js")(sequelize, DataTypes);
const Op = db.sequelize.Op;
const axios = require('axios');

//Import EOS interaction APIs and dependencies
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');     
const fetch = require('node-fetch');                                   
const { TextEncoder, TextDecoder } = require('util');                  
//Import EOS Keygen api
const ecc = require('eosjs-ecc');

//Initialize a book with quantity 0 (Used when creating a request)
exports.init = (req, res) => {
  //Validate request
  if (!req.body.isbn) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  //Load from req
  const isbn = req.body.isbn;
  //GET OpenLibrary API
  axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`).then(
    response => {
	//get response, add to DB
        const data = response["data"][`ISBN:${isbn}`];
        console.log(JSON.stringify(data.authors));
        const book = {
            ISBN: isbn,
            Title: data.title,
            Authors: JSON.stringify(data.authors),
            Thumbnail_url: data.cover.large,
            Info_url: data.url,
            Cover_url: data.cover.medium,
            Publish_date: data.publish_date,
            Quantity: 0,
            Num_pages: data.number_of_pages,
            ID_json: JSON.stringify(data.identifiers),
            Description: JSON.stringify(data.excerpts)
        }

        Books.create(book)
          .then(data => {
            res.send(data);
          })
          .catch(err => {
			res.status(500).send({
              message:
                err.message || "Some error occurred while creating the Book."
          });
        });
  })
  .catch(error => {
    console.log(error);
  });
};




//CREATE
exports.create = (req, res) => {
  //Validate request
  if (!req.body.isbn) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }
  //Load from req
  const isbn = req.body.isbn;
  const privateKeyPair = req.body.privateKey;
  const privateKey = privateKeyPair.split(':')[1];
  const accountName = privateKeyPair.split(':')[0];
  
  //Set up API
  const signatureProvider = new JsSignatureProvider([privateKey]);
  const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
  
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  //Logging
  console.log("Creating Book");

  //GET OpenLibrary API
  axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`).then(
    response => {
		//Blockchain Action
		(async () => {
			try {
				const result = await api.transact({
					actions: [{
						account: 'librarian',
						name: 'donate',
					authorization: [{
						actor: accountName,
						permission: 'active',
					}],
					data: {
						user: accountName,
						ISBN: parseInt(isbn),
					},
					}]
					}, {
						blocksBehind: 3,
						expireSeconds: 30,
				});
			} catch (e) {
  				console.log('\nCaught exception: ' + e);
  				if (e instanceof RpcError)
    					console.log(JSON.stringify(e.json, null, 2));
			}
		})();
      	//get response, add to DB
        const data = response["data"][`ISBN:${isbn}`];
        console.log(JSON.stringify(data.authors));
        const book = {
            ISBN: isbn,
            Title: data.title,
            Authors: JSON.stringify(data.authors),
            Thumbnail_url: data.cover ?  data.cover.large: "",
            Info_url: data.url,
            Cover_url: data.cover ? data.cover.medium: "",
            Publish_date: data.publish_date,
            Quantity: 1,
            Num_pages: data.number_of_pages,
            ID_json: JSON.stringify(data.identifiers),
            Description: JSON.stringify(data.excerpts)
        }

        Books.create(book)
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the Book."
          });
        });
  })
  .catch(error => {
    console.log(error);
  });
};

//FIND ONE
exports.findByIsbn = (req, res) => {
  const isbn = req.params.isbn;

  Books.findByPk(isbn)
    .then(data => {
      res.json(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving Book with isbn=" + isbn
    });
  });
};

//FINDALL
exports.findAll = (req, res) => {
  //possibly find by author
  const title = req.query.title;
  var condition = title ? { author: `%${title}%` } : null;

  Books.findAll({ where: condition} )
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving books."
      });
  });
}

//UPDATE a book's quantity
exports.updateQuantity = async (req, res) => {
  const isbn = req.params.isbn;
  const quantity = req.body.quantity;
  const privateKeyPair = req.body.privateKey;
  const actionType = req.body.actionType; //Either "retrieve" or "donate"
  //Seperate Key and Account name from Keypair
  const privateKey = privateKeyPair.split(':')[1];
  const accountName = privateKeyPair.split(':')[0];
  //Set up API
  const signatureProvider = new JsSignatureProvider([privateKey]);
  const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
  
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  //Logging
  console.log("Quantity: " + quantity);
  console.log("ISBN" + isbn);
  //Perform an Async action to validate that the user exists and has a token if they are retrieving a book
  let promise = axios.post('http://localhost:12346/api/books/validate', {
    "privateKey": privateKeyPair
  });
  let response = await promise;
  //if the user is retrieving a book and they have at least 1 token to spend, or if they are just donating, continue
  if((actionType=="retrieve" && response.data["balance"] >= 1) || actionType=="donate"){
    //Perform the Database Update
    Books.update({Quantity: quantity}, {
      where: { ISBN: isbn }
    })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Book was updated successfully."
        });
        //Blockchain Action
        if(actionType == "retrieve"){
	  const memoField = "re:"+isbn;
	  (async () => {
	    try {
	      const result = await api.transact({
	        actions: [{
		  account: 'eosio.token',
		  name: 'transfer',
		authorization: [{
		  actor: accountName,
		  permission: 'active',
		}],
		data: {
		  from: accountName,
		  to:'librarian',
		  quantity:'1 BOOK',
		  memo:memoField,
		},
		}]
		}, {
		  blocksBehind: 3,
		  expireSeconds: 30,
	        });
	    } catch (e) {
	      console.log('\nCaught exception: ' + e);
	      if (e instanceof RpcError)
		console.log(JSON.stringify(e.json, null, 2));
	   }
	  })();
			
	}else if(actionType == "donate"){
	  (async () => {
	    try {
	      const result = await api.transact({
		actions: [{
	          account: 'librarian',
		  name: 'donate',
		authorization: [{
		  actor: accountName,
		  permission: 'active',
		}],
		data: {
		  user: accountName,
		  ISBN: parseInt(isbn),
		},
		}]
		}, {
		  blocksBehind: 3,
		  expireSeconds: 30,
	      });
	    } catch (e) {
	      console.log('\nCaught exception: ' + e);
	      if (e instanceof RpcError)
	        console.log(JSON.stringify(e.json, null, 2));
	   }
	  })();
        }
		
      } else {
        res.send({
          message: `Cannot update Book with isbn=${isbn}. Either the book was not found or request body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Book with isbn=" + isbn
      });
    });
  //If the user does not have a token and is trying to retreive, we send an error.
  }else{
    res.status(500).send({message:"Not Enough Tokens"});
  }
};

//Wrapper Route that handles donating one book
exports.donate = (req, res) => {
	//Extract parameters
	const isbn = req.params.isbn;
	const privateKeyPair = req.body.privateKey;
  
	//Find if the book exists
	Books.findAll({where: {ISBN : isbn} }).then(item => {
	console.log(item);
	//If it does not exist create the book
	if(item && item.length == 0){
	axios.put(`http://localhost:12346/api/requests/isbn/${isbn}`);
        axios.post(`http://localhost:12346/api/books/`, {
          "isbn": isbn,
		  "privateKey":privateKeyPair
        }).then(
		res.send({message: "Donated succesfully"})
	)
        .catch(error => {
          console.log(error);
        });
    //If it does exist, we need to use UpdateQuantity
    }else{
	const newStock = item[0].Quantity +1;
	//Perform async call to update quantity
	axios.put('http://localhost:12346/api/books/'+isbn, {
		"privateKey":privateKeyPair,
		 "quantity": newStock,
		 "actionType":'donate'
		  
	}).then(
		res.send({
        		  message: "Book was donated successfully."
        	})

	)
	.catch(error => {
		 console.log(error);
	});
    }
  });


}

//DELETE
exports.delete = (req, res) => {
  const isbn = req.params.isbn;

  Books.destroy({
    where: { ISBN: isbn }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Book was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete book with isbn=${isbn}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Book with isbn=" + isbn
      });
    });
};

//REPORT MISSING
exports.reportMissing = (req,res) => {
	const isbn = req.body.isbn;
	//Private key of the "Resolver" account that performs nullify actions.
	const privateKey = "5K2E3LFQuBXgw9MfrC14oJ4puA9oNQn2UL3Lwo6eDont3eHbAxH";
	const accountName = "resolver";
	//Set up API
  	const signatureProvider = new JsSignatureProvider([privateKey]);
  	const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
  
  	const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

	//Blockchain Action
		(async () => {
			try {
				const result = await api.transact({
					actions: [{
						account: 'librarian',
						name: 'nullify',
					authorization: [{
						actor: accountName,
						permission: 'active',
					}],
					data: {
						user: accountName,
						ISBN: parseInt(isbn),
					},
				}]
			}, {
				blocksBehind: 3,
				expireSeconds: 30,
			});
		} catch (e) {
  			console.log('\nCaught exception: ' + e);
  			if (e instanceof RpcError)
    				console.log(JSON.stringify(e.json, null, 2));
		}
	})();
	
	//Perform Database Action
	Books.update({Quantity: 0}, {
    		where: { ISBN: isbn }
  	})
    	.then(num => {
      		if (num == 1) {
        		res.send({
          			message: "Book was updated successfully."
        		});
      		} else {
        		res.send({
          			message: `Cannot update Book with isbn=${isbn}. Either the book was not found or request body is empty!`
        		});
      		}
    	})
    	.catch(err => {
      		res.status(500).send({
        		message: "Error Nullifying Book with isbn=" + isbn
      		});
    	});
	
	
}

//Get a user's balance
exports.balance = (req,res) => {

  //Extract Key and Account name from keypair
  const privateKeyPair = req.body.privateKey;
  const privateKey = privateKeyPair.split(':')[1];
  const accountName = privateKeyPair.split(':')[0];
  
  //Set up API
  const signatureProvider = new JsSignatureProvider([privateKey]);
  const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  //Async API call to get the user's balance
  (async () => {
    try {
      const result = rpc.get_currency_balance('eosio.token', accountName, 'BOOK').then(result => {
        console.log(result);
	//Send Balance
	res.send({ "balance": result[0]});
      });
    } catch (e) {
      console.log('\nCaught exception: ' + e);
      if (e instanceof RpcError)
        console.log(JSON.stringify(e.json, null, 2));
    }
  })();
	
}

//Create a new key and register it on the blockchain under a new account
exports.newkey = (req,res) => {	
	//Dev Key
	const signatureProvider = new JsSignatureProvider(["5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"]);
  	//API Setup
	const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
  
 	const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
	//Generate name
	var nameSpace = 'abcdefghijklmnopqrstuvwxyz';
	var name = '';
	for (var i = 11; i > 0; --i) name += nameSpace[Math.floor(Math.random() * nameSpace.length)];
	//Generate random key	
	ecc.randomKey().then(privateKey => {
		//Get the public key
		var publicKey = ecc.privateToPublic(privateKey);
		//Register user on the blockchain
		(async () => {
			try{
				const result = await api.transact({
    					actions: [{
     						 account: 'eosio',
     						 name: 'newaccount',
     					 authorization: [{
       						 actor: 'eosio',
       						 permission: 'active',
     					 }],
     					 data: {
       						 creator: 'eosio',
       						 name: name,
       					 	 owner: {
         						threshold: 1,
         				 		keys: [{
           							key: publicKey,
            						weight: 1
         				 	 }],
          					accounts: [],
          					waits: []
        				},
        				active: {
         					 threshold: 1,
          					 keys: [{
            						key: publicKey,
            						weight: 1
         					 }],
          					 accounts: [],
          				 	 waits: []
       					},
     					},
   					}
   				]
  				}, {
    					blocksBehind: 3,
    					expireSeconds: 30,
  				}).then(console.log("Complete"));
			} catch (e) {
  				console.log('\nCaught exception: ' + e);
  				if (e instanceof RpcError)
    					console.log(JSON.stringify(e.json, null, 2));
			}

		})();
		//Send the response containing the privateKeypair (name:key)			
		res.send({
	        	privateKey: name+":"+privateKey
		})
	})
		
		
}

//Similar to balance but with some formatting, used in internal requests
exports.validate = (req,res) => {
  //Extract key info
  const privateKeyPair = req.body.privateKey;
  const privateKey = privateKeyPair.split(':')[1];
  const accountName = privateKeyPair.split(':')[0];
  
  //Set up API
  const signatureProvider = new JsSignatureProvider([privateKey]);
  const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  //Async call to get balance
  (async () => {
    try {
      const result = rpc.get_currency_balance('eosio.token', accountName, 'BOOK').then(result => {
        //Send response
        res.send({"balance":result[0].split(" ")[0]});
        console.log(result[0].split(" ")[0]);
      });
    } catch (e) {
      console.log('\nCaught exception: ' + e);
      if (e instanceof RpcError)
        console.log(JSON.stringify(e.json, null, 2));
      res.send("Failure");
    }
  })();

}

