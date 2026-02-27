using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class AutoMigration : Migration
{
    /// <inheritdoc />  
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterDatabase()
            .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

        migrationBuilder.CreateTable(
            name: "roles",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                normalized_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                concurrency_stamp = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_roles", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "users",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                profile_picture_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                normalized_user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                normalized_email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                email_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                password_hash = table.Column<string>(type: "text", nullable: true),
                security_stamp = table.Column<string>(type: "text", nullable: true),
                concurrency_stamp = table.Column<string>(type: "text", nullable: true),
                phone_number = table.Column<string>(type: "text", nullable: true),
                phone_number_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                two_factor_enabled = table.Column<bool>(type: "boolean", nullable: false),
                lockout_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                lockout_enabled = table.Column<bool>(type: "boolean", nullable: false),
                access_failed_count = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_users", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "role_claims",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                role_id = table.Column<Guid>(type: "uuid", nullable: false),
                claim_type = table.Column<string>(type: "text", nullable: true),
                claim_value = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_role_claims", x => x.id);
                table.ForeignKey(
                    name: "fk_role_claims_roles_role_id",
                    column: x => x.role_id,
                    principalTable: "roles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

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
                room_code = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                created_by = table.Column<Guid>(type: "uuid", nullable: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
                is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
            name: "question_quizs",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                is_published = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                is_hidden = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                level = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_question_quizs", x => x.id);
                table.ForeignKey(
                    name: "fk_question_quizs_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "test_room",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                join_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                created_by = table.Column<Guid>(type: "uuid", nullable: false),
                start_time = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                end_time = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_test_room", x => x.id);
                table.CheckConstraint("CK_TestRoom_EndTime_After_StartTime", "\"end_time\" > \"start_time\"");
                table.ForeignKey(
                    name: "fk_test_room_users_created_by",
                    column: x => x.created_by,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "user_claims",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                claim_type = table.Column<string>(type: "text", nullable: true),
                claim_value = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_user_claims", x => x.id);
                table.ForeignKey(
                    name: "fk_user_claims_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "user_logins",
            columns: table => new
            {
                login_provider = table.Column<string>(type: "text", nullable: false),
                provider_key = table.Column<string>(type: "text", nullable: false),
                provider_display_name = table.Column<string>(type: "text", nullable: true),
                user_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_user_logins", x => new { x.login_provider, x.provider_key });
                table.ForeignKey(
                    name: "fk_user_logins_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "user_roles",
            columns: table => new
            {
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                role_id = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_user_roles", x => new { x.user_id, x.role_id });
                table.ForeignKey(
                    name: "fk_user_roles_roles_role_id",
                    column: x => x.role_id,
                    principalTable: "roles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_user_roles_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "user_tokens",
            columns: table => new
            {
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                login_provider = table.Column<string>(type: "text", nullable: false),
                name = table.Column<string>(type: "text", nullable: false),
                value = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_user_tokens", x => new { x.user_id, x.login_provider, x.name });
                table.ForeignKey(
                    name: "fk_user_tokens_users_user_id",
                    column: x => x.user_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "exam_room_enrollments",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                exam_room_id = table.Column<Guid>(type: "uuid", nullable: false),
                student_id = table.Column<Guid>(type: "uuid", nullable: false),
                enrolled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                email_sent = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                email_sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_exam_room_enrollments", x => x.id);
                table.ForeignKey(
                    name: "fk_exam_room_enrollments_exam_room_exam_room_id",
                    column: x => x.exam_room_id,
                    principalTable: "exam_rooms",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_exam_room_enrollments_users_student_id",
                    column: x => x.student_id,
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
                is_completed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                answers_json = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_exam_participations", x => x.id);
                table.ForeignKey(
                    name: "fk_exam_participations_exam_room_exam_room_id",
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

        migrationBuilder.CreateTable(
            name: "test_cases",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                exam_id = table.Column<Guid>(type: "uuid", nullable: false),
                index = table.Column<int>(type: "integer", nullable: false),
                input_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                output_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                is_hidden = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_test_cases", x => x.id);
                table.ForeignKey(
                    name: "fk_test_cases_exams_exam_id",
                    column: x => x.exam_id,
                    principalTable: "exams",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "questions",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                content = table.Column<string>(type: "text", nullable: false),
                score = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                question_type = table.Column<string>(type: "text", nullable: false),
                is_hidden = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                level = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                quiz_id = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_questions", x => x.id);
                table.ForeignKey(
                    name: "fk_questions_question_quiz_quiz_id",
                    column: x => x.quiz_id,
                    principalTable: "question_quizs",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "question_answers",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                content = table.Column<string>(type: "text", nullable: false),
                is_correct = table.Column<bool>(type: "boolean", nullable: false),
                question_id = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_question_answers", x => x.id);
                table.ForeignKey(
                    name: "fk_question_answers_question_question_id",
                    column: x => x.question_id,
                    principalTable: "questions",
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
            name: "ix_exam_room_enrollments_exam_room_id_student_id",
            table: "exam_room_enrollments",
            columns: new[] { "exam_room_id", "student_id" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_exam_room_enrollments_student_id",
            table: "exam_room_enrollments",
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
            name: "ix_exam_rooms_room_code",
            table: "exam_rooms",
            column: "room_code",
            unique: true);

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

        migrationBuilder.CreateIndex(
            name: "ix_question_answers_question_id",
            table: "question_answers",
            column: "question_id");

        migrationBuilder.CreateIndex(
            name: "ix_question_quizs_user_id",
            table: "question_quizs",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_questions_quiz_id",
            table: "questions",
            column: "quiz_id");

        migrationBuilder.CreateIndex(
            name: "ix_role_claims_role_id",
            table: "role_claims",
            column: "role_id");

        migrationBuilder.CreateIndex(
            name: "RoleNameIndex",
            table: "roles",
            column: "normalized_name",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_test_cases_exam_id_index",
            table: "test_cases",
            columns: new[] { "exam_id", "index" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_test_room_created_by",
            table: "test_room",
            column: "created_by");

        migrationBuilder.CreateIndex(
            name: "ix_test_room_join_code",
            table: "test_room",
            column: "join_code",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_user_claims_user_id",
            table: "user_claims",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_user_logins_user_id",
            table: "user_logins",
            column: "user_id");

        migrationBuilder.CreateIndex(
            name: "ix_user_roles_role_id",
            table: "user_roles",
            column: "role_id");

        migrationBuilder.CreateIndex(
            name: "EmailIndex",
            table: "users",
            column: "normalized_email");

        migrationBuilder.CreateIndex(
            name: "UserNameIndex",
            table: "users",
            column: "normalized_user_name",
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "exam_participations");

        migrationBuilder.DropTable(
            name: "exam_room_enrollments");

        migrationBuilder.DropTable(
            name: "exam_room_exams");

        migrationBuilder.DropTable(
            name: "question_answers");

        migrationBuilder.DropTable(
            name: "role_claims");

        migrationBuilder.DropTable(
            name: "test_cases");

        migrationBuilder.DropTable(
            name: "test_room");

        migrationBuilder.DropTable(
            name: "user_claims");

        migrationBuilder.DropTable(
            name: "user_logins");

        migrationBuilder.DropTable(
            name: "user_roles");

        migrationBuilder.DropTable(
            name: "user_tokens");

        migrationBuilder.DropTable(
            name: "exam_rooms");

        migrationBuilder.DropTable(
            name: "questions");

        migrationBuilder.DropTable(
            name: "exams");

        migrationBuilder.DropTable(
            name: "roles");

        migrationBuilder.DropTable(
            name: "question_quizs");

        migrationBuilder.DropTable(
            name: "users");
    }
}
