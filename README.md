# AWS SES E-Mail Forwarding

This application consists of a Lambda function for forwarding e-mails on an S3 buckets. It is intended to be used in the scenario where AWS SES stores raw emails on S3 buckets. The CloudFormation template is built to be deployed with just one click. It creates the s3 bucket, the lambda script with the code as well as the required policies and permission.

<a href="https://console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/new?stackName=aws-ses-mail-forward&templateURL=https%3A%2F%2Fraw.githubusercontent.com%2Fjankammerath%2Faws-ses-email-forward%2Fmaster%2Ftemplate.yaml">
    <img src="https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png" alt="Deploy Template" />
</a>

Once the CloudFormation stack is installed, you can assign the newly created s3 bucket to the SES Rule Set. SES will then store the e-mails on the s3 bucket and once new files are stored on that bucket, the Lambda function will get invoked, parse and rewrite the e-mail. Afterwards it will send the e-mail through SES.

## Configure target addresses

You can configure a default target and the sender address through the CloudFormation template. The original sender will be kept in the 'Reply-To' header of the forwarded message. If you wish to define further source e-mail addresses and their individual destinations you can create environment variables for the Lambda script.

| Environment variable           | Value               | Description                                           |
| :------------------------------|:--------------------|:------------------------------------------------------|
| forward-from:user@domain.com   | user@target.com     | Forwards from user@domain.com to user@target.com      |

If none of the environment variables match the original target e-mail address, then the message will be forwarded to the destination e-mail address defined in the CloudFormation template.