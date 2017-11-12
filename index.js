var AWS = require('aws-sdk');
var forwardFrom = process.env.from_address;
var forwardTo = process.env.to_address;
exports.handler = function(event, context) {
    var msgInfo = JSON.parse(event.Records[0].Sns.Message);

    // don't process spam messages
    if (msgInfo.receipt.spamVerdict.status === 'FAIL' || msgInfo.receipt.virusVerdict.status === 'FAIL') {
        console.log('Message is spam or contains virus, ignoring.');
        context.succeed();
    }

    var email = msgInfo.content,
        headers = "From: " + forwardFrom + "\r\n";
    headers += "Reply-To: " + msgInfo.mail.commonHeaders.from[0] + "\r\n";
    headers += "X-Original-To: " + msgInfo.mail.commonHeaders.to[0] + "\r\n";
    headers += "To: " + forwardTo + "\r\n";
    headers += "Subject: Fwd: " + msgInfo.mail.commonHeaders.subject + "\r\n";

    if (email) {
        var res;
        res = email.match(/Content-Type:.+\s*boundary.*/);
        if (res) {
            headers += res[0] + "\r\n";
        } else {
            res = email.match(/^Content-Type:(.*)/m);
            if (res) {
                headers += res[0] + "\r\n";
            }
        }

        res = email.match(/^Content-Transfer-Encoding:(.*)/m);
        if (res) {
            headers += res[0] + "\r\n";
        }

        res = email.match(/^MIME-Version:(.*)/m);
        if (res) {
            headers += res[0] + "\r\n";
        }

        var splitEmail = email.split("\r\n\r\n");
        splitEmail.shift();

        email = headers + "\r\n" + splitEmail.join("\r\n\r\n");
    } else {
        email = headers + "\r\n" + "Empty email";
    }

    new AWS.SES().sendRawEmail({
        RawMessage: { Data: email }
    }, function(err, data) {
        if (err) context.fail(err);
        else {
            console.log('Sent with MessageId: ' + data.MessageId);
            context.succeed();
        }
    });
}