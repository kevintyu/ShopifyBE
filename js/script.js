/**
 * Parse entire warehouse information from html page
 * name, categories, for each category of items
 * @returns warehouse object
 */
 function getWarehouseInfo() {	
	let categoriesContainer = document.getElementById('categoriesContainer');
	// Get total number of categories
	let N = categoriesContainer.getAttribute('data-total');	
	// Get id from <input type="hidden" />
	let id =  document.getElementById("warehouseID").value;
	// Get name from textbox
	let name = document.getElementById("warehouseNameInput").value;


	// Prepare warehouse object
	let warehouse = {
		id: id, 
		name: name, 
		stock: {},
	};
    // Fill stock with categories
	let categories = {"stock": {}};
	
	for(let i = 0; i < N; ++i) {
		let curCatContainer = document.getElementById(`collapseCategory${i}`);
		let rows = curCatContainer.querySelectorAll('table tbody tr');
		// Extract category name
		let categoryName = curCatContainer.previousElementSibling.innerText;
		warehouse["stock"][categoryName] = {};
		
		// Extract menu items for current category
		for(let j = 0; j < rows.length; ++j) {
			let cols = [...rows[j].querySelectorAll('td')];
			let fields = ['id', 'name', 'description', 'price'];
			
			// Map table column values to name from "fields" array
			let stockItem = {};
			for (let k = 0; k < fields.length; ++k) { stockItem[fields[k]] = cols[k].innerHTML; }
			
			// To reconstuct format of the warehouse json object we need to remove "id" property
			let id = stockItem.id;
			delete stockItem.id;
			
			warehouse['stock'][categoryName][id] = stockItem;
		}
	}
	
	return warehouse;
    
}

/**
 * Generate unique id with respect to current warehouse stock items
 * This function gather all "id" values of menu items from each category
 * Assuming they in asc or desc order, then find max of these id's
 * Increments maxID untill its unique value (not found int the "ids" array)
 * @returns new unique id that can be used later to insert new menu item
 */
 function getUniqueID(warehouse) {
	let ids = Object.keys(warehouse["stock"]).map(category => Object.keys(warehouse["stock"][category])).flat();
	let unique = Math.max(...ids);
	while(ids.find(item => item == unique) != null) {
		unique++;
	}
	
	return unique;
}

/**
 * Submit warehouse modification changes to the webserver by making ajax PUT request
 */
 function editWarehouse(e) {
	e.preventDefault();
	
	console.log('edit');
	// Parse warehouse information
	let data = getWarehouseInfo();
	const URL = '/warehouses/' + data.id;
	
	// Making "PUT" request
	let request = new XMLHttpRequest();
	request.open("PUT", URL, true);
	request.setRequestHeader("Content-Type", "application/json");
	request.onreadystatechange = function () { // Handle server response
		if (request.readyState === 4 && request.status === 200) {
			console.log('Response: ', request.responseText);
			var json = JSON.parse(request.responseText);
			if(json.status == false) { // Failure status -> show error 
				let errorMsg = json.data;
				errorPlaceHolder.style.display = "block";
				errorPlaceHolder.innerHTML = errorMsg;
			} else {
				alert('Saved, Confirmation Received.'); // Show confirmation
			}
		}
	};
	request.send(JSON.stringify(data));
}

/**
 * Append new stock item into selected category
 */
 function addNewStockItem(e) {
	e.preventDefault();
	let item = {};
	// Get item params
	let newItemName = document.getElementById('newItemNameInput').value.trim();
	let newItemDescription = document.getElementById('newItemDescriptionInput').value.trim();
	let newItemPrice = document.getElementById('newItemPriceInput').value.trim();
	let newItemCategory = document.getElementById('newItemCategoryInput').value.trim();
	
	let categoriesContainer = document.getElementById('categoriesContainer');
	let N = categoriesContainer.getAttribute('data-total')
	
	console.log(newItemName, newItemDescription, newItemPrice, newItemCategory);
	
	// Validate item values name and description is non empty
	if(newItemName == "") {
		console.log("New item name required");
		return;
	}
	
	if(newItemDescription == "") {
		console.log("New item description required");
		return;
	}
	
	if(newItemPrice == "" || isNaN(newItemPrice) || newItemPrice <= 0) {
		console.log("New item price must be positive integer value");
		return;
	}
	
	// specified category is not empty and exist in the dropdown of all categories
	if(newItemCategory == "") {
		console.log("New item category required");
		return;
	}
	
	let warehouse = getWarehouseInfo();
	
	if(!warehouse["stock"].hasOwnProperty(newItemCategory)) {
		console.log("Incorrect category");
		return;
	}
	
	// Get new unique id that we will use for new menu item (menu item id should be unique)
	let newItemID = getUniqueID(warehouse);
	
	warehouse["stock"][newItemCategory][newItemID] = {
		name: newItemName,
		description: newItemDescription,
		price: newItemPrice,
		category: newItemCategory,
	};
	
	console.log(warehouse["stock"][newItemCategory]);
	
	// Clear placeholders
	document.getElementById('newItemNameInput').value = "";
	document.getElementById('newItemDescriptionInput').value = "";
	document.getElementById('newItemPriceInput').value = "";
	
	// Reflect changes to "category table"
	// Find category by name
	for(let i = 0; i < N; ++i) {
		let curCatContainer = document.getElementById(`collapseCategory${i}`);
		let tbody = curCatContainer.querySelector('table tbody');
		// Extract category name
		let categoryName = curCatContainer.previousElementSibling.innerText;
		// Check if we found target table
		if(categoryName == newItemCategory) { // Append menu item info into table under selected category
			// Create row
			let row = tbody.insertRow(-1);
			// Create <td>'s
			let cellID = row.insertCell();
			cellID.appendChild(document.createTextNode(newItemID));
			
			let cellName = row.insertCell();
			cellName.appendChild(document.createTextNode(newItemName));
			
			let cellDescription = row.insertCell();
			cellDescription.appendChild(document.createTextNode(newItemDescription));
			
			let cellPrice = row.insertCell();
			cellPrice.appendChild(document.createTextNode(newItemPrice));
			break;
		}
	}
}

/**
 * Append new category to the warehouse information
 */
 function addNewCategory(e) {
	e.preventDefault();
	console.log('addNewCategory');	
	let categoriesContainer = document.getElementById('categoriesContainer');
	let N = categoriesContainer.getAttribute('data-total')
	let newCategoryName = document.getElementById('newCategoryInput').value.trim();
	let errorPlaceHolder = document.getElementById("errorPlaceHolder");

	errorPlaceHolder.style.display = "none";
	errorPlaceHolder.innerHTML = "";

	// Blank category name is not allowed, do nothing
	if(newCategoryName.length == 0 || newCategoryName == "") {
		console.log("empty");
		return;
	}
	console.log("newCategoryName: ", newCategoryName);
	
	// Ensure that specified category is unique 
	let warehouse = getWarehouseInfo();
	let obj = Object.keys(warehouse["stock"]).find(item => item.toLowerCase() == newCategoryName.toLowerCase());
	if(obj != null) { // Category already exist
		console.log("Category already exist");
		// Show error
		errorPlaceHolder.style.display = "block";
		errorPlaceHolder.innerHTML = "Category already exist";
		// Hide error after 8s
		setTimeout(() => {
			errorPlaceHolder.style.display = "none";
			errorPlaceHolder.innerHTML = "";
		}, 8000);
		return ;
	}
	
	// Append new "section" for new category
	// This is "header" with category name
	// and table with menu items, for now table is empty
	let newCatContainer = document.createElement('div');
	newCatContainer.className = "mb-3";
	newCatContainer.innerHTML = `
	<button class="form-control btn btn-lg btn-info" type="button" data-bs-toggle="collapse" 
			data-bs-target="#collapseCategory${N}" aria-expanded="false" aria-controls="collapseCategory${N}">
			${newCategoryName}
		</button>
		<div class="collapse" id="collapseCategory${N}">
			<table class="table">
				<thead>
					<tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th></tr>
				</thead>
				<tbody>
				</tbody>						
			</table>
		</div>`;
	
	
	categoriesContainer.append(newCatContainer);
	
	// Append new category to dropdown
	let select = document.getElementById('newItemCategoryInput');
	var opt = document.createElement('option');
    opt.value = newCategoryName;
    opt.innerHTML = newCategoryName;
    select.appendChild(opt);
	
	// Set custom attribute that represent total number of categories
	categoriesContainer.setAttribute('data-total', Number(N) + 1);	
	
	document.getElementById('newCategoryInput').value = "";
}

/**
 * Submit new warehouse object 
 * by making ajax POST request to webserver
 */
 function addWarehouse(e) {	
	e.preventDefault();
	// Endpoint
	const URL = "/warehouses";
	let errorPlaceHolder = document.getElementById("errorPlaceHolder");
	
	console.log('addwarehouse');
	// Grab form values
	let warehouseName = e.target['name'].value;
	
	console.log(name);
	
	// Create warehouse object
	let data = {
		name: warehouseName,
	};
	
	// Create and send request
	let request = new XMLHttpRequest();
	request.open("POST", URL, true);
	request.setRequestHeader("Content-Type", "application/json");
	request.onreadystatechange = function () {
		if (request.readyState === 4 && request.status === 200) { // Handle server response
			console.log('Response: ', request.responseText);
			var json = JSON.parse(request.responseText);
			if(json.status == false) { // Server response - operation failure
				//alert()
				let errorMsg = json.data;
				errorMsg = errorMsg.replace('<name>', 'Warehouse Name');
				// Show error message with text that server send to us
				errorPlaceHolder.style.display = "block";
				errorPlaceHolder.innerHTML = errorMsg;
			} else {// Everything okay, navigate to page with warehouse details
				window.location.replace(`${URL}/${json.data.id}`);
			}
		}
	};
	request.send(JSON.stringify(data));
}
const onLoad = () => {
	console.log('On load');
};

window.onload = onLoad;
