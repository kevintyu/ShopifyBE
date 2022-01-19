const express = require('express');
const app = express();
const port = 3000;

// Page constructor
const html = require('./pageGenerator');

// Load json files into global array
var db = [
	require('./inventory/toronto.json'),
];

/**
 * Sort array of warehouse objects by id (from lowest to highest)
 */
 const sortDB = () => { db.sort((a, b) => { if(a.id < b.id) return -1; if(a.id > b.id) return 1; return 0; } ); }


// Apply initial sort
sortDB();

// Notify node that we want to use static files
app.use('/css', express.static(__dirname + '/css'));
app.use('/js',  express.static(__dirname + '/js'));

app.use(express.json());


// 1. Home Page
app.get('/', (req, res) => {
	res.send(html.constructPage('Home'));
});

// 2. List of warehouses Page
app.get('/warehouses', (req, res) => {
	if(req.accepts('html')) {
		res.send(html.constructPage('Warehouses', db));
	} else if(req.accepts('json')) {
		res.json({ "warehouses": db.map(item => item.id) }).end();
	}
});

// 3. Add Warehouse Page
app.get('/addwarehouse', (req, res) => {
	res.send(html.constructPage('Add Warehouse'));
});

// 4. Accept json of new warehouse and add to the 'db'
app.post('/warehouses', (req, res) => {
	let name = req.body.name;
	
	// Ensure that each field exist
	if(name == undefined) {
		// Send failure response
		res.json({ status: false, text: "<name> param required"});
		return;
	}	
	// check if Name is not empty
	if(String(name).length == 0) {
		// Send failure response if name is an empty string
		res.json({ status: false, text: "<name> param must be non empty string"});
		return;
	}
	
	// Find maximum id in the array of all warehouses
	let maxID = Math.max(...db.map(item => item.id));
	// Now increment max id and try to find warehouse with this id value in DB, stop if not found
	while(db.find(item => item.id == maxID) != null) {
		maxID++;
	}

	// Create new warehouse
	let newWarehouse = {
		id: maxID,
		name: name,
		stock: [] // Initially empty 
	};
	// Append to RAM db
	db.push(newWarehouse);
	
	// Send success response
	res.json({status: true, data: newWarehouse});
})

// 5. Show warehouse details
app.get('/warehouses/:warehouseID', (req, res) => {
	let id = req.params.warehouseID;
	// text/html response
	if(req.accepts('html')) {
		res.send(html.constructPage('Warehouse', db, id));
	// application/json response
	} else if(req.accepts('json')) {
		let item = db.find(item => item.id == id);
		if(item == null) {
			res.json({status: false, data: 'Not found'});
		} else {
			res.json({status: true, data: item});
		}
	}
});
// 6. PUT 
app.put('/warehouses/:warehouseID', (req, res) => {
	let id = req.params.warehouseID;
	// Search warehouse with specified id
	let warehouseIdx = db.findIndex(item => item.id == id);
	// Send "not found" response
	if(warehouseIdx == -1) {
		res.status(404).json({status: false, data: 'Not found'});
	}
	// Update warehouse data
	db[warehouseIdx] = req.body;
	// Send "success" response
	res.json({status: true, data: 'Save Success'});
});


// Start app listen at "port"
app.listen(port, () => {
	console.log(`Express App Listening At http://localhost:${port}`)
})