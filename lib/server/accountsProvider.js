Cluster.startProvider = function() {
    Cluster.LoggedInUsers = new Mongo.Collection("loggedInUsers", {connection: null});

    Meteor.users.find().observe({
        added: function(doc) {
            if (Match.test(doc, {services: {resume: {loginTokens: [Object]}}}) &&
                doc.services.resume.loginTokens.length > 0) {
                Cluster.LoggedInUsers.upsert(doc._id, {$set: {tokens: doc.services.resume.loginTokens}});
                Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged in');
            } else {
                if (Cluster.LoggedInUsers.remove(doc._id) > 0)
                    Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged out');
            }
        },
        changed: function(doc) {
            if (Match.test(doc, {services: {resume: {loginTokens: [Object]}}}) &&
                doc.services.resume.loginTokens.length > 0) {
                Cluster.LoggedInUsers.upsert(doc._id, {$set: {tokens: doc.services.resume.loginTokens}});
                Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged in');
            } else {
                if (Cluster.LoggedInUsers.remove(doc._id) > 0)
                    Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged out');
            }
        },
        removed: function(doc) {
            if (Cluster.LoggedInUsers.remove(doc._id) > 0)
                Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged out');
        }
    });

    Meteor.publish("loggedInUsers", function(secret) {
        if  (secret === Cluster._accountsSecret) {
            return Cluster.LoggedInUsers.find();
        } else {
            return null;
        }
    });

    Cluster._accountsLogger.info('Cluster accounts provider has been successfully initialized');
};
