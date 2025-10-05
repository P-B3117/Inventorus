const std = @import("std");

const fr = @import("fridge");
const tk = @import("tokamak");

const gb = @import("./global.zig");
const initSql = @embedFile("./sql/init.sql");
const testSql = @embedFile("./sql/test_values.sql");

pub const App = struct {
    port: u16,
    dbPool: fr.Pool(fr.SQLite3),
    inProd: bool = false,
    dbFileCreate: bool = false,
    dbPath: [:0]const u8 = "./data/inventorusDb.sqlite",

    pub fn initDb(self: *App, allocator: std.mem.Allocator) !void {
        try self.getProdState(allocator);
        try self.getDbPath();
        try self.createDbFile();
        self.dbPool = try fr.Pool(fr.SQLite3).init(allocator, .{ .max_count = 5 }, .{ .filename = self.dbPath });

        var db = try self.dbPool.getSession(allocator);
        defer db.deinit();

        try db.conn.execAll(initSql);
        if (!self.inProd and self.dbFileCreate) {
            try db.conn.execAll(testSql);
        }
    }

    fn getProdState(self: *App, allocator: std.mem.Allocator) !void {
        const test_var = std.process.getEnvVarOwned(allocator, "INVENTORUS_TEST") catch |err| switch (err) {
            error.EnvironmentVariableNotFound => {
                self.inProd = true;
                std.debug.print("Production mode enabled\n", .{});
                return;
            },
            else => return err,
        };
        defer allocator.free(test_var);

        self.inProd = false;
        std.debug.print("Test mode enabled\n", .{});
    }

    fn getDbPath(self: *App) !void {
        _ = std.fs.cwd().statFile(self.dbPath) catch |err| switch (err) {
            error.FileNotFound => {
                std.debug.print("Path '{s}' does not exist.\n", .{self.dbPath});
                self.dbFileCreate = true;
                return;
            },
            else => {
                std.debug.print("Error checking db path\n", .{});
                return err;
            },
        };
    }

    fn createDbFile(self: *App) !void {
        if (self.dbFileCreate) {
            _ = std.fs.cwd().makeDir("data") catch |err| switch (err) {
                error.PathAlreadyExists => {
                    std.debug.print("Dir already exists\n", .{});
                },
                else => return err,
            };
            _ = try std.fs.cwd().createFile(self.dbPath, .{});
            std.debug.print("Database file '{s}' created.\n", .{self.dbPath});
        }
    }
};

// function used to exclude the id field from a struct to make them insertable from the db
fn ExcludeId(comptime T: type) type {
    return @Type(.{
        .@"struct" = .{
            .layout = .auto,
            .fields = blk: {
                var fields: []const std.builtin.Type.StructField = &.{};
                for (@typeInfo(T).@"struct".fields) |f| {
                    if (std.mem.eql(u8, f.name, "id")) continue;
                    fields = fields ++ [_]std.builtin.Type.StructField{f};
                }
                break :blk fields;
            },
            .decls = &.{},
            .is_tuple = false,
        },
    });
}

pub const Components = struct {
    id: u32,
    type_id: u32,
    value: []const u8,
    quantity: u32,
    footprint: []const u8,
    vendor_id: u32,
    description: []const u8,
    vendor_part_number: []const u8,
    price: u16, // gonna have to figure out how to handle this as a float without trailing zeroes and imprecision
};

pub const ComponentsInsert = ExcludeId(Components);

pub const Vendors = struct {
    id: u32,
    url: []const u8,
    description: []const u8,
    name: []const u8,
};

pub const VendorsInsert = ExcludeId(Vendors);

pub const Types = struct {
    id: u32,
    name: []const u8,
    description: []const u8,
    unit: []const u8,
};

pub const TypesInsert = ExcludeId(Types);
