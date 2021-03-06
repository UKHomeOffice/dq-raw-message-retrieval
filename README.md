# DQ Raw Message Retrieval

DQ Raw Message Retrieval retrieves the associated RAW zip file from an S3 bucket of a url, and displays its contents in stream.

Requires environment variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `BUCKET_NAME` to be set.

## Components

- **./app**
  - *E:\RAW_ARCHIVE* used by the test suite
  - *test* test suite
  - *Dockerfile* builds a Docker container on Alpine and installs NodeJS for the application to used
  - *package-lock.json* list of packages used to build the container - depends on *package.json*.
     This file is auto-generated by NodeJS upon build. If the container need updating the current file needs to be deleted and the new one copied out from the container that gets built and added to the repository tree.
  - *package.json* lists dependencies to use to build NodeJS within the container
  - *zip_file_fixture.zip* used by the test suite

- **./existing**
  - This is the old application which is only kept here for reference - no longer in use.

- **./kube**
  - *deployment.yml* describe the various containers that will live in the K8S pod
  - *ingress.yml* describe the ACP ingress service
  - *network-policy.yml* describe the port the service is listening on
  - *secret.yml* describe all secrets passed into pod
  - *service.yml* maps the port to the HTTPS service

- **.drone.yml**
  - building the Docker container then deploys it along with all the other K8S Containers into NotProd and Prod

- **test.sh**
  - RMR container tester script

- **zip_file_fixture.zip**
  - example zip file

## Dependencies
- Docker
- Kubernetes
- Keycloak
- AWS

## Testing
- Testing is built into the Docker container build step using the *./app/test* suite by running the *index.test.js* NodeJS script.
