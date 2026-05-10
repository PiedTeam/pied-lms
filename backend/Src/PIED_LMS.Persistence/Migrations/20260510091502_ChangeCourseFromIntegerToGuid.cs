using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class ChangeCourseFromIntegerToGuid : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<Guid>(
            name: "course_id",
            table: "enrollments",
            type: "uuid",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<Guid>(
            name: "id",
            table: "courses",
            type: "uuid",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "integer")
            .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

        migrationBuilder.AlterColumn<Guid>(
            name: "prerequisite_course_id",
            table: "course_prerequisites",
            type: "uuid",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<Guid>(
            name: "course_id",
            table: "course_prerequisites",
            type: "uuid",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<Guid>(
            name: "course_id",
            table: "course_mentors",
            type: "uuid",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "integer");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<int>(
            name: "course_id",
            table: "enrollments",
            type: "integer",
            nullable: false,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AlterColumn<int>(
            name: "id",
            table: "courses",
            type: "integer",
            nullable: false,
            oldClrType: typeof(Guid),
            oldType: "uuid")
            .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

        migrationBuilder.AlterColumn<int>(
            name: "prerequisite_course_id",
            table: "course_prerequisites",
            type: "integer",
            nullable: false,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AlterColumn<int>(
            name: "course_id",
            table: "course_prerequisites",
            type: "integer",
            nullable: false,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AlterColumn<int>(
            name: "course_id",
            table: "course_mentors",
            type: "integer",
            nullable: false,
            oldClrType: typeof(Guid),
            oldType: "uuid");
    }
}
