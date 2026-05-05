using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class AddCourseDetails : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "curriculum",
            table: "courses",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "duration",
            table: "courses",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<string>(
            name: "insight",
            table: "courses",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "price",
            table: "courses",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "seats",
            table: "courses",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "value",
            table: "courses",
            type: "integer",
            nullable: false,
            defaultValue: 0);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "curriculum",
            table: "courses");

        migrationBuilder.DropColumn(
            name: "duration",
            table: "courses");

        migrationBuilder.DropColumn(
            name: "insight",
            table: "courses");

        migrationBuilder.DropColumn(
            name: "price",
            table: "courses");

        migrationBuilder.DropColumn(
            name: "seats",
            table: "courses");

        migrationBuilder.DropColumn(
            name: "value",
            table: "courses");
    }
}
