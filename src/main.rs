use geekorm::prelude::*;
use libsql::{Builder, Connection, OpenFlags};
use rand::Rng;
use serde;
use std::{
    cmp::Ordering,
    env, io,
    path::{self, PathBuf},
};

const DEBUG: bool = true;
const FILE: bool = false;

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

#[tokio::main]
async fn main() {
    let db;
    let handle = tokio::runtime::Handle::current();

    if FILE {
        // Initialize an in-memory database
        db = libsql::Builder::new_local(":memory:")
            .build()
            .await
            .expect(&format!("failed to create new database in memory"));
    } else {
        // // Initialize a database in a file
        let mut path: PathBuf = [
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

    let task1 = handle.spawn(add_user(username, password, conn));
    //add_user(username, password);

    println!("Welcome to the guessing game!");

    game();

    println!("Was nice seeing you");
}

async fn add_user(username: String, password: String, conn: Connection) {
    if DEBUG {
        println!("Creating new user");
    }

    let mut user: Users;
    let req = Users::fetch_by_username(&conn, &username).await;

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
        user.save(&conn).await.expect("couldn't save the user");
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

fn game() {
    println!("\nPlease tell us the number you are guessing\n");
    let mut secret: u32;

    loop {
        secret = rand::rng().random_range(1..=100);
        println!("The secret number is: {secret}");

        let mut guess = String::new();
        io::stdin()
            .read_line(&mut guess)
            .expect("failed to read line");

        let guess: u32 = guess.trim().parse().expect("Please type a number!");

        println!("You guessed: {}", guess);

        match guess.cmp(&secret) {
            Ordering::Less => {
                println!("You guessed too small");
                break;
            }
            Ordering::Greater => {
                println!("You guessed too big");
                break;
            }
            Ordering::Equal => println!("You guessed right"),
        }
    }

    let mut guess = String::new();
    println!("Do you want to play again? (y/n): ");
    io::stdin()
        .read_line(&mut guess)
        .expect("Couldn't read answer");
    if guess.trim() == "y" {
        game();
    }
}
