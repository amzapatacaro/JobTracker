using JobTracker.Jobs.Presentation.Controllers;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Jobs.Presentation;

/// <summary>
/// MVC extensions to register Jobs controller assembly as an application part.
/// </summary>
public static class JobsPresentationMvcExtensions
{
    public static IMvcBuilder AddJobsControllers(this IMvcBuilder mvc) =>
        mvc.AddApplicationPart(typeof(JobsController).Assembly);
}
