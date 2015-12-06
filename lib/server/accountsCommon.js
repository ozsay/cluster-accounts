Cluster._accountsSecret = process.env['CLUSTER_ACCOUNTS_SECRET'];

Cluster.setAccountsSecret = function(secret) {
    Cluster._accountsSecret = secret;
};

console.log('lala');