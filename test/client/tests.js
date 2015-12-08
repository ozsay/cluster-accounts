"use strict";

describe('Logged in client tests', function () {
    it('Initializing connection', function() {
        spyOn(DDP, "connect").and.callThrough();

        Cluster.discoverConnection('testService');

        expect(DDP.connect).toHaveBeenCalled();
        expect(DDP.connect).toHaveBeenCalledWith('/testService');
    });

    it('Connecting to a cluster node', function() {
        var connection = {
            call: function() {}
        };

        var user = {
            _id: 'userId',
            services: {
                resume: {
                    loginTokens: [
                        {
                            when: new Date(),
                            hashedToken: 'token'
                        }
                    ]
                }
            }
        };

        spyOn(DDP, "connect").and.returnValue(connection);

        spyOn(Meteor, 'user').and.returnValue(user);

        spyOn(connection, "call");

        Cluster.discoverConnection('testService');

        connection.onReconnect();

        expect(connection.call).toHaveBeenCalled();
        expect(connection.call).toHaveBeenCalledWith('cluster-accounts-login', user._id, user.services.resume.loginTokens);
    });

    it('Login after connection is established', function() {
        var connection = {
            call: function() {}
        };

        var user = null;

        var loginCb = null;

        spyOn(DDP, "connect").and.returnValue(connection);

        spyOn(Meteor, 'user').and.callFake(function() {
            return user;
        });

        spyOn(Accounts, "onLogin").and.callFake(function(cb) {
            loginCb = cb;
        });

        spyOn(connection, "call");

        Cluster.discoverConnection('testService');

        connection.onReconnect();

        expect(connection.call).not.toHaveBeenCalled();

        user = {
            _id: 'userId',
            services: {
                resume: {
                    loginTokens: [
                        {
                            when: new Date(),
                            hashedToken: 'token'
                        }
                    ]
                }
            }
        };

        loginCb();

        expect(connection.call).toHaveBeenCalled();
        expect(connection.call).toHaveBeenCalledWith('cluster-accounts-login', user._id, user.services.resume.loginTokens);
    });
});

describe('Guest client tests', function () {
    it('Initializing connection', function() {
        spyOn(DDP, "connect").and.callThrough();

        Cluster.discoverConnection('testService');

        expect(DDP.connect).toHaveBeenCalled();
        expect(DDP.connect).toHaveBeenCalledWith('/testService');
    });

    it('Connecting to a cluster node', function() {
        var connection = {
            call: function() {}
        };

        var user = null;

        spyOn(DDP, "connect").and.returnValue(connection);

        spyOn(Meteor, 'user').and.returnValue(user);

        spyOn(connection, "call");

        Cluster.discoverConnection('testService');

        connection.onReconnect();

        expect(connection.call).not.toHaveBeenCalled();
    });
});
