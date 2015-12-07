Cluster._accountsConnection = null;

Cluster.setAccountsConnection = function(connection) {
    Cluster._accountsConnection = connection;
};

Cluster.startConsumer = function() {
    Cluster._accountsConnection.subscribe("loggedInUsers", Cluster._accountsSecret);
    LoggedInUsers = new Mongo.Collection("loggedInUsers", Cluster._accountsConnection);

    function checkToken(tokensFromConnection, loggedInUserTokens) {
        for (var i = 0; i < tokensFromConnection.length; i++) {
            for (var j = 0; j < loggedInUserTokens.length; j++) {
                if (tokensFromConnection[i].when.getTime() === loggedInUserTokens[j].when.getTime() &&
                    tokensFromConnection[i].hashedToken === loggedInUserTokens[j].hashedToken) {
                    return true;
                }
            }
        }

        return false;
    }

    LoggedInUsers.find().observe({
        added: function(doc) {
            for (var prop in Meteor.server.sessions) {
                var session = Meteor.server.sessions[prop];

                if (session.clusterAccounts !== undefined &&
                    session.userId === null &&
                    session.clusterAccounts._id === doc._id &&
                    checkToken(session.clusterAccounts.tokens, doc.tokens)) {
                    session.__proto__._setUserId.call(session, doc._id);
                }
            }
        },
        removed: function(doc) {
            for (var prop in Meteor.server.sessions) {
                var session = Meteor.server.sessions[prop];

                if (session.clusterAccounts !== undefined &&
                    session.userId !== null &&
                    session.clusterAccounts._id === doc._id &&
                    checkToken(session.clusterAccounts.tokens, doc.tokens)) {
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
