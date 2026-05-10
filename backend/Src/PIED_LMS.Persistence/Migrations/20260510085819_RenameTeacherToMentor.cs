using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class RenameTeacherToMentor : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "course_teachers");

        migrationBuilder.RenameColumn(
            name: "profile_picture_url",
            table: "users",
            newName: "avatar_url");

        migrationBuilder.CreateTable(
            name: "course_mentors",
            columns: table => new
            {
                course_id = table.Column<int>(type: "integer", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_course_mentors", x => new { x.course_id, x.user_id });
                table.ForeignKey(
                    name: "fk_course_mentors_courses_course_id",
                    column: x => x.course_id,
                    principalTable: "courses",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_course_mentors_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_course_mentors_user_id",
            table: "course_mentors",
            column: "user_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "course_mentors");

        migrationBuilder.RenameColumn(
            name: "avatar_url",
            table: "users",
            newName: "profile_picture_url");

        migrationBuilder.CreateTable(
            name: "course_teachers",
            columns: table => new
            {
                course_id = table.Column<int>(type: "integer", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_course_teachers", x => new { x.course_id, x.user_id });
                table.ForeignKey(
                    name: "fk_course_teachers_courses_course_id",
                    column: x => x.course_id,
                    principalTable: "courses",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_course_teachers_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_course_teachers_user_id",
            table: "course_teachers",
            column: "user_id");
    }
}
