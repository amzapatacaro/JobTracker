using FluentValidation;

namespace JobTracker.Jobs.Application.Features.Create;

/// <summary>
/// Validation rules for <see cref="CreateJobCommand"/>.
/// </summary>
internal sealed class CreateJobCommandValidator : AbstractValidator<CreateJobCommand>
{
    public CreateJobCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Description).MaximumLength(4000);
        RuleFor(x => x.Street).NotEmpty().MaximumLength(500);
        RuleFor(x => x.City).NotEmpty().MaximumLength(200);
        RuleFor(x => x.State).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ZipCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x)
            .Must(x => x.ScheduledDateUtc is null || x.AssigneeId is not null)
            .WithMessage("Assignee is required when scheduling a job.");
    }
}
