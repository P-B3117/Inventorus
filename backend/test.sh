#! /user/bin/bash

curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"username":"Charles","password":"lol", "status":1}' \
  http://localhost:3000/user
