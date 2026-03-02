#!/bin/sh
# Fix permissions on mounted volumes at startup
chmod -R 777 /app/storage 2>/dev/null || true
exec dotnet PIED_LMS.API.dll "$@"
