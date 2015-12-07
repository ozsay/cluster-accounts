var discoverConnection = Cluster.discoverConnection;

Cluster.discoverConnection = function(service) {
    var connection = discoverConnection(service);

    Accounts.onLogin(function() {
        connection.call('cluster-accounts-login', Meteor.user()._id, Meteor.user().services.resume.loginTokens);
    });

    connection.onReconnect = function() {
        connection.call('cluster-accounts-login', Meteor.user()._id, Meteor.user().services.resume.loginTokens);
    };

    return connection;
};
