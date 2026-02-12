using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class FixCheckConstraint : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropCheckConstraint(
            name: "CK_TestRoom_EndTime_After_StartTime",
            table: "test_rooms");

        migrationBuilder.AddCheckConstraint(
            name: "CK_TestRoom_EndTime_After_StartTime",
            table: "test_rooms",
            sql: "\"end_time\" > \"start_time\"");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropCheckConstraint(
            name: "CK_TestRoom_EndTime_After_StartTime",
            table: "test_rooms");

        migrationBuilder.AddCheckConstraint(
            name: "CK_TestRoom_EndTime_After_StartTime",
            table: "test_rooms",
            sql: "\"EndTime\" > \"StartTime\"");
    }
}
