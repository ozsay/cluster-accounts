var discoverConnection = Cluster.discoverConnection;

Cluster.discoverConnection = function(service) {
    var connection = discoverConnection(service);

    function login() {
        var user = Meteor.user();

        if (user !== null &&
            user.services !== undefined &&
            user.services.resume !== undefined &&
            user.services.resume.loginTokens !== undefined &&
            user.services.resume.loginTokens.length > 0) {
            connection.call('cluster-accounts-login', Meteor.user()._id, Meteor.user().services.resume.loginTokens);
        }
    }

    Accounts.onLogin(function() {
        login();
    });

    connection.onReconnect = function() {
        login();
    };

    return connection;
};
