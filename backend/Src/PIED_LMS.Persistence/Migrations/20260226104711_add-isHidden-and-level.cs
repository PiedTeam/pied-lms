using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class addisHiddenandlevel : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<double>(
            name: "score",
            table: "questions",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AddColumn<bool>(
            name: "is_hidden",
            table: "questions",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<int>(
            name: "level",
            table: "questions",
            type: "integer",
            nullable: false,
            defaultValue: 1);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "is_hidden",
            table: "questions");

        migrationBuilder.DropColumn(
            name: "level",
            table: "questions");

        migrationBuilder.AlterColumn<double>(
            name: "score",
            table: "questions",
            type: "double precision",
            nullable: false,
            oldClrType: typeof(double),
            oldType: "double precision",
            oldDefaultValue: 0.0);
    }
}
