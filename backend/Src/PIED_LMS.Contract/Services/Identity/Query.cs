namespace PIED_LMS.Contract.Services.Identity;

// Get User By ID Query
public record GetUserByIdQuery(Guid UserId) : IRequest<ServiceResponse<UserDto>>;

// Get Me Query (Current Profile)
public record GetMeQuery(Guid UserId) : IRequest<ServiceResponse<UserDto>>;

// Get All Users Query
public record GetAllUsersQuery(int PageNumber = 1, int PageSize = 10)
    : IRequest<ServiceResponse<PaginatedResponse<UserDto>>>;

// Get All Students Query (for Mentor)
public record GetAllStudentsQuery(int PageNumber = 1, int PageSize = 10)
    : IRequest<ServiceResponse<PaginatedResponse<UserDto>>>;

// Check User Exists Query
public record CheckUserExistsQuery(string Email) : IRequest<ServiceResponse<bool>>;

// Get User Roles Query
public record GetUserRolesQuery(Guid UserId) : IRequest<ServiceResponse<List<string>>>;
