use axum::{
    http::StatusCode,
    routing::{get, post},
    Json, Router,
    extract::State,
};
use geekorm::{prelude::*, Database};
use libsql::{Builder, Connection, OpenFlags};
use rand::Rng;
use serde;
use std::{
    cmp::Ordering,
    env, io,
    path::{self, PathBuf},
    cell::RefCell
};
use std::sync::Arc;
use tokio::sync::Mutex;



const DEBUG: bool = true;
const FILE: bool = true;


/// Using the `Table` derive macro to generate the `Users` table
#[derive(Table, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct Users {
    #[geekorm(primary_key, auto_increment)]
    id: PrimaryKeyInteger,
    /// Unique username field
    #[geekorm(unique)]
    username: String,
    /// Password field with automatic hashing
    #[geekorm(hash)]
    password: String,
}


#[derive(Clone)]
struct AppState {
    connection: libsql::Connection,
}

#[tokio::main]
async fn main() {
    let db: libsql::Database;
    let handle = tokio::runtime::Handle::current();

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

    let conn = db
        .connect()
        .expect(&format!("failed to connect to new database in memory"));

    Users::create_table(&conn)
        .await
        .expect("couldn't create user table");

    let mut username = String::new();
    username.push_str("Username");
    get_info(&mut username);

    let mut password = String::new(); // TODO would need to only store the hash or wtv... but technically hashed by the frontend right?
    password.push_str("Password");
    get_info(&mut password);

    // let task1 = handle.spawn(add_user(username, password, &conn));
    // add_user(username, password);

    // build our application with a route
    let app = Router::new()
        // `GET /` goes to `root`
        .route("/", get(root))
        // `POST /users` goes to `create_user`
        .route("/users", post(create_user)
        .with_state(AppState {
            connection: conn,
        })
    );

    // run our app with hyper
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn add_user(username: String, password: String, conn: &Connection) {
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
        user = Users::new(&username, &password);
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
    State(state): State<AppState>, Json(payload): Json<CreateUser>, 
) -> (StatusCode, Json<User>) {
    println!("inserting user");
    // insert your application logic here
    add_user(payload.username, payload.password, &state.connection).await;
    
    let user = User {
        id: 1,
        username: String::from("lol"),
    };

    // this will be converted into a JSON response
    // with a status code of `201 Created`
    (StatusCode::CREATED, Json(user))
}



// the input to our `create_user` handler
#[derive(serde::Deserialize)]
struct CreateUser {
    username: String,
    password: String,
}

// the output to our `create_user` handler
#[derive(serde::Serialize)]
struct User {
    id: u64,
    username: String,
}