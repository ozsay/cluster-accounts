Cluster._accountsConnection = null;

Cluster.setAccountsConnection = function(connection) {
    Cluster._accountsConnection = connection;
};

Cluster.startConsumer = function() {
    Cluster._accountsConnection.subscribe("loggedInUsers", Cluster._accountsSecret);
    LoggedInUsers = new Mongo.Collection("loggedInUsers", Cluster._accountsConnection);

    LoggedInUsers.find().observe({
        removed: function(doc) {
            for (var prop in Meteor.server.sessions) {
                var session = Meteor.server.sessions[prop];

                if (session.clusterAccounts !== undefined &&
                    session.userId !== null &&
                    session.clusterAccounts._id === doc._id) {
                    session.__proto__._setUserId.call(session, null);
                }
            }
        }
    });

    Meteor.methods({
        'cluster-accounts-login': function(userId, tokens) {
            Meteor.server.sessions[this.connection.id].clusterAccounts = {
                _id: userId,
                tokens: tokens
            };

            if (LoggedInUsers.findOne({_id: userId, tokens: tokens}) !== undefined) {
                this._setUserId(userId);
            }
        }
    });
};
