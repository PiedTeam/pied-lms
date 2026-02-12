using FluentValidation;

namespace PIED_LMS.Contract.Services.Identity.Validators;

public class GetAllUsersQueryValidator : AbstractValidator<GetAllUsersQuery>
{
    private const int MaxPageSize = 100;

    public GetAllUsersQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThan(0).WithMessage("Page number must be greater than 0");
        RuleFor(x => x.PageSize)
            .GreaterThan(0).WithMessage("Page size must be greater than 0")
            .LessThanOrEqualTo(MaxPageSize).WithMessage($"Page size must be <= {MaxPageSize}");
    }
}
