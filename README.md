# Solana V0

## Description

A simple program for counting "plays" or other kinds of things. The design should be permissionless and opaque, anyone can create a counter for any resource. Applications can filter for preferred creators of counters and aggregate values as they see fit. Incrementing the counter does not require any special privileges.

Project contain 2 modules:

- `./packages/counter-service` - Main application

- `./packages/trx-emultae` - Application to emulate Memo transaction and collect service information

## Prerequisites

### Install tools for pre-commit validation (_`for development`_)

```bash
sudo apt-get install -y python3 python3-pip shellcheck ruby-full build-essential openjdk-8-jdk curl
```

### Install [npm](https://github.com/nodesource/distributions/blob/master/README.md)

It's recommended to install node 10 on ubuntu 18.04 as version 8 may have troubles to work with npm

```
# Using Ubuntu
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install [yarn](https://linuxize.com/post/how-to-install-yarn-on-ubuntu-18-04/)

```
curl -sS https://dl.yarnpkg.com/debian/publicKey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install yarn
```

### Install [docker](https://docs.docker.com/v17.09/engine/installation/linux/docker-ce/ubuntu/)

```bash
sudo apt-get update
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install -y docker-ce
```

### Install [docker-compose](https://docs.docker.com/compose/install/)

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo apt remove -y docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

```

[Allow regular user to run docker without sudo](https://docs.docker.com/install/linux/linux-postinstall/)

```bash
sudo usermod -aG docker ${USER}
sudo usermod -aG www-data ${USER}
```

You need to reboot or relogin after that

Once rebooted verify that you can run docker commands without sudo.

```bash
docker run hello-world
```

## Start

Install all packages

```bash
yarn
```

### lint

```bash
yarn run lint
```

### run api and web locally

First step is to start docker containers with databases, etc...

```bash
yarn run docker-dev
```

Second step is to start counter-service, trx-emulator service

```bash
yarn run start
```

### emulate production run

```bash
yarn run docker-prod
```

#### All environments files ``.env`` has example structure stored in ``.env.xmpl``
