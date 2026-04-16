using FluentValidation;

namespace JobTracker.Jobs.Application.Features.Start;

/// <summary>
/// Validation rules for <see cref="StartJobCommand"/>.
/// </summary>
internal sealed class StartJobCommandValidator : AbstractValidator<StartJobCommand>
{
    /// <summary>Registers FluentValidation rules for <see cref="StartJobCommand"/>.</summary>
    public StartJobCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.JobId).NotEmpty();
        RuleFor(x => x.StartedAtUtc).Must(d => d != default).WithMessage("StartedAtUtc is required.");
    }
}
