# Basic Auth - Lab 16

### Description:

This app is a RESTful api that allows users to sign up and sign in. The user creates a user account with a username, password and email. When the user signs in that data is

### Resources:

#### Band:
Each band is created and interacted with using RESTful api methods. The model is stored in the database with a schema. That schema has four properties.
* name
* genre
* origin
* userID - this maps back to the user model that connects to the band

### Routes:
#### POST:
`/api/signup`
The user makes a post request upon sign up. The username and email submitted must be unique to the app (no duplicates). The password is encrypted with a base64 hash and all the data is stored to the database. Once successful the user get a token for that session that would allow them to access other routes that would be available within the app.
`/api/band`
Once the user has access to the band route they can begin making post requests of new bands at this url.

#### GET:
`/api/signin`
The user makes a get request upon sign in. The username and password entered get checked against the user data already stored in the database. If what is entered is valid then the user will receive a token to access the other routes that would be available in the app. If not then the user will get rejected as unauthorized.
`/api/band/:id`
Once the user has posted a band they can then read the band resource with this url. The get request uses the mongodb id to find the exact band the user is looking for.

#### PUT:
`/api/band/:id`
The user can update the content of an exact band at this url.

#### DELETE
`/api/band/:id`
The user can delete an entire band using its id following this url. 
