Package.describe({
    name: "ozsay:cluster-accounts",
    summary: "A solution for accounts/authentication in meteorhacks:cluster",
    version: "0.1.0",
    git: "https://github.com/ozsay/cluster-accounts.git",
    documentation: "README.md"
});

Package.onUse(function (api) {
    api.versionsFrom('METEOR@0.9.2');

    api.use('meteorhacks:cluster', ['server', 'client']);

    api.imply('meteorhacks:cluster');

    api.use('accounts-base', 'client');

    api.addFiles([
        'lib/server/accountsCommon.js',
        'lib/server/accountsConsumer.js',
        'lib/server/accountsProvider.js'
    ], ['server']);

    api.addFiles([
        'lib/client/accountsClient.js'
    ], ['client']);
});
