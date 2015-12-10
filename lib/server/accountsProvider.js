Cluster.startProvider = function() {
    Cluster.LoggedInUsers = new Mongo.Collection("loggedInUsers", {connection: null});

    Meteor.users.find({"services.resume.loginTokens.hashedToken": {$exists: true}},
        {fields: {"services.resume.loginTokens.hashedToken": true}}).observeChanges({
        added: function(id, fields) {
            Cluster.LoggedInUsers.insert({_id: id, tokens: fields.services.resume.loginTokens});
        },
        changed: function(id, fields) {
            Cluster.LoggedInUsers.update(id, {$set: {tokens: fields.services.resume.loginTokens}});
        },
        removed: function(id) {
            Cluster.LoggedInUsers.remove(id);
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
