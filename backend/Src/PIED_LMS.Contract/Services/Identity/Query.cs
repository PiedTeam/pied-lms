namespace PIED_LMS.Contract.Services.Identity;

// Get User By ID Query
public record GetUserByIdQuery(Guid UserId) : IRequest<ServiceResponse<UserResponse>>;

// Get All Users Query
public record GetAllUsersQuery(int PageNumber = 1, int PageSize = 10)
    : IRequest<ServiceResponse<PaginatedResponse<UserResponse>>>;

// Check User Exists Query
public record CheckUserExistsQuery(string Email) : IRequest<ServiceResponse<bool>>;

// Get User Roles Query
public record GetUserRolesQuery(Guid UserId) : IRequest<ServiceResponse<List<string>>>;
