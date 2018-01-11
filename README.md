#### TLDR;
This repo is to help develop monorepo support in create-react-app.

#### Example monorepo
```
monorepo
  |--packages.json: workspaces: ["apps/*", "comps/*", "cra-comps/*"] <-- (yarn workspace)
  |--lerna.json: packages: ["apps/*", "comps/*", "cra-comps/*"] <-- (lerna w/o yarn workspace)
  |--apps
    |--cra-app1 <-- basic cra-app, doesn't use any monorepo comps
    |--cra-app2 <-- basic cra-app, doesn't use any monorepo comps
    |--cra-app3 <-- uses some monorepo comps
      |--package.json: dependencies: ["comp1": <vsn>, "comp2": <vsn>]
  |--comps
    |--comp3
      |--package.json: main: build/index.js
      |--build/index.js  <-- don't transpile?
      |--index.js
      |--index.test.js <-- don't test?
  |--cra-comps
    |--comp1
      |--package.json: main: comp1.js
      |--comp1.js
      |--comp1.test.js
    |--comp2
      |--package.json: dependencies: ["comp1"]
      |--comp2.js: import comp1 from 'comp1'
      |--comp2.test.js  <-- include tests
```
### Issues
There are two main issues regarding monorepo support in CRA:
1. [Issue 3031](https://github.com/facebookincubator/create-react-app/issues/3031): Can't run create-react-app in workspace
   * This issue is mainly just that monorepo tools (yarn/lerna) can hoist react-scripts to a top-level node_modules which breaks some create-react-app code that expects react-scripts to be in app's node_modules.
   * This is fixed by [PR 3435](https://github.com/facebookincubator/create-react-app/pull/3435) ([rmhartog's fork](https://github.com/rmhartog/create-react-app/tree/support-yarn-workspaces)).
1. [Issue 1333](https://github.com/facebookincubator/create-react-app/issues/1333): Support Lerna and/or Yarn Workspaces
   * This is the issue for actually supporting shared source in monorepos.

#### Some questions about how monorepo functionality should work:
1. Should tests from cra-comps run when running app tests?
1. Should files from cra-comps be linted when building app?
1. Should any directory structure within cra-comps be enforced?
1. How to flag components that should not be treated as cra-comps?

### Setup Info

#### Install this example monorepo
1. npm install lerna -g  <-- if lerna not already installed
1. git clone https://github.com/bradfordlemley/cra-monorepo-examples
1. cd cra-monorepo-examples
1. npm lerna:install
1. npm link react-scripts <-- (use fork of cra, after running commands below)
1. cd apps/cra-app3 and do anything you'd normally do, e.g. npm start/build/test.
1. run "npm run reset" to reset the lerna workspace, e.g. if playing around installing mods, etc.

Note: this monorepo currently uses lerna+npm; lerna+yarn, lerna+ yarn workspace, or just yarn workspaces should also work.

#### How to use a fork of create-react-app (e.g. that supports this repo)
1. git clone -b feature-monorepos https://github.com/bradfordlemley/create-react-app  <-- or whatever fork/branch of create-react-app
1. cd create-react-app
1. npm install
1. cd packages/react-scripts
1. npm link  <-- tell npm you might want to use this react-scripts

See [CRA contributing](https://github.com/facebookincubator/create-react-app/blob/master/CONTRIBUTING.md#setting-up-a-local-copy) for more info on using a cra fork.

### Tests
#### Tests for verify monorepo support ([Issue 1333](https://github.com/facebookincubator/create-react-app/issues/1333))
1. Test cra-app3 in this monorepo
   1. Install this monorepo as described above
   1. Open terminal at apps/cra-app3
   1. Verify npm start/build/test run correctly

Note: CRA monorepo functionality TBD, see questions above.

#### Tests for verifying "create-react-app" works ([Issue 3031](https://github.com/facebookincubator/create-react-app/issues/3031))
1. "create-react-app" works in workspace
   1. Open terminal at workspace root.
   1. /path/to/forked/packages/create-react-app cra-newapp <-- create app
   1. Update src/App.js and public/index.html to have "New App" in titles
   1. cd cra-newapp
   1. yarn start <-- verify app runs in browser with "New App" titles
   1. yarn build <-- verify build succeeds
   1. yarn test <-- verify test succeeds
1. "create-react-app" works outside of workspace
   1. Open terminal somewhere outside workspace root.
   1. /path/to/forked/packages/create-react-app newapp <-- create app
   1. Verification similar to above
1. "npm run create-react-app" works when running from create-react-app dev repo
   1. Open terminal at root of forked create-react-app repo
   1. npm run create-react-app newapp  <-- create app
   1. Verification similar to above
1. "npm run start/build/test" work when running from create-react-app dev repo
   1. Open terminal at root of forked create-react-app repo
   1. npm run start/build/test
   1. Verification similar to above, ensure template files are used
