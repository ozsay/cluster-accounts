describe('Provider tests', function () {
    beforeEach(function() {
        MeteorStubs.install();
    });

    afterEach(function() {
        MeteorStubs.uninstall();
    });

    it('Creating the logged in users collection as a local mongo collection', function() {
        Cluster.startProvider();

        expect(Cluster.LoggedInUsers).toBeDefined();
    });
});
