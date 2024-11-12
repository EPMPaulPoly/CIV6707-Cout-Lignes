# API Documentation

This file aims to document the setup of the API. In the implementation of the docker instance, the API is hosted on localhost:5000. The following file will document the outward facing interface of the API. Namely, it will define the various paths which can be used, the input data which needs to be transmitted and what the API returns 
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