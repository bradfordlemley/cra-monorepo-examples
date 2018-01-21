#!/bin/bash

# Error messages are redirected to stderr
function handle_error {
  echo "$(basename $0): ERROR! An error was encountered executing line $1." 1>&2;
  echo 'Exiting with error.' 1>&2;
  exit 1
}

function handle_exit {
  echo 'Exiting without error.' 1>&2;
  exit
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# Echo every command being executed
set -x

function verifyTest {
  CI=true yarn test --watch=no --json --outputFile testoutput.json || return 1
  grep -F "\"numFailedTestSuites\":0" testoutput.json -q || return 1
  grep -F "\"numFailedTests\":0" testoutput.json -q || return 1
  grep -F "\"numPassedTestSuites\":5" testoutput.json -q || return 1
  grep -F "\"numPassedTests\":5" testoutput.json -q || return 1

  # grep "^PASS \.\.[\\/]cra-app1[\\/]src[\\/]App.test.js" testoutput.txt -q || return 1
  # grep -F -R --exclude=*.map "CRA-App3" build/ -q || return 1
  # grep "^PASSIFY" testoutput.txt || return 1
}

function verifyBuild {
  grep -F -R --exclude=*.map "YarnWS-CraApp1" build/ -q || return 1
}

echo "Running test"
#out=`CI=true yarn test --watch=no 2>&1`
#veri

verifyTest # "`CI=true yarn test --watch=no 2>&1`"

# out=`CI=true yarn test --watch=no 2>&1`
# echo "$out" > testoutput.txt
# grep "^PASS ../cra-app1/src/App.test.js" testoutput.txt -q || exit 1
# grep "^PASSIFY" testoutput.txt || exit 1
# #echo "$out" | grep "^PASSIFY" || exit 1
echo $?

echo "DONE!!!!"
