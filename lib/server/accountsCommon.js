Cluster._accountsSecret = process.env['CLUSTER_ACCOUNTS_SECRET'];

Cluster.setAccountsSecret = function(secret) {
    Cluster._accountsSecret = secret;
};

Cluster._accountsLogger = console;

Cluster.setAccountLogger = function(logger) {
    Cluster._accountsLogger = logger;
};
