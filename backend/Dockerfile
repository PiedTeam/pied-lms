FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS base
WORKDIR /app
EXPOSE 8080
RUN apk add --no-cache icu-libs docker-cli

RUN mkdir -p /app/storage && chmod -R 777 /app/storage

FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# 1. Copy project files & Restore (Để tận dụng Cache Layer)
COPY ["Src/PIED_LMS.API/PIED_LMS.API.csproj", "Src/PIED_LMS.API/"]
COPY ["Src/PIED_LMS.Application/PIED_LMS.Application.csproj", "Src/PIED_LMS.Application/"]
COPY ["Src/PIED_LMS.Contract/PIED_LMS.Contract.csproj", "Src/PIED_LMS.Contract/"]
COPY ["Src/PIED_LMS.Domain/PIED_LMS.Domain.csproj", "Src/PIED_LMS.Domain/"]
COPY ["Src/PIED_LMS.Infrastructure/PIED_LMS.Infrastructure.csproj", "Src/PIED_LMS.Infrastructure/"]
COPY ["Src/PIED_LMS.Persistence/PIED_LMS.Persistence.csproj", "Src/PIED_LMS.Persistence/"]
COPY ["Src/PIED_LMS.Presentation/PIED_LMS.Presentation.csproj", "Src/PIED_LMS.Presentation/"]
COPY ["Directory.Build.props", "./"]
COPY ["Directory.Packages.props", "./"]
COPY ["global.json", "./"]

RUN dotnet restore "Src/PIED_LMS.API/PIED_LMS.API.csproj"

# 2. Copy toàn bộ source code vào (BẮT BUỘC TRƯỚC KHI PUBLISH)
COPY . .

# 3. Publish (Chỉ cần 1 lần duy nhất ở đây)
RUN dotnet publish "Src/PIED_LMS.API/PIED_LMS.API.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
ENTRYPOINT ["./entrypoint.sh"]
