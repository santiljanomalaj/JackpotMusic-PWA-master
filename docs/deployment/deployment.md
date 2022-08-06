# Deployment

This is a breve guide to create a build and deploy it.

## 1. Creating a build

You need to open a terminal in the root of the project and execute the following script:

_Windows_:

```shell script
npm run build:<environment>
```

_Mac OS / Linux_:

```shell script
sudo npm run build:<environment>
```

The available environments are: `staging` or `production`

## 2. Clean S3 bucket environment

1. You must go to
[S3 buckets](https://s3.console.aws.amazon.com/s3/home?region=us-east-1).
1. Enter into the bucket of the environment being deployed. [&sup1;](#footnote1)
1. Then select all files.
1. Delete them.
<!-- markdownlint-disable MD033 -->
<sup id="myfootnote1">&sup1;</sup>:
(Currently only
[jackpot-music-staging](https://s3.console.aws.amazon.com/s3/buckets/jackpot-music-staging/?region=us-east-1&tab=overview)
is available)

## 3. Add build to the bucket

 Now in the project folder:

 1. Once the build process finished, go to the folder `www`.
 2. Drag all files inside the folder into the bucket of the environment being deployed.
 3. Wait until the process is finished. (Do not reload the page until it finishes)

 When the process finished, you now can access it in correspondent link.
