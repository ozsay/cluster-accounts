Package.describe({
    name: "ozsay:cluster-accounts",
    summary: "A solution for accounts/authentication in meteorhacks:cluster",
    version: "0.1.0",
    git: "https://github.com/ozsay/cluster-accounts.git",
    documentation: "README.md"
});

Package.onUse(function (api) {
    api.versionsFrom('METEOR@0.9.2');

    api.use(['meteorhacks:cluster@1.6.9'], ['server', 'client']);

    api.imply('meteorhacks:cluster');

    api.use(['accounts-base', 'check'], 'client');

    api.addFiles([
        'lib/server/accountsCommon.js',
        'lib/server/accountsConsumer.js',
        'lib/server/accountsProvider.js'
    ], ['server']);

    api.addFiles([
        'lib/client/accountsClient.js'
    ], ['client']);
});

Package.onTest(function (api) {
    api.use(['ozsay:cluster-accounts', 'velocity:html-reporter', 'sanjo:jasmine@0.20.3', 'ddp', 'accounts-base'], ['client', 'server']);

    api.addFiles('test/server/provider-tests.js', ['server']);

    api.addFiles('test/client/tests.js', ['client']);
});
