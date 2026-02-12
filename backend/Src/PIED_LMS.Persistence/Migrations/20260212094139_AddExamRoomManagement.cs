using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class AddExamRoomManagement : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
            migrationBuilder.CreateTable(
                name: "exam_rooms",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    duration_in_minutes = table.Column<int>(type: "integer", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_exam_rooms", x => x.id);
                    table.ForeignKey(
                        name: "fk_exam_rooms_users_created_by",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exams",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    total_marks = table.Column<int>(type: "integer", nullable: false),
                    passing_marks = table.Column<int>(type: "integer", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_exams", x => x.id);
                    table.ForeignKey(
                        name: "fk_exams_users_created_by",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_participations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    exam_room_id = table.Column<Guid>(type: "uuid", nullable: false),
                    exam_id = table.Column<Guid>(type: "uuid", nullable: false),
                    student_id = table.Column<Guid>(type: "uuid", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    score = table.Column<int>(type: "integer", nullable: true),
                    is_completed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_exam_participations", x => x.id);
                    table.ForeignKey(
                        name: "fk_exam_participations_exam_rooms_exam_room_id",
                        column: x => x.exam_room_id,
                        principalTable: "exam_rooms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_exam_participations_exams_exam_id",
                        column: x => x.exam_id,
                        principalTable: "exams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_exam_participations_users_student_id",
                        column: x => x.student_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_room_exams",
                columns: table => new
                {
                    exam_room_id = table.Column<Guid>(type: "uuid", nullable: false),
                    exam_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_exam_room_exams", x => new { x.exam_room_id, x.exam_id });
                    table.ForeignKey(
                        name: "fk_exam_room_exams_exam_rooms_exam_room_id",
                        column: x => x.exam_room_id,
                        principalTable: "exam_rooms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_exam_room_exams_exams_exam_id",
                        column: x => x.exam_id,
                        principalTable: "exams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_exam_participations_exam_id_student_id",
                table: "exam_participations",
                columns: new[] { "exam_id", "student_id" });

            migrationBuilder.CreateIndex(
                name: "ix_exam_participations_exam_room_id_student_id",
                table: "exam_participations",
                columns: new[] { "exam_room_id", "student_id" });

            migrationBuilder.CreateIndex(
                name: "ix_exam_participations_student_id",
                table: "exam_participations",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "ix_exam_room_exams_exam_id",
                table: "exam_room_exams",
                column: "exam_id");

            migrationBuilder.CreateIndex(
                name: "ix_exam_rooms_created_by",
                table: "exam_rooms",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_exam_rooms_end_time",
                table: "exam_rooms",
                column: "end_time");

            migrationBuilder.CreateIndex(
                name: "ix_exam_rooms_is_deleted",
                table: "exam_rooms",
                column: "is_deleted");

            migrationBuilder.CreateIndex(
                name: "ix_exam_rooms_start_time",
                table: "exam_rooms",
                column: "start_time");

            migrationBuilder.CreateIndex(
                name: "ix_exams_created_by",
                table: "exams",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_exams_is_deleted",
                table: "exams",
                column: "is_deleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "exam_participations");

            migrationBuilder.DropTable(
                name: "exam_room_exams");

            migrationBuilder.DropTable(
                name: "exam_rooms");

            migrationBuilder.DropTable(
                name: "exams");
        }
    }
