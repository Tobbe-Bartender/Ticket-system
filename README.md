# Ticket-system
# Helpdesk
Introduction: This is the ticket system that is to help a company or organisation by managing and receiving ticket that the IT department then would take care of.

The project is using node.js so you will need to install Node JS, go to https://nodejs.org/en to do this.

# Database
To use the database created you can use MariaDB

Follow the guide and configure the ticket.json file according to your user. https://mariadb.com/get-started-with-mariadb/:

in config/db/this.json you will have to make the necceary changes to fit you MairaDB user:

- host
- user
- password

# Email
In src/ticket.ejs you have to configure the settings for the email functions to work:

- service mail
- user
- password
  With google this password is not the account password but one you have to create for an external program to use.
  Here is a guide how:
  https://support.google.com/accounts/answer/185833?hl=en#zippy=

# Auth0
I used Auth0 for this project so therefore you have to create an account on https://auth0.com/docs/get-started and follow the guide to setup the server

In index.js you have to configure the settings for the login functions to work connected to the accounts you just made:

- secret (64 character long random string)
- clientID
- issuerBaseURl

You will also have to add roles in Auth0 for my project to work by going to "User management" and adding "Agent", "Admin" and "User", they will then be added to the accounts you have listed in your Auth0
Also under "Actions" and "Triggers" and "Post-login" you will have to add "Add roles to token". Under "Library" which is under "Action" aswell you will need to create a custom action with the following code:

exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'http://localhost:1337/roles'; // Replace with your custom namespace

  // Get the user's roles from the context.authorization object
  const roles = event.authorization?.roles || [];

  // Add the roles to the ID token
  api.idToken.setCustomClaim(`${namespace}`, roles);

  // Add the roles to the access token
  api.accessToken.setCustomClaim(`${namespace}`, roles);
};

# Packages

Before you can install any packages you have to initiate the `package.json`:
Do this by going to the project folder and typing `npm init` in the terminal.

The following npm packages must be installed for the code to work:

- ejs
- eslint
- express
- express-openid-connect
- express-session
- multer
- mysql
- node
- nodemailer
- promise-mysql

To install these, simply go into the project folder and do the following in the terminal for every package:

```bash
npm install "package name"  # example: npm install express
```
To run the code you have to go to the project folder and type "node index.js" in the terminal.

License
MIT License

Copyright (c) 2024 Erik Isaksson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
