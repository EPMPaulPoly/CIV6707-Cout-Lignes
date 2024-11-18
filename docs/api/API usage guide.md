# API Documentation

This file aims to document the setup of the API. In the implementation of the docker instance, the API is hosted on localhost:5000. The following file will document the outward facing interface of the API. Namely, it will define the various paths which can be used, the input data which needs to be transmitted and what the API returns 
## Return JSON
All API calls will provide a similar return JSON structure with 3 basic variables:
 - success: Boolean variable saying whether the API call was successful
 - data: returns a json with the required data. Individual fields in the JSON data vary depending on the call
 - error: returns a status code and an error message

## Data structures
### Transport modes

Transport modes are defined by 5 properties as of time of writing:
 - mode_id: a unique identifier for the mode
 - cost_per_km: a cost per linear kilometer of infrastructure
 - cost_per_station: a cost that is required for each station. Only stations with the is_station flagged will have a cost attached. The others are waypoints which only used to modify the path of the transit line
 - footprint: is the width of the linear infrastructure required to pass the transport capacity

### Transit stops
Transit stops are the basic geographical building block for transit lines. They have 4 basic parameters:
 - stop_id: unique sequential identifier for each stop
 - name: basic name for stop 255 character limit in database implementation
 - geometry: wkb string in EPSG:3857 giving the location of the stop.
 - is_station: boolean which says whether this is a station or a waypoint.

### Transit lines
Transit lines are used as organizing buckets for linear infrastructure. The line parameters are based on high level parameters as well as a table of data which contains the transit stops and their order in the transit line
#### Transit lines global information
Transit lines have 5 parameters assigned to them upon creation:
 - line_id: unique sequential identifier for each line which serves as key in the association
 - name: toponyme for the line 255 character limit
 - description: longer description of line limited to 255 characters
 - mode_id: Foreign key relating to transit modes. Is used for cost of linear infrastructure.
 - color: hexadecimal color code for display of the line

 #### Transit Line Stops
 Line stops are used to describe the physical implementation of the line in space. They use line_id, stop_id and the order of the stop in the line in order to characterize the geometry of the line. The parameters are as follows:
 - assoc_id: unique identifier that is used to associate a line, a stop and the order of the stop in the line
 - line_id: foreign key used to identify which of the transit lines this association is being made
 - stop_id: foreign key to descibe which of the transit stops is being used to describe the path of the line
 - order_of_stop: used to say what the order of the stop is in the sequence

### Tax lots
Tax lots are used to identify the expropriation costs of potential linear infrastructure. 



## API Calls

The following section provides the details concerning the API calls. In the current implementation, the base URL for the API http://localhost:5000/api

### Transit Modes

#### Getting all transit modes: GET /modes
Using a get command with the /modes suffix to the base URL, the API will return a success flag and the relevant data. Data will be transmitted based on the fields in the data base which are as shown above. The API call would be http://localhost:5000/api/modes will return something resembling the following:

{\
&nbsp;&nbsp;&nbsp;&nbsp;"success": true,\
&nbsp;&nbsp;&nbsp;&nbsp;"data": [\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"mode_id": 1,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "Metro",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_km": 250,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_station": 100,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"footprint": 20\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"mode_id": 2,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "Tram",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_km": 70,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_station": 10,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"footprint": 15\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"mode_id": 5,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "BRT",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_km": 15,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_station": 5,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"footprint": 8\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}\
&nbsp;&nbsp;&nbsp;&nbsp;]\
}
#### Getting a specific transit mode: GET /modes/{ id you wish to get}
Similar as previous item, except for a specific id you want to publish. If you wished to get mode 1, you would send a GET command to http://localhost:5000/api/modes/1. You would receive somthing resembling the following:\\

{\
&nbsp;&nbsp;&nbsp;&nbsp;"success": true,\
&nbsp;&nbsp;&nbsp;&nbsp;"data": {\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"mode_id": 1,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "Metro",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_km": 250,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_station": 100,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"footprint": 20\
&nbsp;&nbsp;&nbsp;&nbsp;}\
}
#### Creating a new mode: POST /modes
To create a post, the data for the new mode, minus an ID needs to be posted to http://localhost:5000/api/modes. The server then returns the posted data including the mode_id.\
Request payload:\
{\
&nbsp;&nbsp;&nbsp;&nbsp;"name":"test25",\
&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_km":35,\
&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_station":36,\
&nbsp;&nbsp;&nbsp;&nbsp;"footprint":5\
}\
Request return:\
{\
&nbsp;&nbsp;&nbsp;&nbsp;"success":true,\
&nbsp;&nbsp;&nbsp;&nbsp;"data":{\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"mode_id":8,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":"test25",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_km":35,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_station":36,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"footprint":5\
&nbsp;&nbsp;&nbsp;&nbsp;}\
}

#### Modifying a mode: PUT /modes
The put request allows the use to modify an existing mode with new values. The current implementation requires that the entire line be updated at once. This is relatively straighforward. In this case, the line_id is transmitted in the url, whereas the data is transmitted in the request body.If I wanted to update the mode 6, the following request would be put through

PUT on http://localhost:5000/api/modes/6 with the following body:
{\
&nbsp;&nbsp;&nbsp;&nbsp;"name":"test",\
&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_km":25,\
&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_station":35,\"footprint":12\
}\
The server would respond with a success flag and the relevant data:
{\
&nbsp;&nbsp;&nbsp;&nbsp;"success":true,\
&nbsp;&nbsp;&nbsp;&nbsp;"data":{\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"mode_id":6,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":"test",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_km":25,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_station":35,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"footprint":12\
&nbsp;&nbsp;&nbsp;&nbsp;}\
}\

#### Deleting a mode: DELETE /modes
A DELETE function is also available. Only the line has to be transmitted over the URL. Note that the API does no dataproofing for integrity. Thus if the mode is used in one of your lines it will break links. Currently this is handled in the databse setup by adding a foreign key to the transit lines table. The DELETE call would be on the following URL if deleting mode 6: http://localhost:5000/api/modes/6

The request yields a return similar to a put or post, albeit with an additional field of deletedRows:
{
&nbsp;&nbsp;&nbsp;&nbsp;"success":true,\
&nbsp;&nbsp;&nbsp;&nbsp;"data":{\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"mode_id":6,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":"test",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_km":25,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_station":35,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"footprint":12\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},\
&nbsp;&nbsp;&nbsp;&nbsp;"deletedRows":1\
}\
If the database throws an error for whatever reason(for example your database is not setup correctly), the following type of error message will be thrown:\
{
&nbsp;&nbsp;&nbsp;&nbsp;"success":false,\
&nbsp;&nbsp;&nbsp;&nbsp;"error":"Cannot delete mode as it is referenced by other records"\
}

### Transit Stops
Transit stop are the basic building block. In our case, they can  be real stops or simple waypoints which are treated using the is_station field. As with other items, GET,PUT,POST,DELETE commands are the 4 basic commands. Some the get command is available for multiple items. the others only update one stop at a time.

#### Get all the transit stops
By sending a GET request on http://localhost:5000/api/stops, one receives all the stops in the database. The following is an example return for a valid request:

{"success":true,\
"data":[\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":3,"name":"test3","is_station":true,"geography":"0101000020E610000032055556386852C0F2B3DD6F0FC54640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":18,"name":"New test","is_station":true,"geography":"0101000020E6100000010000A0E76552C017759AF9A8C24640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":20,"name":"St-Michel","is_station":true,"geography":"0101000020E610000001000088596652C01E667E4C70C74640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":19,"name":"unfuck this","is_station":true,"geography":"0101000020E6100000010000F8DA6552C05D3FF6F185C84640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":11,"name":"Testing Alone","is_station":true,"geography":"0101000020E6100000010000709B6952C0B90D29CB85C44640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":1,"name":"test","is_station":true,"geography":"0101000020E610000001000030366952C0EE3F41FC21C24640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":25,"name":"New Stop 14","is_station":true,"geography":"0101000020E610000001000080DC6352C04EF3ADB20FCA4640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":17,"name":"New Stop 8","is_station":true,"geography":"0101000020E6100000010000102B6752C04217F75D6AC64640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":21,"name":"testing another thing alone","is_station":true,"geography":"0101000020E610000001000020DC6952C005FC4FFA51C14640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":23,"name":"tests_paul_dimanche_soir","is_station":true,"geography":"0101000020E6100000010000A0256452C08649FE628DC24640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":24,"name":"tests_paul_dimanche_soir","is_station":true,"geography":"0101000020E6100000010000A0256452C08649FE628DC24640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":2,"name":"test2","is_station":true,"geography":"0101000020E6100000010000DCA86852C0DF31D78214C44640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":15,"name":"checkedicheck","is_station":true,"geography":"0101000020E6100000010000B4776752C0D96A540D6CC34640"},\
&nbsp;&nbsp;&nbsp;&nbsp;{"stop_id":22,"name":"Test add new lines","is_station":true,"geography":"0101000020E6100000010000B06E6552C02F16B1849DC94640"}\
]}\

As of current implementation, the database returns a raw hexadecimal in EPSG3857
### Getting a specific Transit stop
The route for transit stops allow the specification of a specific stop to get one item in particular. The stop id to retrieve is written into the URL. The full package is then returned to the user. For this example, we'll be retrieving stop_id = 20 by sending the request http://localhost:5000/api/stops/20 

{
&nbsp;&nbsp;&nbsp;&nbsp;"success": true,
&nbsp;&nbsp;&nbsp;&nbsp;"data": {
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"stop_id": 20,
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "St-Michel",
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"is_station": true,
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"geography": "0101000020E610000001000088596652C01E667E4C70C74640"
&nbsp;&nbsp;&nbsp;&nbsp;}
}

### Creating a new transit stop: POST
As of current implementation, the creation of new stops is done in EPSG4326 using a string command. The POST command is sent to http://localhost:5000/api/stops/ with the following data:\

{
&nbsp;&nbsp;&nbsp;&nbsp;"name":"New Stop 16",/
&nbsp;&nbsp;&nbsp;&nbsp;"geography":"SRID=4326;POINT(-73.54574203491212 45.53425085438269)",/
&nbsp;&nbsp;&nbsp;&nbsp;"is_station":true/
}/
Once the data is received and created on the database side, the API returns the data:\
{
&nbsp;&nbsp;&nbsp;&nbsp;"success":true,\
&nbsp;&nbsp;&nbsp;&nbsp;"data":{\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"stop_id":29,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":"New Stop 16",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"is_station":true,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"geography":"0101000020E610000001000070ED6252C084B7FD5462C44640"\
&nbsp;&nbsp;&nbsp;&nbsp;}\
}\
This piece of documentation will likely require some work as the database being used for the test is still setup in 4326.

### Updating a stop: PUT
Same process as the post command, except in this instance the stop_id is being communicated in the URL. IN this instance, we're modifying stop 23 by sending a put request to http://localhost:5000/api/stops/23. The payload is as follows:\
{\
&nbsp;&nbsp;&nbsp;&nbsp;"name":"Put Test",\
&nbsp;&nbsp;&nbsp;&nbsp;"geography":"SRID=4326;POINT(-73.57458114624025 45.524630364755254)",\
&nbsp;&nbsp;&nbsp;&nbsp;"is_station":true\
}\
The API returns the callback for confirmation:\
{\
&nbsp;&nbsp;&nbsp;&nbsp;"success":true,\
&nbsp;&nbsp;&nbsp;&nbsp;"data":{\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"stop_id":23,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":"Put Test",\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"is_station":true,\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"geography":"0101000020E6100000010000F0C56452C0628E791627C34640"\
&nbsp;&nbsp;&nbsp;&nbsp;}\
}\
Implementation to be determined once the database is converted over to EPSG3857

