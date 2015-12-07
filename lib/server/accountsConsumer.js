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

                if (session.userId === doc._id) {
                    session.__proto__._setUserId.call(session, null);
                }
            }
        }
    });

    Meteor.methods({
        'cluster-accounts-login': function(userId, tokens) {
            if (LoggedInUsers.findOne({_id: userId, tokens: tokens}) !== undefined) {
                this._setUserId(userId);
            }
        }
    });
};
