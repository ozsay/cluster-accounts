# cluster-accounts
A solution for accounts/authentication in meteorhacks:cluster

WIP - Not yet published

## Getting Started

`meteor add ozsay:cluster-accounts`

> If meteorhacks:cluster is not installed in your project, It will install it has a dependency.

## Usage

> Please read the instructions at [meteorhacks:cluster](https://github.com/meteorhacks/cluster) for how to setup the cluster.

After you setup the cluster in your projects you need to define the meteor app that manages all the user accounts
(could be the `web` service or a dedicated service). From now on we will refer to that app as the **provider** since it
provides the logged in users collection. All the other apps in your cluster that depend on `cluster-accounts` are the **consumers**.

### Setup a provider

First, you need to define a string that will be a secret.

You can define it via environment variable: `export CLUSTER_ACCOUNTS_SECRET=this_is_a_secret`
or programmatically `Cluster.setAccountsSecret('this_is_a_secret')`.

> It is very important that you don't expose this string to your users, because we use this string to authenticate a
node in the cluster when we subscribe a consumer to the logged in users collection.

Then start the provider with `Cluster.startProvider()`.

> `cluster-accounts` adds the `services` object to the default user subscription.

### Setup a consumer

First, define the secret as you did with the provider.

> The secret must be identical in all of your consumers.

Then set the connection to the provider with `Cluster.setAccountsConnection(connection)`.

example:
```
	var connection = Cluster.discoverConnection("web");

	Cluster.setAccountsConnection(connection);
```

And finally start the consumer: `Cluster.startConsumer()`.

## How it works

![Drawing](http://i67.tinypic.com/bfp5wp.jpg)

- When you start the provider it will create a collection in the server of the logged in users.
- When you start a consumer it will subscribe to the logged in users collection that exists in the provider.
- When a client performs a login to the web service, `cluster-account` automatically will perform a login to each of the
 connected cluster nodes.

 > In order for this to work, we needed to publish the login tokens of a user to the client.
