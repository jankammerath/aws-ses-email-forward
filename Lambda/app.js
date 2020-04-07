/* require the AWS SDK */
const AWS = require('aws-sdk');

/**
 * This lambda function receives notifications from
 * SES about new emails and forwards them to the 
 * new destination email address as defined in the
 * environment variables
 */
exports.lambdaHandler = async (event, context) => {
    /* get the email records */
    let promiseList = [];
    if(event.hasOwnProperty('Records')){
        /* update the AWS region */
        if(event.Records.length > 0){
            /* set the region to the one the bucket is in */
            AWS.config.update({region: event.Records[0].awsRegion});
        }

        /* walk through the records */
        for(let r=0; r<event.Records.length; r++){
            /* execute the forward process */
            promiseList.push(forwardMessage(event.Records[r]));
        }
    }

    /* wait for all promises to finish */
    await Promise.all(promiseList);

    /* finish the script */
    return true;
}

/**
 * Fetches a raw email from an s3 bucket at
 * the specified location, parses it, rewrites
 * it and sends it to the new destination
 * using SES in the current region
 * 
 * @param {object} s3record
 * the record of the s3 file with the mail content
 */
async function forwardMessage(s3record){
    /* create the instance of the s3 sdk */
    let s3 = new AWS.S3();

    /* fetch the message from s3 */
    let response = await s3.getObject({
        Bucket: s3record.s3.bucket.name,
        Key: s3record.s3.object.key
    }).promise();

    /* get the content and rewrite it */
    if(response !== null){
        let content = response.Body.toString('ascii');
        let transformed = rewriteMessage(content);

        /* create the instance of the SES sdk and send message */
        let ses = new AWS.SES({apiVersion: '2010-12-01'});
        await ses.sendRawEmail({RawMessage: {Data: transformed}}).promise();
    }
}

/**
 * Rewrites the mail message, parsing its content
 * and returning the new message as string
 * 
 * @param {string} content 
 * complete message with headers and body
 */
function rewriteMessage(content){
    /* set the new default from address */
    let result = "From: " + process.env['SENDER_ADDRESS'] + "\r\n";

    /* get the header part of the message */
    let headerPart = content.substring(0,content.indexOf('\r\n\r\n'));

    /* parse the recipient of this message and define
        the target mail address to forward this message to */
    let toHeader = (/^To:(.*)$/gmi).exec(headerPart);
    if(toHeader !== null){
        if(toHeader.length === 2){
            /* rewrite the to-header with the new recipient */
            result += "To: " + getTargetMailAddress(toHeader[1].trim()) + "\r\n";
        }
    }

    /* parse the subject of this message */
    let subjectHeader = (/^Subject:(.*)$/gmi).exec(headerPart);
    if(subjectHeader !== null){
        if(subjectHeader.length === 2){
            result += "Subject: " + subjectHeader[1].trim() + "\r\n";
        }
    }

    /* parse the from header of this message and add it as reply-to */
    let fromHeader = (/^From:(.*)$/gmi).exec(headerPart);
    if(fromHeader !== null){
        if(fromHeader.length === 2){
            result += "Reply-To: " + fromHeader[1].trim() + "\r\n";
        }
    }  
    
    /* parse the from header of this message and add it as reply-to */
    let contentTypeHeader = (/^Content-Type:(.*)$/gmi).exec(headerPart);
    if(contentTypeHeader !== null){
        if(contentTypeHeader.length === 2){
            result += "Content-Type: " + contentTypeHeader[1].trim() + "\r\n";
        }
    }

    /* get the content part and let it untouched */
    result += content.substr(content.indexOf('\r\n\r\n'));
    
    return result;
}

/**
 * Determines the target email address to forward the message
 * to based on the original recipient in the original message
 * 
 * @param {string} sourceTarget 
 * address of the recipient on the original message
 */
function getTargetMailAddress(sourceTarget){
    let result = process.env['DEFAULT_RECIPIENT'];

    for(let envVar in process.env){
        if(envVar.startsWith('FORWARD_RULE_')){
            let fromAddress = process.env[envVar].split(';')[0].trim();
            if(fromAddress.toLowerCase() === sourceTarget.toLowerCase()){
                result = process.env[envVar].split(';')[1].trim();
            }
        }
    }

    return result;
}