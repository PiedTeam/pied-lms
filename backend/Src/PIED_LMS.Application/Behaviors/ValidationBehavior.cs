using PIED_LMS.Contract.Services.Identity;
using ValidationException = FluentValidation.ValidationException;

namespace PIED_LMS.Application.Behaviors;

public class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (validators.Any())
        {
            var context = new ValidationContext<TRequest>(request);

            var validationResults = await Task.WhenAll(
                validators.Select(v => v.ValidateAsync(context, cancellationToken)));

            var failures = validationResults
                .Where(r => r.Errors.Count != 0)
                .SelectMany(r => r.Errors)
                .ToList();

            if (failures.Count != 0)
            {
                // Nếu TResponse là ServiceResponse<T>, chúng ta trả về instance thất bại thay vì ném Exception
                if (typeof(TResponse).IsGenericType &&
                    typeof(TResponse).GetGenericTypeDefinition() == typeof(ServiceResponse<>))
                {
                    var errors = failures
                        .GroupBy(x => x.PropertyName)
                        .ToDictionary(
                            g => g.Key,
                            g => g.Select(x => x.ErrorMessage).ToArray()
                        );

                    // Tạo một instance của ServiceResponse<T> với Success = false
                    return (TResponse)Activator.CreateInstance(
                        typeof(TResponse),
                        false,
                        "Validation failed",
                        default,
                        errors,
                        false,
                        null)!;
                }

                throw new ValidationException(failures);
            }
        }

        return await next();
    }
}
