using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class AddEnrollmentFeature : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "current_enrollment",
            table: "courses",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int>(
            name: "max_capacity",
            table: "courses",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.CreateTable(
            name: "course_prerequisites",
            columns: table => new
            {
                course_id = table.Column<int>(type: "integer", nullable: false),
                prerequisite_course_id = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_course_prerequisites", x => new { x.course_id, x.prerequisite_course_id });
                table.ForeignKey(
                    name: "fk_course_prerequisites_courses_course_id",
                    column: x => x.course_id,
                    principalTable: "courses",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_course_prerequisites_courses_prerequisite_course_id",
                    column: x => x.prerequisite_course_id,
                    principalTable: "courses",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "enrollments",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                course_id = table.Column<int>(type: "integer", nullable: false),
                status = table.Column<string>(type: "text", nullable: false),
                payment_proof_key = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_enrollments", x => x.id);
                table.ForeignKey(
                    name: "fk_enrollments_courses_course_id",
                    column: x => x.course_id,
                    principalTable: "courses",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_enrollments_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "enrollment_histories",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                enrollment_id = table.Column<Guid>(type: "uuid", nullable: false),
                old_status = table.Column<string>(type: "text", nullable: true),
                new_status = table.Column<string>(type: "text", nullable: false),
                changed_by = table.Column<Guid>(type: "uuid", nullable: false),
                change_reason = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_enrollment_histories", x => x.id);
                table.ForeignKey(
                    name: "fk_enrollment_histories_enrollments_enrollment_id",
                    column: x => x.enrollment_id,
                    principalTable: "enrollments",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_enrollment_histories_users_changed_by",
                    column: x => x.changed_by,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "ix_course_prerequisites_prerequisite_course_id",
            table: "course_prerequisites",
            column: "prerequisite_course_id");

        migrationBuilder.CreateIndex(
            name: "ix_enrollment_histories_changed_by",
            table: "enrollment_histories",
            column: "changed_by");

        migrationBuilder.CreateIndex(
            name: "ix_enrollment_histories_enrollment_id",
            table: "enrollment_histories",
            column: "enrollment_id");

        migrationBuilder.CreateIndex(
            name: "ix_enrollments_course_id",
            table: "enrollments",
            column: "course_id");

        migrationBuilder.CreateIndex(
            name: "ix_enrollments_user_id_course_id",
            table: "enrollments",
            columns: new[] { "user_id", "course_id" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "course_prerequisites");

        migrationBuilder.DropTable(
            name: "enrollment_histories");

        migrationBuilder.DropTable(
            name: "enrollments");

        migrationBuilder.DropColumn(
            name: "current_enrollment",
            table: "courses");

        migrationBuilder.DropColumn(
            name: "max_capacity",
            table: "courses");
    }
}
