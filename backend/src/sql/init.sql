CREATE TABLE IF NOT EXISTS Types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    unit TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    description TEXT NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    footprint TEXT NOT NULL,
    vendor_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    vendor_part_number TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (type_id) REFERENCES Types(id),
    FOREIGN KEY (vendor_id) REFERENCES Vendors(id)
);
