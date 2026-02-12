FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS base
WORKDIR /app
EXPOSE 8080
# Install ICU libs before switching to non-root user
RUN apk add --no-cache icu-libs
USER app

FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project files
COPY ["Src/PIED_LMS.API/PIED_LMS.API.csproj", "Src/PIED_LMS.API/"]
COPY ["Src/PIED_LMS.Application/PIED_LMS.Application.csproj", "Src/PIED_LMS.Application/"]
COPY ["Src/PIED_LMS.Contract/PIED_LMS.Contract.csproj", "Src/PIED_LMS.Contract/"]
COPY ["Src/PIED_LMS.Domain/PIED_LMS.Domain.csproj", "Src/PIED_LMS.Domain/"]
COPY ["Src/PIED_LMS.Infrastructure/PIED_LMS.Infrastructure.csproj", "Src/PIED_LMS.Infrastructure/"]
COPY ["Src/PIED_LMS.Persistence/PIED_LMS.Persistence.csproj", "Src/PIED_LMS.Persistence/"]
COPY ["Src/PIED_LMS.Presentation/PIED_LMS.Presentation.csproj", "Src/PIED_LMS.Presentation/"]

# Copy build props and global config
COPY ["Directory.Build.props", "./"]
COPY ["Directory.Packages.props", "./"]
COPY ["global.json", "./"]

RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish "Src/PIED_LMS.API/PIED_LMS.API.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false

# Copy source code
COPY . .

RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish "Src/PIED_LMS.API/PIED_LMS.API.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false \
    --no-restore


FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

ENTRYPOINT ["dotnet", "PIED_LMS.API.dll"]
