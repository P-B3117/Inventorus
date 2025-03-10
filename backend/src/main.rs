use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use geekorm::{prelude::*, Database, GEEKORM_BANNER, GEEKORM_VERSION};
use libsql::{Builder, Connection, OpenFlags};
use rand::Rng;
use serde;
use std::sync::Arc;
use std::{
    cell::RefCell,
    cmp::Ordering,
    env, io,
    path::{self, PathBuf},
};
use tokio::sync::Mutex;

const DEBUG: bool = true;
const FILE: bool = true;

/// Using the `Table` derive macro to generate the `Users` table
#[derive(Table, Default, serde::Serialize, serde::Deserialize)]
struct Users {
    #[geekorm(primary_key, auto_increment)]
    id: PrimaryKeyInteger,
    /// Unique username field
    #[geekorm(unique)]
    username: String,
    /// Password field with automatic hashing
    #[geekorm(hash)]
    password: String,
    // Status to handle permission level
    status: i32,
}

#[derive(Clone)]
struct AppState {
    connection: libsql::Connection,
}

#[tokio::main]
async fn main() {
    println!("{}     v{}\n", GEEKORM_BANNER, GEEKORM_VERSION);

    println!("creating database");
    let db: libsql::Database;
    println!("creating tokio handle");
    let handle = tokio::runtime::Handle::current();

    println!("initializing database");
    if !FILE {
        // Initialize an in-memory database
        db = libsql::Builder::new_local(":memory:")
            .build()
            .await
            .expect(&format!("failed to create new database in memory"));
    } else {
        // // Initialize a database in a file
        let path: PathBuf = [
            env::current_dir().expect("Couldn't get current dir"),
            PathBuf::from("test.sqlite"),
        ]
        .iter()
        .collect();
        db = libsql::Builder::new_local(path)
            .build()
            .await
            .expect(&format!("failed to create new database in file"));
    }

    println!("connecting to database");
    let conn = db
        .connect()
        .expect(&format!("failed to connect to new database in memory"));

    println!("creating tables");
    Users::create_table(&conn)
        .await
        .expect("couldn't create user table");

    println!("creating router");
    // build our application with a route
    let app = Router::new()
        // `GET /` goes to `root`
        .route("/", get(root))
        // `POST /users` goes to `create_user`
        .route(
            "/user",
            post(create_user).with_state(AppState { connection: conn }),
        );

    // run our app with hyper
    println!("creating listener");
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn add_user(username: String, password: String, status: i32, conn: &Connection) {
    if DEBUG {
        println!("Creating new user");
    }

    let mut user: Users;
    let req = Users::fetch_by_username(conn, &username).await;

    if req.is_ok() {
        if DEBUG {
            println!("User exists")
        }
        user = req.unwrap();
        if user.check_password(password).unwrap() {
            if DEBUG {
                println!("User has confirmed his password successfully");
            }
        } else {
            if DEBUG {
                println!("User couldn't confirm password");
            }
        }
    } else {
        user = Users::new(&username, &password, status);
        if DEBUG {
            println!("User: {} has been created", &username);
        }
        user.save(conn).await.expect("couldn't save the user");
        if DEBUG {
            println!("User: {} has been saved", username)
        }
    }
}

fn get_info(info: &mut String) {
    println!("Please enter {}:", info);
    info.clear();
    io::stdin().read_line(info).expect("failed to read line");
}

// basic handler that responds with a static string
async fn root() -> &'static str {
    "Hello, World!"
}

async fn create_user(
    // this argument tells axum to parse the request body
    // as JSON into a `CreateUser` type
    State(state): State<AppState>,
    Json(payload): Json<CreateUser>,
) -> StatusCode {
    println!("inserting user");
    // insert your application logic here
    add_user(
        payload.username,
        payload.password,
        payload.status,
        &state.connection,
    )
    .await;

    // this will be converted into a JSON response
    // with a status code of `201 Created`
    StatusCode::CREATED
}

// the input to our `create_user` handler
#[derive(serde::Deserialize)]
struct CreateUser {
    username: String,
    password: String,
    status: i32,
}
