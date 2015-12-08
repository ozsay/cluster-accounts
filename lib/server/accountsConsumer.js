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
                    Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged out');
                }
            }
        }
    });

    Meteor.methods({
        'cluster-accounts-login': function(userId, tokens) {
            if (LoggedInUsers.findOne({_id: userId, tokens: tokens}) !== undefined) {
                this._setUserId(userId);
                Cluster._accountsLogger.info('User with id ' + userId + ' has logged in');
            }
        }
    });

    Cluster._accountsLogger.info('Cluster accounts consumer initialized successfully');
};
