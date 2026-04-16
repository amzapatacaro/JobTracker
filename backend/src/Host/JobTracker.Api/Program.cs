using Hangfire;
using JobTracker.Jobs.Infrastructure.Extensions;
using JobTracker.Jobs.Infrastructure.Persistence;
using JobTracker.Jobs.Presentation;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

builder.Services.AddJobsInfrastructure(connectionString);
builder.Services.AddControllers().AddJobsControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "JobTracker API", Version = "v1" });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<JobTrackerDbContext>();
    await db.Database.EnsureCreatedAsync();
}

var recurringJobManager = app.Services.GetRequiredService<IRecurringJobManager>();
recurringJobManager.RegisterOutboxRecurringJob();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "JobTracker API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
