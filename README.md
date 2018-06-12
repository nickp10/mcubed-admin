# mcubed-admin

Description
----
An admin tool to help manage data collected by various mCubed modules. The list of supported modules include:

* [mCubed Lineup Insight Server](https://github.com/nickp10/mcubed-lineup-insight-server)
* [mCubed Wheel Capture](https://github.com/nickp10/mcubed-wheel-capture)

Command Line Interface
----
This node module is only usable from the command line using `mcubed-admin -p 80`. The arguments for the command line interface are:

* *-p / --port* - **Optional.** Specifies the port on which to run the admin server. This will default to 8000.
* *--mongoConnectionUrl* - **Required.** Indicates the connection URL to the MongoDB instance. Refer to the [MongoDB](#mongodb) section.
* *--mongoDBName* - **Required.** Indicates the name of the database to connect to within the MongoDB instance. Refer to the [MongoDB](#mongodb) section.

<a name="mongodb"></a>
[MongoDB](https://www.mongodb.com/)
----
This module relies on a connection to the MongoDB instance that the supported modules are connecting to. The collection names used by this module are:

* *lineupalternatenames* - **Used by mcubed-lineup-insight-server.** Manages the mapping between a third-party player name and the corresponding contest name. 
* *lineupmissingnames* - **Used by mcubed-lineup-insight-server.** Manages the names that cannot be mapped to a corresponding contest name.
* *users* - **Used by this module for authentication purposes.** There will be an "admin" user stored in this collection. In order to log into the admin page, the user must login with the admin's credentials.
* *wheelcategories* - **Used by mcubed-wheel-capture.** Manages the categories for the wheel words.
* *wheelwords* - **Used by mcubed-wheel-capture.** Manages the wheel words that have been captured.
