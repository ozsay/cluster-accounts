describe('Provider tests', function () {
    beforeEach(function() {
        MeteorStubs.install();
    });

    afterEach(function() {
        MeteorStubs.uninstall();
    });

    it('Creating the logged in users collection as a local mongo collection', function() {
        spyOn(Mongo, "Collection");

        Cluster.startProvider();

        expect(Mongo.Collection).toHaveBeenCalled();
        expect(Mongo.Collection).toHaveBeenCalledWith('loggedInUsers', {connection: null});
    });

    it('Publishing the services object to each logged in user', function() {
        spyOn(Meteor, "publish");

        Cluster.startProvider();

        expect(Meteor.publish).toHaveBeenCalled();
        expect(Meteor.publish.calls.argsFor(0)[0]).toEqual(null);
    });
});
