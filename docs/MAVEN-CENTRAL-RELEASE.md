# Maven Central release

SDETFlow's Java SDK is prepared for Maven Central as:

`io.github.sumanthh-sdet:sdetflow-api:0.2.0`

The build already produces the required primary JAR, sources JAR, and Javadoc JAR. The release profile also configures GPG signing and the Sonatype Central Publishing Maven Plugin.

## Verified namespace

The Central Portal account has a verified free GitHub namespace:

`io.github.sumanthh-sdet`

The Java artifact therefore publishes as:

`io.github.sumanthh-sdet:sdetflow-api:0.2.0`

The Java source package remains `io.sdetflow.api`. Maven publication coordinates do not need to match the Java package namespace.

## Central Portal account

1. Sign in to https://central.sonatype.com using GitHub.
2. Open **View Namespaces**.
3. Verify the intended namespace.
4. Generate a Central user token from the account page.

Store the generated token pair in GitHub Actions secrets:

- `CENTRAL_USERNAME`
- `CENTRAL_PASSWORD`

Do not paste these values into chat or source control.

## GPG signing

Release signing identity:

- Maintainer: `Sumanth Gumedelli <sumantthh@gmail.com>`
- Public key fingerprint: `00980AF13E4B4F694FDB9B491CBF27780FEA8FFE`

Maven Central requires signatures for the POM and release artifacts.

Create a release signing key, publish the public key to a public OpenPGP key service, and add the private key plus passphrase to GitHub Actions secrets:

- `MAVEN_GPG_PRIVATE_KEY`
- `MAVEN_GPG_PASSPHRASE`

The Maven GPG plugin reads the passphrase from `MAVEN_GPG_PASSPHRASE` in CI.

## Release workflow

The repository contains:

`.github/workflows/maven-central-release.yml`

It:
- checks out the repository;
- configures Java 17 and Maven Central credentials;
- imports the private signing key;
- runs the SDETFlow Java SDK test harness;
- creates primary/source/Javadoc JARs;
- signs release artifacts;
- uploads, validates, and publishes through the Central Publishing Maven Plugin.

## Pre-release verification

The repository also contains:

`.github/workflows/maven-central-readiness.yml`

That workflow runs without secrets and verifies that all required JAR variants can be produced.

## Post-release verification

After Maven Central reports the deployment as published, verify the coordinate from a clean Maven consumer before adding it to the public SDETFlow release table.

Do not describe the Java SDK as published to Maven Central until the canonical Central page resolves and the clean consumer build passes.
