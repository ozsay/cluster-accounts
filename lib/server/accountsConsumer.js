Cluster._accountsConnection = null;

Cluster.setAccountsConnection = function(connection) {
    Cluster._accountsConnection = connection;
};

Cluster.startConsumer = function() {
    Cluster._accountsConnection.subscribe("loggedInUsers", Cluster._accountsSecret);
    LoggedInUsers = new Mongo.Collection("loggedInUsers", Cluster._accountsConnection);

    LoggedInUsers.find().observe({
        added: function(doc) {
            // TODO: Find all the connections for this user and set userId in Meteor.server.sessions[client.id]
        },
        removed: function(oldDoc) {
            // TODO: Find all the connections for this user and remove userId in Meteor.server.sessions[client.id]
        }
    });

    Meteor.onConnection(function(client) {
        // TODO: Find if client is loggedIn and set userId in Meteor.server.sessions[client.id]
    });
};