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
    symbol_name: String,
    value: String,
    quantity: u64,
    footprint: String,
    vendor: String,
    description: String,
    vendor_part_number: String,
}