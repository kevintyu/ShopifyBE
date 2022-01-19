/**
 * Class that help us to constructs html page by using
 * separate static methods for:
 * <head>		constructHeader
 * <header>		constructNavBar
 * <html>       constructPage
 *	<body>
 *		<main>
 *		PAGE CONTENT
 *		</main>
 *	</body>
 * </html>
 */
class PageGenerator{
    /**
	 * Static method which create <head> tag for us
	 * @param title: page title that should be set into header
	 */
	static constructHeader(title='Your Logistics Company') {
		return `
		<head>
			<title>${title}</title>
			<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
			<link href="/css/style.css" rel="stylesheet">
			<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
			<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
		</head>
        `;
    }

    /**
	 * Create links to navigate to different pages
	 * @param activePage: which page is currently active, depends on this value
	 * method will set apropriate styles ("active" class)
	 * Returns header menu (navigation links)
	 */
	static constructNavBar(activePage='Home') {
		let navItems = [
			{ title: 'Home', route: '/'},
			{ title: 'Warehouses', route: '/warehouses'}, 
			{ title: 'Add Warehouse', route: '/addwarehouse'}
		];
		let navBar = navItems.map(item => { return `<a ${item['title']==activePage?"class='active' ":''}href="${item['route']}">${item['title']}</a>` }) ;
		
		let header = 
		`<header>
			<div class="topnav">
				${navBar.join('\n')}
			</div>
		</header>`;

		return header;
	}

    /////////////////////////// BODY ///////////////////////////
	/**
	 * Returns content for "HOME PAGE CONTENT" page
	 * <body>
	 *   <main>
	 *   HOME PAGE CONTENT
	 *   </main>
	 * </body>
	 * tags
	 */
     static getHomePageContent() { return '<center><h2>Welcome to Express Inventory database App</h2></center>'; }


     /**
	 * Returns content for "WAREHOUSE PAGE CONTENT" page
	 * <body>
	 *   <main>
	 *    inventory content for warehouse
	 *   </main>
	 * </body>
	 * tags
	 * @param db: array of product objects
	 */
	static getWarehousesContent (db) { 
		let links = db.map(item => `<li><a href="/warehouses/${item['id']}">${item['name']}</a></li>` );
		let content = `
		<center>
			<h2>Warehouses</h2>
			<div class="vertical-menu">
				<ul>${links.join('\n')}</ul>
			</div>
		</center>
		`;
		return content;
	}

    /**
	 * Returns content for "ADD PRODUCT PAGE CONTENT" page
	 * that we will place inbetween 
	 * <body>
	 *   <main>
	 *   ADD PRODUCT PAGE CONTENT: (Form with apropriate fields to add new PRODUCT)
	 *   </main>
	 * </body>
	 * tags
	 */
	static getAddWarehouseContent() { 
		let content = 
		`<h2>Add Warehouse</h2>
		<div class="row">
			<form id='addWarehouseForm' onsubmit='event.preventDefault(); addWarehouse(event);'>
			  <div class="mb-3">
				<label for="warehouseNameInput" class="form-label">Name</label>
				<input type="text" name="name" class="form-control" id="warehouseNameInput" required>
			  </div>
			  <button type="submit" class="btn btn-primary">Submit</button>
			</form>
			<div style="display:none" class="alert alert-warning" role="alert" id="errorPlaceHolder">
			</div>
		</div>`
		return content;
	}
    /**
	 * Returns content for "CONCRETE WAREHOUSE PAGE CONTENT" page
	 * tags
	 * @param db: array of product objects
	 * @param id: selected products id
	 */
	static getWarehouseContent(db, id) {
		let item = db.find(item => item.id == id);
		if(item == null) return '<center><h4>Not Found</h4></center>';
		
		let categories = [];
		for(let category in item['stock']) {
			categories.push(category);
		}
		
		let categoriesHtml = categories.map((category, index) => {
			let content = `
				<div class="mb-3">
					<button class="form-control btn btn-lg btn-info" type="button" data-bs-toggle="collapse" 
						data-bs-target="#collapseCategory${index}" aria-expanded="false" aria-controls="collapseCategory${index}">
						${category}
					</button>
					<div class="collapse" id="collapseCategory${index}">
						<table class="table">
							<thead>
								<tr><th>ID</th><th>Name</th><th>Description</th></tr>
							</thead>
							<tbody>
							${
								Object.keys(item['stock'][category]).map(ID => {
									return '<tr>'
									+ '<td>' + ID + '</td>'
									+ '<td>' + item['stock'][category][ID].name + '</td>'
									+ '<td>' + item['stock'][category][ID].description + '</td>'
                                    + '<td>' + item['stock'][category][ID].price + '</td>'
									+ '</tr>';
								}).join("")
							}
							</tbody>						
						</table>
					</div>
				</div>
			`;
			
			return content;
		}).join("\n");
		
		return `
			<h2>Edit Warehouse</h2>
			<div class="row">
				<form id='editWarehouseForm' onsubmit='event.preventDefault(); editWarehouse(event);'>
					<input type="hidden" name="id" id="warehouseID" value=${item['id']}>
				  <div class="mb-3">
					<label for="warehouseNameInput" class="form-label">Name</label>
					<input type="text" name="name" class="form-control" id="warehouseNameInput" value=${item['name']} required>
				  </div>
				  <hr/>
				  <h5>Create New Category</h5>
				  <div class="input-group mb-3">
					<input type="text" class="form-control" placeholder="New stock category" aria-label="New stock category" id="newCategoryInput">
					<button onclick="event.preventDefault(); addNewCategory(event);" class="input-group-text btn btn-primary" >Add Category</button>
				  </div>
				  <hr/>
				  <h5>Create New Stock Item</h5>
				  <div class="input-group mb-3">
					<input type="text" class="form-control" placeholder="Name" id="newItemNameInput">
					<input type="text" class="form-control" placeholder="Description" id="newItemDescriptionInput">
					<input type="number" min="0" class="form-control"  id="newItemPriceInput" placeholder="Price">
					<select class="form-select" aria-label="Default select example" id="newItemCategoryInput">
						<option disabled>Please select category</option>
					${
						categories.map(category => {
							return '<option value="' + category + '">' + category + '</option>';
						})
					}
					</select>
					<button onclick="event.preventDefault(); addNewStockItem(event);" name="new_stock_item" class="input-group-text btn btn-primary" id="newStockItemInput">Add New Item</button>
				  </div>
				  <hr/>
				  <div id="categoriesContainer" data-total=${categories.length}>
				  ${categoriesHtml}
				  </div>
				  <button type="submit" class="btn btn-success">Save Changes</button>
				</form>
				<div style="display:none" class="alert alert-warning" role="alert" id="errorPlaceHolder">
				</div>
			</div>
		`;
	}
    
	// Construct entire html page: head, body, header(inside body), main content(inside body)
	/**
	 * Returns fully generated html page
	 * <html>
	 * <head><title>{TITLE}</title></head>
	 * <body>
	 *   <main>
	 *   CONTENT ACCORDING TO {ARGS}
	 *   </main>
	 * </body>
	 * </html>
	 * tags
	 * @param title: set title to head of the page
	 * @param args: can be db, [db, id], etc...
	 */
	static constructPage(title='', ...args) {
		let pages = {
			'Home': PageGenerator.getHomePageContent,
			'Warehouses': PageGenerator.getWarehousesContent,
			'Add Warehouse': PageGenerator.getAddWarehouseContent,
			'Warehouse': PageGenerator.getWarehouseContent,
		};
		
		let html = '<html>' 
			+ PageGenerator.constructHeader(title) 
			+ '<body>'
			+ PageGenerator.constructNavBar(title)
			+ '<main>'
			+ '<div class="container">'
			+ (pages[title] != undefined ? pages[title](...args) : "PAGE NOT FOUND")
			+ '</div>'
			+ '</main>'
			+ '<script defer src="/js/script.js"></script>'
			+ '</body>'
			+ '</html>';
			
		return html;
	}
};

module.exports = PageGenerator;
