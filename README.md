# Description

This command line app will automatically upload [ngrok](https://ngrok.com/) domains to [ngrokrock.com](https://ngrokrock.com).

## Installation

```
npm install -g ngrokrock
```

## Usage

```
$ ngrokrock --help

  Usage: ngrokrock [options]

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -u, --username <value>  Your ngrokrock username.
    -p, --password <value>  Your ngrokrock password.
    -h, --host [value]      The ngrok API host.
    -a, --api [value]       The ngrokrock API host.
```

Example:

```
ngrokrock -u Jason -p YOUR_API_KEY
```

Get an API key from [ngrokrock.com](https://ngrokrock.com).
