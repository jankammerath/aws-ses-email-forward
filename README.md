# AWS SES E-Mail Forwarding

This application consists of a Lambda function for forwarding e-mails on S3 buckets. It is intended to be used in the scenario where AWS SES stores raw emails on S3 buckets. The CloudFormation template is built to be deployed with just one click.

<a href="https://console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/new?stackName=aws-ses-mail-forward&templateURL=https%3A%2F%2Fraw.githubusercontent.com%2Fjankammerath%2Faws-ses-email-forward%2Fmaster%2Ftemplate.yaml">
    <img src="https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png" alt="Deploy Template" />
</a>