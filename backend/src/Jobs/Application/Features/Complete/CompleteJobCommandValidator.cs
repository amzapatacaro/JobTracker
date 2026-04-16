using FluentValidation;

namespace JobTracker.Jobs.Application.Features.Complete;

/// <summary>
/// Validation rules for <see cref="CompleteJobCommand"/>.
/// </summary>
internal sealed class CompleteJobCommandValidator : AbstractValidator<CompleteJobCommand>
{
    /// <summary>Registers FluentValidation rules for <see cref="CompleteJobCommand"/>.</summary>
    public CompleteJobCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.JobId).NotEmpty();
        RuleFor(x => x.AssigneeId).NotEmpty();
        RuleFor(x => x.SignatureUrl).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.CompletedAtUtc)
            .Must(d => d != default)
            .WithMessage("CompletedAtUtc is required.");
    }
}
