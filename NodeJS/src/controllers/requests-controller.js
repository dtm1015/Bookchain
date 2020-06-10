// import sequelize from '../models';
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("postgres://kronk:GfEuJUBq37jWU3tgD48mHQ2@localhost:5432/bookchain_test");
const Requests = require("../models/Requests.js")(sequelize, DataTypes);
const Books = require("../models/Books.js")(sequelize, DataTypes);
const axios = require('axios');
//Imports for using EOS interactions
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      
const fetch = require('node-fetch');                                    
const { TextEncoder, TextDecoder } = require('util');                   

//Create a new Request
exports.create = async (req, res) => {
  //Make sure request is valid
  if (!req.body.isbn || !req.body.privateKey || !req.body.investment) {
    res.status(400).send({
      message: "Missing content in body!"
    });
    return;
  }
  //Local aliases to arguments for readabilty
  const isbn = req.body.isbn;
  const privateKeyPair = req.body.privateKey;
  //Extract account name and actual private key from provided keypair
  const privateKey = privateKeyPair.split(':')[1];
  const accountName = privateKeyPair.split(':')[0];
  
  //Set up API
  const signatureProvider = new JsSignatureProvider([privateKey]);
  const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
  
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  
  //Perform a post request to get the User's balance and insure they exist.
  let promise = axios.post('http://localhost:12346/api/books/validate', {
                                        "privateKey": privateKeyPair
  });
  let response = await promise;
  console.log(req.body.investment);
  //Continue if the user has enough token to create the request
  if((response.data["balance"] >= req.body.investment)){
    //Create the request unit
    const request = {
      Book_ID: req.body.isbn,
      Investment: req.body.investment
    };
    //Perform a database query to ensure the book requested exists in the table
    Books.findAll({where: {ISBN : isbn} }).then(item => {
        //If it does not exist, we initialize it to compy with table dependencies
	if(item == "[]"){
          axios.post(`http://localhost:12345/api/books/init`, {
            "isbn": `${isbn}`
          }).then()
          .catch(error => {
            console.log(error);
          });
        }
    }).catch(error => {
  	console.log(error);
	res.send({
		message: "Searching books failed"
	});	
    });
    //Perform an async action on the database.
    (async () => {
	try {
		const memoField ="sr:"+isbn;
		const investField =  req.body.investment + " BOOK";
		//Form and perform the transaction
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
					quantity:investField,
					memo:memoField,
				},
				}]
				}, {
					blocksBehind: 3,
					expireSeconds: 30,
				});
		//Create the request in the database		
		Requests.create(request)
			.then(data => {
				res.send(data);
		})
		.catch(err => {
			res.status(500).send({
			message:
				err.message || "Some error occurred while creating the request."
		});
	});		
				
				
	} catch (e) {
		console.log('\nCaught exception: ' + e);
		if (e instanceof RpcError)
				console.log(JSON.stringify(e.json, null, 2));
		res.status(500).send({
                        message:
                                err.message || "Some error occurred while creating the request."
                });
        } 

    })();
  //In the case that the user does not have enough tokens, we send an error message.
  }else{
    res.status(500).send({"message": "Not enough tokens"});
  }

};

//Increase an existing Request by an amount
exports.increase = async (req, res) =>{
        //Get request parameters
	const reqIsbn = req.params.isbn;
	const amt = req.body.Investment;
	const privateKeyPair = req.body.privateKey;
	//Extract real key and account names
	const privateKey = privateKeyPair.split(':')[1];
	const accountName = privateKeyPair.split(':')[0];

	//Set up API
	const signatureProvider = new JsSignatureProvider([privateKey]);
	const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
  
	const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
	//Define variable to hold old amount, with -1 as a sanity check
	var oldamount = -1;
	//Perform an async action to get the request's prior investment
   	let promise = axios.get(`http://localhost:12346/api/requests/isbn/${reqIsbn}`);
    	let response = await promise;
    	if(response != "[]"){
      		oldamount = response.data[0].Investment;
 	}
	//Perform an async action to get the account's balance and validate that it exists.
	let promiseValidate = axios.post('http://localhost:12346/api/books/validate', {
                "privateKey": privateKeyPair
 	});
        let responseBalance = await promiseValidate;
        //Continue if the user has the balance available to contribute
  	if((responseBalance.data["balance"] >= amt)){

		//Perfom a blockchain action to increase the request
		(async () => {
        		try {
                		const memoField ="sr:"+reqIsbn;
                		const investField =  amt + " BOOK";
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
                                        	quantity:investField,
                                        	memo:memoField,
                                	},
                                	}]
								
                                }, {
                                        blocksBehind: 3,
                                        expireSeconds: 30,
                                });
								
				//Now perform the database update
				Requests.update({Investment: oldamount+amt}, {
					where : {Book_ID: reqIsbn}
				}).then(num => {
					if (num >= 1) {
						res.send({
							message: "Request was updated successfully."
						});
					} else {
						res.send({
							message: `Cannot update Request with pk=${reqIsbn}. Either the Request entry was not found or HTTPrequest body is empty!`
						});
					}
					})
					.catch(err => {
						res.status(500).send({
							message: "Error updating request with pk=" + pk
					});
				});				
				


			}catch (e) {
 		 		console.log('\nCaught exception: ' + e);
  				if (e instanceof RpcError)
    					console.log(JSON.stringify(e.json, null, 2));
		}})();
	//In the case that the user does not have enough tokens to perform the action, send an error
	}else{
		res.status(500).send({"message":"Not enough Tokens."});
	}
};

//Fill a request
exports.fillRequest = async (req, res) => {
  const isbn = req.params.isbn;
  var id = -1;
    //Perform an async call to get the request
    let promise = axios.get(`http://localhost:12346/api/requests/isbn/${isbn}`);
    let response = await promise;
    //Set the ID if it was found
    if(response && response != "[]"){
      id = response.data[0].Request_ID;
    }
  //If the request was valid, continue
  if (id > 0){
    //Update emails and delete the request
    let send = axios.put(`http://localhost:12346/api/emails/send/${id}`);
    let del = axios.delete(`http://localhost:12346/api/requests/${id}`);

    await send, del;
  }
  //Send confirmation
  res.send("Request Filled");
};

//find requests by book
exports.findByIsbn = (req, res) => {
  const isbn = req.params.isbn;

  Requests.findAll({
    where : {
      Book_ID: isbn
    }
  })
  .then(data => {
    res.json(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Error retrieving requests with isbn=" + isbn
    });
  });
};

//find request by primary key
exports.findByPk = (req, res) => {
  const pk = req.params.pk;
  Request.findByPk(pk)
    .then(data => {
      res.json(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving Request with pk=" + pk
    });
  });
};

//Return all Requests
exports.findAll = (req, res) => {
  Requests.findAll()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving requests."
      });
  });
};

//update a Request by Pk
exports.update = (req, res) => {
  const pk = req.params.pk;

  Requests.update(req.body, {
    where : {Request_ID: pk}
  }).then(num => {
    if (num == 1) {
      res.send({
        message: "Request was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Request with pk=${pk}. Either the Request entry was not found or HTTPrequest body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating request with pk=" + pk
    });
  });
};

//DELETE a request
exports.delete = (req, res) => {
  const pk = req.params.pk;

  Requests.destroy({
    where: { Request_ID: pk }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Request was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete request with pk=${pk}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete request with pk=" + pk
      });
    });
};
