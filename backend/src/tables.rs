use geekorm::prelude::*;

/// Using the `Table` derive macro to generate the `Users` table
#[derive(Table, Default, serde::Serialize, serde::Deserialize)]
pub struct Users {
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

/// Using the `Table` derive macro to generate the `Components` table
#[derive(Table, Default, serde::Serialize, serde::Deserialize)]
pub struct Components {
    #[geekorm(primary_key, auto_increment)]
    id: PrimaryKeyInteger,
    type_id: i32,
    value: String,
    quantity: u64,
    footprint: String,
    vendor_id: i32, // manual foreign key cos not supported by geekorm
    description: String,
    vendor_part_number: String,
    price: i32,
}

/// Using the `Table` derive macro to generate the `Components` table
#[derive(Table, Default, serde::Serialize, serde::Deserialize)]
pub struct Vendors {
    #[geekorm(primary_key, auto_increment)]
    id: PrimaryKeyInteger,
    url: String,
    description: String,
    name: String, // indexed cos always queried by name
}

/// Using the `Table` derive macro to generate the `Components` table
#[derive(Table, Default, serde::Serialize, serde::Deserialize)]
pub struct Types {
    #[geekorm(primary_key, auto_increment)]
    id: PrimaryKeyInteger,
    name: String, // indexed cos always queried by name
    description: String,
}
