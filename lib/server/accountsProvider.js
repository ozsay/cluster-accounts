Cluster.startProvider = function() {
    LoggedInUsers = new Mongo.Collection("loggedInUsers", {connection: null});

    Meteor.users.find().observe({
        added: function(doc) {
            if (doc.services !== undefined &&
                doc.services.resume !== undefined &&
                doc.services.resume.loginTokens !== undefined &&
                doc.services.resume.loginTokens.length > 0) {
                LoggedInUsers.upsert(doc._id, {$set: {tokens: doc.services.resume.loginTokens}});
                Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged in');
            } else {
                if (LoggedInUsers.remove(doc._id) > 0)
                    Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged out');
            }
        },
        changed: function(doc) {
            if (doc.services !== undefined &&
                doc.services.resume !== undefined &&
                doc.services.resume.loginTokens !== undefined &&
                doc.services.resume.loginTokens.length > 0) {
                LoggedInUsers.upsert(doc._id, {$set: {tokens: doc.services.resume.loginTokens}});
                Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged in');
            } else {
                if (LoggedInUsers.remove(doc._id) > 0)
                    Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged out');
            }
        },
        removed: function(doc) {
            if (LoggedInUsers.remove(doc._id) > 0)
                Cluster._accountsLogger.info('User with id ' + doc._id + ' has logged out');
        }
    });

    Meteor.publish(null, function() {
        return Meteor.users.find({},
            {fields: {'services': 1}});
    });

    Meteor.publish("loggedInUsers", function(secret) {
        if  (secret === Cluster._accountsSecret) {
            return LoggedInUsers.find();
        } else {
            return null;
        }
    });

    Cluster._accountsLogger.info('Cluster accounts provider initialized successfully');
};
