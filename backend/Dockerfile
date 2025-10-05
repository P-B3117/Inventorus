# Use Alpine Linux as base image for smaller size
FROM alpine:3.18 AS builder

# Install Zig and dependencies
RUN apk add --no-cache \
    curl \
    tar \
    xz \
    musl-dev \
    gcc
# Download and install Zig 0.14.1
RUN curl -L https://ziglang.org/download/0.14.1/zig-x86_64-linux-0.14.1.tar.xz -o zig.tar.xz && \
    tar -xf zig.tar.xz && \
    mv zig-x86_64-linux-0.14.1 /usr/local/zig && \
    ln -s /usr/local/zig/zig /usr/local/bin/zig

# Set working directory
WORKDIR /app

# Copy build files
COPY build.zig build.zig.zon ./
COPY src ./src

# Build the application
RUN zig build -Doptimize=ReleaseFast

# Production stage
FROM alpine:3.18

# Install runtime dependencies
RUN apk add --no-cache sqlite

# Create app user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G appgroup appuser

# Set working directory
WORKDIR /app

# Copy the built executable
COPY --from=builder /app/zig-out/bin/zig_api_test ./zig_api_test

# Change ownership
RUN chown -R appuser:appgroup /app

# Create data directory with proper permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Switch to non-root user
USER appuser

# Expose port 8080
EXPOSE 8080

# Run the application
CMD ["./zig_api_test"]
