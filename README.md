**Kaientai API**
----

* **URL**

	`/ap/v1/klf`

* **Method:**
  
  `POST`

   **Required:**
 
   `email=[string]`
   `address1=[string]`
   `postcode=[string]`
   `extUserID=[string]`
   `orderProducts=[[
   {
   productName=[string],
   quantity=[integer]
   }
   ]]`
   `totalAmount=[decimal]`
   `supplierID=[integer]`
   `supplierContactEmail=[string]`

   **Optional:**
 
   `name=[string]`
   `phone=[string]`
   `address2=[string]`
   `city=[string]`
   `county=[string]`
   `country=[string]`
   `extOrderID=[string]`
   `supplierContactName=[string]`

* **Data Params**

    {
	    "name": string,
	    "email": string,
	    "phone": string,
	    "address1": string,
	    "address2": string,
	    "city": string,
	    "county": string,
	    "country": string,
	    "postcode": string,
	    "extUserID": string,
	    "orderProducts": [
		    {
				"productName": string,
			    "quantity": integer
		    },
		    {
			    "productName": string,
			    "quantity": integer
		    }
	    ],
	    "totalAmount": decimal,
	    "extOrderID": string,
	    "supplierID": integer,
	    "supplierContactName": string,
	    "supplierContactEmail": string
    }

* **Success Response:**
  
  <_What should the status code be on success and is there any returned data? This is useful when people need to to know what their callbacks should expect!_>

  * **Code:** 200 <br />
    **Content:** `{ "status": "If Kaientai can fulfil it, we will send you a confirmation email." }`

* **Sample Call:**

    curl -X POST -H "Content-Type: application/json" -d '
    {
		"name": "a b",
		"email": "x@x.com",
		"phone": "123456789",
		"address1": "1 x road",
		"address2": "x area",
		"city": "x city",
		"county": "x county",
		"country": "x country",
		"postcode": "B33 8NN",
		"extUserID": "x008",
		"orderProducts": [
			{
				"productName": "Monkey D. Luffy",
				"quantity": 1
			},
			{
				"productName": "Monkey D. Dragon",
				"quantity": 1
			}
		],
		"totalAmount": "0.99",
		"extOrderID": "extOrderID5",
		"supplierID": 1,
		"supplierContactName": "Mier",
		"supplierContactEmail": "mierdluffy@gmail.com"
	}' http://localhost:9973/api/v1/klf

* **Notes:**

Behaviour:
1. Check Postcode is within our area of delivery
2. If yes, keep going - otherwise save the NonLocal postcode in our db
3. Check user is already registered, if yes, go to 4 - otherwise
	a.  Create an Address, followed by a user in our db
4. Check if order can be fulfiled by doing the following checks
	a. Check each order Item quantity <= stock item quantity
5. Check if order exists, if yes - stop - otherwise continue
6. Add the Order to our db
7. Add each order item as an orderProduct in our db
8. Update each stock in our db
9. Send emails to ourselves and the supplier
