Cluster.startProvider = function() {
    Cluster.LoggedInUsers = new Mongo.Collection("loggedInUsers", {connection: null});

    var matcher = Match.ObjectIncluding({services: Match.ObjectIncluding({resume: Match.ObjectIncluding({loginTokens: Array})})});

    Meteor.users.find().observe({
        added: function(doc) {
            if (Match.test(doc, matcher) &&
                doc.services.resume.loginTokens.length > 0) {
                Cluster.LoggedInUsers.insert({_id: doc._id, tokens: doc.services.resume.loginTokens, data: doc});
                Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged in');
            } else {
                if (Cluster.LoggedInUsers.remove(doc._id) > 0)
                    Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged out');
            }
        },
        changed: function(doc) {
            if (Match.test(doc, matcher) &&
                doc.services.resume.loginTokens.length > 0) {
                Cluster.LoggedInUsers.upsert(doc._id, {$set: {tokens: doc.services.resume.loginTokens, data: doc}});
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
