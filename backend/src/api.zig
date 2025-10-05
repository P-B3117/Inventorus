const std = @import("std");
const tk = @import("tokamak");

const gb = @import("./global.zig");
const res = @import("./ressource.zig");

const index = @embedFile("./html/index.html");

// CORS middleware function
pub fn corsMiddleware(children: []const tk.Route) tk.Route {
    const H = struct {
        fn handleCors(ctx: *tk.Context) anyerror!void {
            std.debug.print("CORS middleware entry\n", .{});
            // Add CORS headers to response
            ctx.res.header("access-control-allow-origin", ctx.req.header("origin") orelse "*");

            if (ctx.req.method == .OPTIONS) {
                std.debug.print(".OPTIONS requiring cors\n", .{});
                ctx.res.header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS");
                ctx.res.header("access-control-allow-headers", "content-type");
                ctx.res.header("access-control-allow-private-network", "true");
                try ctx.res.write();
                return ctx.send(void{});
            }

            return ctx.next();
        }
    };

    return .{ .handler = &H.handleCors, .children = children };
}

const compErr = res.Components{
    .id = 0,
    .type_id = 0,
    .value = "",
    .quantity = 0,
    .footprint = "",
    .vendor_id = 0,
    .description = "",
    .vendor_part_number = "",
    .price = 0,
};

const vendErr = res.Vendors{
    .id = 0,
    .name = "",
    .description = "",
    .url = "",
};

const typErr = res.Types{
    .id = 0,
    .name = "",
    .description = "",
    .unit = "",
};

// To be known that specifying the allocator in the function parameters is necessary for memory management
// as that
// allocator frees everything after the requests ends. Somehow that doesn't work for the db.
pub const Api = struct {
    pub fn @"GET /"(response: *tk.Response) !void {
        response.header("Content-Type", "text/html");
        response.body = index;
        try response.write();
    }

    pub fn @"GET /test"(response: *tk.Response) !void {
        response.header("Content-Type", "text/plain");
        response.body = "Test endpoint working";
        try response.write();
    }

    pub fn @"GET /components/:id"(allocator: std.mem.Allocator, id: u32) !res.Components {
        // std.debug.print("component: {}\n", .{id});

        var db = try gb.app.dbPool.getSession(allocator);
        defer db.deinit();

        const req = try db.query(res.Components).find(id);
        if (req) |s| {
            // std.debug.print("component found: {}\n", .{s});
            // Clone the string data to prevent use-after-free
            return s;
        } else {
            return compErr;
        }
    }

    pub fn @"GET /components/"(allocator: std.mem.Allocator) ![]const res.Components {
        //std.debug.print("Listing all components\n", .{});
        var db = try gb.app.dbPool.getSession(allocator);
        defer db.deinit();

        // Create an ArrayList to hold Components values
        var ret = std.ArrayList(res.Components).init(allocator);
        // defer ret.deinit();

        for (try db.query(res.Components).findAll()) |req| {
            // Clone the string data to prevent use-after-free
            // const clone = try req.clone(allocator);
            try ret.append(req);
        }
        return ret.toOwnedSlice();
    }

    pub fn @"POST /components/add"(allocator: std.mem.Allocator, body: res.ComponentsInsert) !void {
        var db = try gb.app.dbPool.getSession(allocator);
        defer db.deinit();

        // std.debug.print("POST /components/add\n", .{});

        _ = try db.insert(res.Components, body);
    }

    pub fn @"POST /components/add/many"(allocator: std.mem.Allocator, body: []const res.ComponentsInsert) !void {
        //std.debug.print("Listing all components\n", .{});
        var db = try gb.app.dbPool.getSession(allocator);
        defer db.deinit();

        try db.conn.execAll("BEGIN TRANSACTION");

        for (body) |*req| {
            _ = try db.insert(res.Components, req.*);
        }

        try db.conn.execAll("COMMIT");
    }

    pub fn @"GET /vendors/:id"(allocator: std.mem.Allocator, id: u32) !res.Vendors {
        // std.debug.print("type: {}\n", .{id});

        var db = try gb.app.dbPool.getSession(allocator);
        defer db.deinit();

        const req = try db.query(res.Vendors).find(id);
        if (req) |s| {
            // std.debug.print("component found: {}\n", .{s});
            // Clone the string data to prevent use-after-free
            return s;
        } else {
            return vendErr;
        }
    }

    pub fn @"GET /vendors/"(allocator: std.mem.Allocator) ![]const res.Vendors {
        //std.debug.print("Listing all Vendors\n", .{});
        var db = try gb.app.dbPool.getSession(allocator);
        defer db.deinit();

        // Create an ArrayList to hold Vendors values
        var ret = std.ArrayList(res.Vendors).init(allocator);
        // defer ret.deinit();

        for (try db.query(res.Vendors).findAll()) |req| {
            // Clone the string data to prevent use-after-free
            // const clone = try req.clone(allocator);
            try ret.append(req);
        }
        return ret.toOwnedSlice();
    }

    pub fn @"POST /vendors/add"(allocator: std.mem.Allocator, body: res.VendorsInsert) !void {
        var db = try gb.app.dbPool.getSession(allocator);
        defer db.deinit();

        // std.debug.print("POST /components/add\n", .{});

        _ = try db.insert(res.Vendors, body);
    }

    pub fn @"GET /types/:id"(allocator: std.mem.Allocator, id: u32) !res.Types {
        // std.debug.print("type: {}\n", .{id});

        var db = try gb.app.dbPool.getSession(allocator);
        defer db.deinit();

        const req = try db.query(res.Types).find(id);
        if (req) |s| {
            // std.debug.print("component found: {}\n", .{s});
            // Clone the string data to prevent use-after-free
            return s;
        } else {
            return typErr;
        }
    }

    pub fn @"GET /types/"(allocator: std.mem.Allocator) ![]const res.Types {
        //std.debug.print("Listing all Types\n", .{});
        var db = try gb.app.dbPool.getSession(allocator);
        defer db.deinit();

        // Create an ArrayList to hold Types values
        var ret = std.ArrayList(res.Types).init(allocator);
        // defer ret.deinit();

        for (try db.query(res.Types).findAll()) |req| {
            // Clone the string data to prevent use-after-free
            // const clone = try req.clone(allocator);
            try ret.append(req);
        }
        return ret.toOwnedSlice();
    }

    pub fn @"POST /types/add"(allocator: std.mem.Allocator, body: res.TypesInsert) !void {
        var db = try gb.app.dbPool.getSession(allocator);
        defer db.deinit();

        // std.debug.print("POST /components/add\n", .{});

        _ = try db.insert(res.Types, body);
    }
};
