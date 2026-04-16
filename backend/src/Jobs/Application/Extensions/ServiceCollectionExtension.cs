using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Jobs.Application.Extensions;

/// <summary>
/// Registers MediatR and FluentValidation for the Jobs application layer.
/// </summary>
public static class ServiceCollectionExtension
{
    /// <summary>Registers MediatR handlers and FluentValidation validators from the Jobs application assembly.</summary>
    public static IServiceCollection AddJobsApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly())
        );
        services.AddValidatorsFromAssembly(
            Assembly.GetExecutingAssembly(),
            ServiceLifetime.Scoped,
            filter: null,
            includeInternalTypes: true
        );
        return services;
    }
}
