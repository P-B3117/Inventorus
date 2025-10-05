const std = @import("std");
const gb = @import("./global.zig");
const api = @import("./api.zig");

const tk = @import("tokamak");

const routes: []const tk.Route = &.{
    // tk.logger(.{}),
    api.corsMiddleware(&.{
        .group("/api", &.{.router(api.Api)}), // Structured routing with a module
    }),
    // .group("/", &.{.router(api.Api)}), // Structured routing with a module
    .send(error.NotFound),
};

// TODO add env variable support for app port
pub fn main() !void {
    // generating memory allocator for db
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    defer _ = gpa.deinit();

    // initializing db
    std.debug.print("initializing db\n", .{});
    try gb.app.initDb(allocator);
    defer gb.app.dbPool.deinit();

    var server = try tk.Server.init(allocator, routes, .{
        .listen = .{ .port = gb.app.port, .hostname = "0.0.0.0" },
    });

    std.debug.print("Starting server on port {}...\n", .{gb.app.port});
    try server.start();
}
