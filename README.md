# Transfers

The Transfers application is a tool that allows you to search, book and cancel transfers in a simple and convenient way.

Our advanced search tool allows you to specify a variety of criteria, including country, province and number of passengers (adults, infants and children), to find the transfer options that best suit your specific needs.

We work with an extensive network of transportation providers to offer a wide variety of transportation options, including private, shared, luxury vehicles and more. You can choose the type of transfer that best suits your preferences and budget.

Once you find the right option, you can complete the booking process with just a few clicks, thanks to our intuitive and easy-to-use platform.

Whether you are planning a business trip, a family vacation or any other type of transfer, the Transfers app is your ideal travel companion.

Create an account and start traveling.

## For developers
If you are a developer interested in testing this application locally, you are in the right place! In this section you will find useful information on how to configure the development environment and run the application.

**Important:** The app uses the Hotelbeds API, so you need to create an account in [Hotelbeds](https://developer.hotelbeds.com/) to obtain an API key and API secret.

**Note:** Remember, use `cd` command to move through directories. In Windows, use Git Bash console.

### Requisites

- [Git](https://git-scm.com/downloads)
- [Node](https://nodejs.org/en/download) (v20 or greater)

Once Node is installed, verify by running `node -v` in your terminal (or Git Bash).

```bash
$ node -v
v20.0.0
```

If it was successfully installed, install Nodemon and Dotenvx:

`npm install -g nodemon @dotenvx/dotenvx`

### Clone the repository

`git clone https://github.com/lisandroveron/transfers.git && cd transfers`

**Note**: In the steps below, you need to open two terminals (or Git Bash). One inside `client` folder directory, and the another one in `server` folder.

### Install dependencies

In both folders run: `npm i`

### Configure environment variables

In `server` folder, create a file with the name `.env` that will contain the environment variables in the format KEY=VALUE. Write the following variables, replacing them with the appropriate values:
```plaintext
API_KEY=your_api_key
API_SECRET=your_api_secret
API_URL=https://api.test.hotelbeds.com
COOKIE_NAME=t_s
COOKIE_SECRET=Foo Random Value
DATABASE_URL=postgres://postgres:your_database_password@localhost:your_postgresql_port/transfers_test
PORT=3000
```

### Run development servers

In `client` folder run `npm run dev -- --host`

In `server` folder run `npm run dev` (Make sure the database is enabled and running on your system).

Now you can open the app in the [development server](http://localhost:5173).