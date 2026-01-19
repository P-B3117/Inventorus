#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
# set -e

CALLER_DIR=$PWD
SCRIPT_DIR=$(cd $(dirname "${BASH_SOURCE[0]}") && pwd)

cd $SCRIPT_DIR

function build_frontend() {
    cd $SCRIPT_DIR/inventorus-frontend
    bun run build
}

function export_frontend() {
    cp -r $SCRIPT_DIR/inventorus-frontend/build/client/* $SCRIPT_DIR/inventorus-backend/frontend
}

function build_backend() {
    cd $SCRIPT_DIR/inventorus-backend
    go build -o inventorus
}

function move_to_output() {
    cd $SCRIPT_DIR
    mkdir -p output
    cp inventorus-backend/inventorus output/
}

function build_and_move() {
    build_frontend
    export_frontend
    build_backend
    move_to_output
}

function build_and_move_backend() {
    build_backend
    move_to_output
}

case "$1" in
    "frontend")
        build_frontend
        export_frontend
        ;;
    "backend")
        build_backend
        move_to_output
        ;;
    "all")
        build_and_move
        ;;
esac

cd $CALLER_DIR
