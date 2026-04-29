using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class CourseEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/courses")
            .WithName("Courses")
            .WithOpenApi();

        // POST /api/courses
        group.MapPost("", CreateCourse)
            .WithName("CreateCourse")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .DisableAntiforgery()
            .Produces<ServiceResponse<int>>(StatusCodes.Status201Created)
            .Produces<ServiceResponse<int>>(StatusCodes.Status400BadRequest)
            .Accepts<IFormFile>("multipart/form-data");

        // PUT /api/courses/{id}
        group.MapPut("/{id:int}", UpdateCourse)
            .WithName("UpdateCourse")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .DisableAntiforgery()
            .Produces<ServiceResponse<string>>(StatusCodes.Status200OK)
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Accepts<IFormFile>("multipart/form-data");

        // DELETE /api/courses/{id}
        group.MapDelete("/{id:int}", DeleteCourse)
            .WithName("DeleteCourse")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest);

        // POST /api/courses/{id}/teachers
        group.MapPost("/{id:int}/teachers", AssignTeachers)
            .WithName("AssignTeachers")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .Produces<ServiceResponse<string>>(StatusCodes.Status200OK)
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest);

        // GET /api/courses
        group.MapGet("", GetCourses)
            .WithName("GetCourses")
            .WithOpenApi()
            .RequireAuthorization()
            .Produces<ServiceResponse<PagedResult<CourseDtoFE>>>(StatusCodes.Status200OK);

        // GET /api/courses/{id}
        group.MapGet("/{id:int}", GetCourseById)
            .WithName("GetCourseById")
            .WithOpenApi()
            .RequireAuthorization()
            .Produces<ServiceResponse<CourseDtoFE>>(StatusCodes.Status200OK)
            .Produces<ServiceResponse<CourseDtoFE>>(StatusCodes.Status404NotFound);
    }

    // POST /api/courses
    //FEHELP: calib thêm các trường như duration, seats, price, mentorId vào CreateCourseCommand và xử lý trong CreateCourseHandler
    // Lê Điệp chỉ có thể chỉnh sữa trên tầng presentation thôi, mọi người xử lý logic thêm nhé
    private static async Task<IResult> CreateCourse(
        [FromForm] string title,
        [FromForm] string? description, // dạng string, string, string để dể split (',') nhé
        [FromForm] IFormFile? thumbnailFile,
        [FromForm] DateTime startDate,
        [FromForm] DateTime endDate,
        [FromForm] CourseStatus status,
        [FromForm] int duration, //thời lượng khóa học
        [FromForm] string? seats, //số lượng chỗ ngồi
        [FromForm] string? price, //giá tiền khóa họcs
        [FromForm] string? mentorId, //tên người hướng dẫn || nhớ kiểm tra xem mentorId có phải là thật không ?
        [FromForm] string? tags,
        [FromForm] string? slug,
        IMediator mediator,
        HttpContext context)
    {
        var tagsList = string.IsNullOrWhiteSpace(tags)
            ? null
            : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var command = new CreateCourseCommand(
            title,
            description,
            thumbnailFile,
            startDate,
            endDate,
            status,
            tagsList,
            slug
        );

        var result = await mediator.Send(command);

        if (result.Success)
        {
            return Results.Created($"/api/courses/{result.Data}", result);
        }

        return result.ToActionResult(context);
    }

    // PUT /api/courses/{id}
    private static async Task<IResult> UpdateCourse(
        int id,
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] IFormFile? thumbnailFile,
        [FromForm] DateTime startDate,
        [FromForm] DateTime endDate,
        [FromForm] CourseStatus status,
        [FromForm] string? tags,
        [FromForm] string? slug,
        IMediator mediator,
        HttpContext context)
    {
        var tagsList = string.IsNullOrWhiteSpace(tags)
            ? null
            : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var command = new UpdateCourseCommand(
            id,
            title,
            description,
            thumbnailFile,
            startDate,
            endDate,
            status,
            tagsList,
            slug
        );

        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // DELETE /api/courses/{id}
    private static async Task<IResult> DeleteCourse(
        int id,
        IMediator mediator,
        HttpContext context)
    {
        var command = new DeleteCourseCommand(id);
        var result = await mediator.Send(command);

        if (result.Success)
        {
            return Results.NoContent();
        }

        return result.ToActionResult(context);
    }

    // POST /api/courses/{id}/teachers
    private static async Task<IResult> AssignTeachers(
        int id,
        AssignTeachersRequest request,
        IMediator mediator,
        HttpContext context)
    {
        // Guard validation for empty TeacherIds list
        if (request.TeacherIds == null || request.TeacherIds.Count == 0)
        {
            var errorResponse = new ServiceResponse<string>(
                false,
                "At least one teacher ID must be provided in TeacherIds. To unassign all teachers, use the unassign endpoint instead."
            );
            return Results.BadRequest(errorResponse);
        }

        // Additional validation for duplicate teacher IDs
        var duplicateIds = request.TeacherIds
            .GroupBy(id => id)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicateIds.Any())
        {
            var errorResponse = new ServiceResponse<string>(
                false,
                $"Duplicate teacher IDs found in TeacherIds: {string.Join(", ", duplicateIds)}"
            );
            return Results.BadRequest(errorResponse);
        }

        var command = new AssignTeachersCommand(id, request.TeacherIds);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // GET /api/courses
    private static async Task<IResult> GetCourses(
        [AsParameters] GetCoursesRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetCoursesQuery(
            request.PageNumber,
            request.PageSize,
            request.Status,
            request.SearchTerm,
            request.Tag
        );

        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/courses/{id}
    private static async Task<IResult> GetCourseById(
        int id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetCourseByIdQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }
}

// Request DTOs
public sealed record AssignTeachersRequest(
    [Required(ErrorMessage = "Teacher IDs are required")]
    [MinLength(1, ErrorMessage = "At least one teacher ID must be provided. To unassign all teachers, use the unassign endpoint instead.")]
    List<Guid> TeacherIds
);

public sealed record GetCoursesRequest
{
    private int _pageNumber = 1;
    private int _pageSize = 10;

    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int PageNumber 
    { 
        get => _pageNumber;
        init => _pageNumber = value < 1 
            ? throw new ArgumentOutOfRangeException(nameof(PageNumber), value, "Page number must be greater than 0")
            : value;
    }

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize 
    { 
        get => _pageSize;
        init => _pageSize = value < 1 
            ? throw new ArgumentOutOfRangeException(nameof(PageSize), value, "Page size must be greater than 0")
            : value > 100 
                ? throw new ArgumentOutOfRangeException(nameof(PageSize), value, "Page size cannot exceed 100")
                : value;
    }

    public CourseStatus? Status { get; init; }
    public string? SearchTerm { get; init; }
    public string? Tag { get; init; }
};


//FEHELP: CourseDtoFE là DTO trả về cho FE
// cần chỉnh sữa lại cái này vì mình đã thay đổi các input khi tạo khóa học, thêm các trường như duration, seats, price, mentorId vào đây để FE dể lấy dữ liệu hơn
//hãy thêm các trường này vào CourseDto nhé, CourseDtoFE tạo ra để mô tả cho FE thôi    
public record CourseDtoFE(
    int Id,
    string Title,
    string? Description,
    string? ThumbnailUrl,
    DateTime StartDate,
    DateTime EndDate,
    CourseStatus Status,
    string Slug,
    List<string>? Tags,
    List<CourseTeacherDto> Teachers,//danh sách giáo viên phụ trách khóa học
    int duration, //thời lượng khóa học
    string seats, //số lượng chỗ ngồi
    string price, //giá tiền khóa họcs
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    int value 
);

// FEHELP: CourseCurriculumDto
// tôi cần một api để get thông tin chương trình học của khóa học
// nội dung cần lấy có dạng mảng object như sau:
/*
[
    {
      title: '01 - datatype',
      summary: 'tìm hiểu về kiểu dữ liệu nguyên thủy',
      content: [
        'các kiểu dữ liệu cơ bản trong lập trình C',
        'Khái niệm về biến và khai báo biến',
        'convention name',
        'swap handler',
      ],
    },
    {
      title: '02 - if else và toán tử',
      summary: 'mệnh đề điều kiện',
      content: ['cấu trúc if else', 'toán tử logic', 'toán tử bit', 'toán tử điều kiện'],
    },
    {
      title: '03 - for loop',
      summary: 'vòng lặp for',
      content: ['cấu trúc for loop', 'cấu trúc for each', 'cấu trúc for in', 'cấu trúc for of'],
    },
    {
      title: '04 - while loop',
      summary: 'vòng lặp while',
      content: [
        'cấu trúc while loop',
        'cấu trúc do while loop',
        'cấu trúc for loop',
        'cấu trúc for each',
      ],
    },
  ]
*/

/*
* FEHELP: CourseInsideDto
 tôi cần một api để get các thông tin bên trong một khóa học bất kỳ, những nội dung và hình ảnh mô tả
 dạng md
 Course insight
 [image]
    Hành trình bắt đầu từ một dòng code đầu tiên
    Khoanh khac hoc vien dang hoc lap trinh
    Có những buổi tối bạn ngồi trước màn hình, nhìn lỗi hiện lên liên tục và tự hỏi liệu mình có hợp với lập trình không. Khóa học này được tạo ra chính từ những khoảnh khắc chông chênh đó, để nhắc bạn rằng: ai cũng từng bắt đầu từ con số 0.

    Chúng tôi không chỉ dạy cú pháp C Language, mà còn đồng hành để bạn hiểu cách tư duy, cách kiên nhẫn, và cách đứng dậy sau mỗi lần chương trình chạy sai. Mỗi bài học là một bước nhỏ, nhưng sau 10 tuần, bạn sẽ thấy mình đã đi một quãng đường thật dài.

    "Từ những dòng code vụng về đầu tiên, bạn có thể viết nên một phiên bản mạnh mẽ hơn của chính mình."
*/
