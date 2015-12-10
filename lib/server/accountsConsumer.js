var crypto = Npm.require('crypto');

Cluster._accountsConnection = null;

Cluster.setAccountsConnection = function(connection) {
    Cluster._accountsConnection = connection;
};

Cluster.startConsumer = function() {
    Cluster._accountsConnection.subscribe("loggedInUsers", Cluster._accountsSecret);
    Cluster.LoggedInUsers = new Mongo.Collection("loggedInUsers", Cluster._accountsConnection);

    Cluster.LoggedInUsers.find().observeChanges({
        changed: function(id, fields) {
            if (fields.tokens !== undefined) {
                for (var prop in Meteor.server.sessions) {
                    var session = Meteor.server.sessions[prop];

                    var found = false;

                    for (var i = 0; i < fields.tokens.length; i++) {
                        if (session.userId === id && session.userLoginHashedToken === fields.tokens[i].hashedToken) {
                            found = true;
                        }
                    }

                    if (session.userId === id && !found) {
                        session.__proto__._setUserId.call(session, null);
                        Cluster._accountsLogger.info('User with id ' + id + ' has logged out');
                    }
                }
            }
        },
        removed: function(id) {
            for (var prop in Meteor.server.sessions) {
                var session = Meteor.server.sessions[prop];

                if (session.userId === id) {
                    session.__proto__._setUserId.call(session, null);
                    Cluster._accountsLogger.info('User with id ' + id + ' has logged out');
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

            if (Cluster.LoggedInUsers.findOne({_id: userId, 'tokens.hashedToken': token}) !== undefined &&
                this.userId === null) {

                this._setUserId(userId);
                Cluster._accountsLogger.info('User with id ' + userId + ' has logged in');
            }
        }
    });

    Cluster._accountsLogger.info('Cluster accounts consumer has been successfully initialized');
};
