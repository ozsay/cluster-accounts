var discoverConnection = Cluster.discoverConnection;

Cluster.discoverConnection = function(service) {
    var connection = discoverConnection(service);

    function login() {
        if (Match.test(Meteor.user(), Object) &&
            Match.test(Accounts._lastLoginTokenWhenPolled, String)) {
            connection.call('cluster-accounts-login', Meteor.user()._id, Accounts._lastLoginTokenWhenPolled);
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
