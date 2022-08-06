# package.json

This is the file used for *Node Package Manager (NPM)*.

## scripts

It contains scripts the can be used in the terminal.

```shell script
npm run <available-script>
```

Available scripts:

* `start`: Launch the app.
* `serve:dev`: Same as `start` script.
* `build:clean`: Clean the build already created.
* `build:dev`: Build the app for the development environment.
* `build:staging`: Build the app for the staging environment.
* `build:production`: Build the app for the production environment.
* `lint:ts`: Check TypeScript code for readability, use tsconfig.json.
* `lint:css`: Check CSS code for readability, use .stylelintrc.
* `lint:scss`: Check SCSS code for readability, use .stylelintrc.
* `lint-staged`: Check all code for readability, it is use before create a commit in Git.

## dependencies

Here are placed all packages used by the app and its respective versions.a commit in Git.

## devDependencies

Here are placed all packages used for development proposes and its respective versions.
