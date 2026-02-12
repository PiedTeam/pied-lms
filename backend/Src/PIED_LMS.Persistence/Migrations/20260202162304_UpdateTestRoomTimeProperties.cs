using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
    public partial class UpdateTestRoomTimeProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_test_rooms_join_code",
                table: "test_rooms");

            migrationBuilder.DeleteData(
                table: "roles",
                keyColumn: "id",
                keyValue: new Guid("3c1d2e4f-5a67-4b8f-9a0b-7a2f3c451d6b"));

            migrationBuilder.DeleteData(
                table: "roles",
                keyColumn: "id",
                keyValue: new Guid("7a2f3c45-1d6b-4e8f-9a0b-3c2d1e4f5a67"));

            migrationBuilder.DeleteData(
                table: "roles",
                keyColumn: "id",
                keyValue: new Guid("b4a5b0c5-9c3a-4f0a-8e1f-6d2c3a1b2f10"));

            migrationBuilder.AddColumn<Guid>(
                name: "created_by",
                table: "test_rooms",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "end_time",
                table: "test_rooms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "start_time",
                table: "test_rooms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.CreateIndex(
                name: "ix_test_rooms_created_by",
                table: "test_rooms",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_test_rooms_join_code",
                table: "test_rooms",
                column: "join_code",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_TestRoom_EndTime_After_StartTime",
                table: "test_rooms",
                sql: "\"end_time\" > \"start_time\"");

            migrationBuilder.AddForeignKey(
                name: "fk_test_rooms_users_created_by",
                table: "test_rooms",
                column: "created_by",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_test_rooms_users_created_by",
                table: "test_rooms");

            migrationBuilder.DropIndex(
                name: "ix_test_rooms_created_by",
                table: "test_rooms");

            migrationBuilder.DropIndex(
                name: "ix_test_rooms_join_code",
                table: "test_rooms");

            migrationBuilder.DropCheckConstraint(
                name: "CK_TestRoom_EndTime_After_StartTime",
                table: "test_rooms");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "test_rooms");

            migrationBuilder.DropColumn(
                name: "end_time",
                table: "test_rooms");

            migrationBuilder.DropColumn(
                name: "start_time",
                table: "test_rooms");

            migrationBuilder.InsertData(
                table: "roles",
                columns: new[] { "id", "concurrency_stamp", "created_at", "description", "name", "normalized_name" },
                values: new object[,]
                {
                    { new Guid("3c1d2e4f-5a67-4b8f-9a0b-7a2f3c451d6b"), "role-student-concurrency", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Student who can enroll in courses", "Student", "STUDENT" },
                    { new Guid("7a2f3c45-1d6b-4e8f-9a0b-3c2d1e4f5a67"), "role-mentor-concurrency", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mentor who can create and manage courses", "Mentor", "MENTOR" },
                    { new Guid("b4a5b0c5-9c3a-4f0a-8e1f-6d2c3a1b2f10"), "role-admin-concurrency", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Administrator with full access", "Admin", "ADMIN" }
                });

            migrationBuilder.CreateIndex(
                name: "ix_test_rooms_join_code",
                table: "test_rooms",
                column: "join_code");
    }
}
