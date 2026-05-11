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
        migrationBuilder.DropForeignKey(name: "fk_enrollments_courses_course_id", table: "enrollments");
        migrationBuilder.DropForeignKey(name: "fk_course_mentors_courses_course_id", table: "course_mentors");
        migrationBuilder.DropForeignKey(name: "fk_course_prerequisites_courses_course_id", table: "course_prerequisites");
        migrationBuilder.DropForeignKey(name: "fk_course_prerequisites_courses_prerequisite_course_id", table: "course_prerequisites");

        migrationBuilder.Sql("ALTER TABLE courses ALTER COLUMN id DROP IDENTITY IF EXISTS;");
        migrationBuilder.Sql("ALTER TABLE courses ALTER COLUMN id TYPE uuid USING (id::text::uuid);");

        migrationBuilder.Sql("ALTER TABLE enrollments ALTER COLUMN course_id TYPE uuid USING (course_id::text::uuid);");
        migrationBuilder.Sql("ALTER TABLE course_mentors ALTER COLUMN course_id TYPE uuid USING (course_id::text::uuid);");
        migrationBuilder.Sql("ALTER TABLE course_prerequisites ALTER COLUMN course_id TYPE uuid USING (course_id::text::uuid);");
        migrationBuilder.Sql("ALTER TABLE course_prerequisites ALTER COLUMN prerequisite_course_id TYPE uuid USING (prerequisite_course_id::text::uuid);");

        migrationBuilder.AlterColumn<Guid>(name: "id", table: "courses", type: "uuid", nullable: false);
        migrationBuilder.AlterColumn<Guid>(name: "course_id", table: "enrollments", type: "uuid", nullable: false);
        migrationBuilder.AlterColumn<Guid>(name: "course_id", table: "course_mentors", type: "uuid", nullable: false);
        migrationBuilder.AlterColumn<Guid>(name: "course_id", table: "course_prerequisites", type: "uuid", nullable: false);
        migrationBuilder.AlterColumn<Guid>(name: "prerequisite_course_id", table: "course_prerequisites", type: "uuid", nullable: false);

        migrationBuilder.AddForeignKey(
            name: "fk_enrollments_courses_course_id", table: "enrollments", column: "course_id",
            principalTable: "courses", principalColumn: "id", onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_course_mentors_courses_course_id", table: "course_mentors", column: "course_id",
            principalTable: "courses", principalColumn: "id", onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_course_prerequisites_courses_course_id", table: "course_prerequisites", column: "course_id",
            principalTable: "courses", principalColumn: "id", onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "fk_course_prerequisites_courses_prerequisite_course_id", table: "course_prerequisites", column: "prerequisite_course_id",
            principalTable: "courses", principalColumn: "id", onDelete: ReferentialAction.Cascade);
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
