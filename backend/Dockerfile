# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore src/Host/JobTracker.Api/JobTracker.Api.csproj
RUN dotnet publish src/Host/JobTracker.Api/JobTracker.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5296
ENV ASPNETCORE_URLS=http://+:5296
ENTRYPOINT ["dotnet", "JobTracker.Api.dll"]
