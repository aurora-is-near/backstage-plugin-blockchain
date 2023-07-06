# Contributing to Backstage

Our vision for the Backstage Blockchain plugin is for it to become the trusted standard toolbox (read: Inventory layer) for the web3 landscape. Think of it as configurable inventory management for blockchain networks.

We wanna promote outside contributions -- all working together to create infrastructure software that the web3 industry deserves.

Contributions are welcome, and they are greatly appreciated! Every little bit helps, and credit will always be given. ❤️

This plugin is released under the CC 1.0 License, and original creations contributed to this repo are accepted under the same license.

## Get Started!

So...feel ready to jump in? Let's do this. 👏🏻💯

In the repository's root, write an app-config with data sources for the catalog (look at example usage), install plugin's dependencies and start the development server.

```bash
# Modify app-config with entity data sources
cp app-config.example.yaml app-config.local.yaml
yarn install
yarn dev
```

Once it's running, navigate to [localhost:3000](http:localhost:3000) to see the root catalog page.

## Coding Guidelines

All code is formatted with `prettier` using the configuration in the repo. If possible we recommend configuring your editor to format automatically, but you can also use the `yarn prettier --write <file>` command to format files.

Also be sure to skim through Backstage's [ADRs](docs/architecture-decisions) to see if they cover what you're working on.

## Creating Changesets

We use [changesets](https://github.com/atlassian/changesets) to help us prepare releases. They help us make sure that every package affected by a change gets a proper version number and an entry in its `CHANGELOG.md`. To make the process of generating releases easy, it helps when contributors include changesets with their pull requests.

### When to use a changeset?

Any time a patch, minor, or major change aligning to [Semantic Versioning](https://semver.org) is made to any published package in `packages/` or `plugins/`, a changeset should be used. It helps to align your change to the [Backstage package versioning policy](https://backstage.io/docs/overview/versioning-policy#package-versioning-policy) for the package you are changing, for example, when to provide additional clarity on deprecation or impacting changes which will then be included into CHANGELOGs.

In general, changesets are only needed for changes to packages within `packages/` or `plugins/` directories, and only for the packages that are not marked as `private`. Changesets are also not needed for changes that do not affect the published version of each package, for example changes to tests or in-line source code comments.

Changesets **are** needed for new packages, as that is what triggers the package to be part of the next release.

### How to create a changeset

1. Run `yarn changeset`
2. Select which packages you want to include a changeset for
3. Select impact of the change you're introducing. If the package you are changing is at version `0.x`, use `minor` for breaking changes and `patch` otherwise. If the package is at `1.0.0` or higher, use `major` for breaking changes, `minor` for backwards compatible API changes, and `patch` otherwise. See the [Semantic Versioning specification](https://semver.org/#semantic-versioning-specification-semver) for more details.
4. Explain your changes in the generated changeset. See [examples of well written changesets](https://backstage.io/docs/getting-started/contributors#writing-changesets).
5. Add generated changeset to Git
6. Push the commit with your changeset to the branch associated with your PR
7. Accept our gratitude for making the release process easier on the maintainers

For more information, check out [adding a changeset](https://github.com/atlassian/changesets/blob/master/docs/adding-a-changeset.md) documentation in the changesets repository.

## Merging to Main

For those contributors who have earned write access to the repository, when a pull request is approved, in general we prefer the author of the PR to perform the merge themselves. This allows them to own accountability for the change and they likely know best how or when to address pending fixes or additional follow-ups. In this way, we all help contribute to the project's successful outcomes.
