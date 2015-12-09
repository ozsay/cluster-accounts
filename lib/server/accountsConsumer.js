var crypto = Npm.require('crypto');

Cluster._accountsConnection = null;

Cluster.setAccountsConnection = function(connection) {
    Cluster._accountsConnection = connection;
};

Cluster._consumerModifier = {};

Cluster.setConsumerModifier = function(modifier) {
    Cluster._consumerModifier = modifier;
};

Cluster.startConsumer = function() {
    Cluster._accountsConnection.subscribe("loggedInUsers", Cluster._accountsSecret);
    Cluster.LoggedInUsers = new Mongo.Collection("loggedInUsers", Cluster._accountsConnection);

    Cluster.LoggedInUsers.find(Cluster._consumerModifier).observe({
        changed: function(doc, oldDoc) {
            if (oldDoc.tokens.length > doc.tokens.length) {
                var loggedOutTokens = [];

                for (var i = 0; i < oldDoc.tokens.length; i++) {
                    var found = false;
                    for (var j = 0; j < doc.tokens.length; j++) {
                        if (oldDoc.tokens[i].hashedToken === doc.tokens[j].hashedToken)
                            found = true;
                    }

                    if (!found) loggedOutTokens.push(oldDoc.tokens[i]);
                }

                for (i = 0; i < loggedOutTokens.length; i++) {
                    for (var prop in Meteor.server.sessions) {
                        var session = Meteor.server.sessions[prop];

                        if (session.userId === doc._id && session.userLoginHashedToken === loggedOutTokens[i].hashedToken) {
                            session.__proto__._setUserId.call(session, null);
                            Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged out');
                        }
                    }
                }
            }

        },
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
        'cluster-accounts-login': function(userId, token) {
            var hash = crypto.createHash('sha256');
            hash.update(token);
            token = hash.digest('base64');

            Meteor.server.sessions[this.connection.id].userLoginHashedToken = token;

            if (Cluster.LoggedInUsers.findOne({_id: userId, tokens: {$elemMatch: {when: {$type: 9}, hashedToken: token}}}) !== undefined &&
                this.userId === null) {
                this._setUserId(userId);
                Cluster._accountsLogger.info('User with id ' + userId + ' has logged in');
            }
        }
    });

    Cluster._accountsLogger.info('Cluster accounts consumer has been successfully initialized');
};
