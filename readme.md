# Walkner TP

Transport ordering application.

## Requirements

### node.js

Node.js is a server side software system designed for writing scalable
Internet applications in JavaScript.

  * __Version__: >= 0.10.31
  * __Website__: http://nodejs.org/
  * __Download__: http://nodejs.org/download/
  * __Installation guide__: https://github.com/joyent/node/wiki/Installation

### MongoDB

MongoDB is a scalable, high-performance, open source NoSQL database.

  * __Version__: >= 2.4.x
  * __Website__: http://mongodb.org/
  * __Download__: http://www.mongodb.org/downloads
  * __Installation guide__: http://www.mongodb.org/display/DOCS/Quickstart

## Installation

Clone the repository:

```
git clone git://github.com/morkai/walkner-tp.git
```

or [download](https://github.com/morkai/walkner-tp/zipball/master)
and extract it.

Go to the project's directory and install the dependencies:

```
cd walkner-tp/
npm install -g grunt-cli
npm install
```

## Configuration

Tinker with files in the `config/` directory.

## Starting

Start the application server in `development` or `production` environment:

  * under Linux:

    ```
    NODE_ENV=development node walkner-tp/backend/main.js ../config/frontend.js
    ```

  * under Windows:

    ```
    SET NODE_ENV=development
    node walkner-tp/backend/main.js ../config/frontend.js
    ```

Application should be available on a port defined in the `config/frontend.js` file
(`80` by default). Point your Internet browser to http://127.0.0.1/.

## License

This project is released under the
[CC BY-NC-SA 4.0](https://raw.github.com/morkai/walkner-tp/master/license.md).
