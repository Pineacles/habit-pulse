FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY *.csproj .
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet publish -c Release -o /app

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .

# Install curl for healthcheck (minimal install, clean lists)
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run as non-root (APP_UID is the built-in non-root user in aspnet images)
USER $APP_UID

ENTRYPOINT ["dotnet", "HabitPulse.Api.dll"]
