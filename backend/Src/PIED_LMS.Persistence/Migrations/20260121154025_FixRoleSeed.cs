using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class FixRoleSeed : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DeleteData(
            table: "roles",
            keyColumn: "id",
            keyValue: new Guid("06970f04-b09a-7000-9879-1f1b7df06fed"));

        migrationBuilder.DeleteData(
            table: "roles",
            keyColumn: "id",
            keyValue: new Guid("06970f04-b09d-7000-9858-7c19400d62b7"));

        migrationBuilder.DeleteData(
            table: "roles",
            keyColumn: "id",
            keyValue: new Guid("06970f04-b09d-7001-9b95-d70e7971f3fd"));

        migrationBuilder.InsertData(
            table: "roles",
            columns: new[] { "id", "concurrency_stamp", "created_at", "description", "name", "normalized_name" },
            values: new object[,]
            {
                    { new Guid("3c1d2e4f-5a67-4b8f-9a0b-7a2f3c451d6b"), "role-student-concurrency", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Student who can enroll in courses", "Student", "STUDENT" },
                    { new Guid("7a2f3c45-1d6b-4e8f-9a0b-3c2d1e4f5a67"), "role-mentor-concurrency", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mentor who can create and manage courses", "Mentor", "MENTOR" },
                    { new Guid("b4a5b0c5-9c3a-4f0a-8e1f-6d2c3a1b2f10"), "role-admin-concurrency", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Administrator with full access", "Administrator", "ADMINISTRATOR" }
            });

        // Fix existing data for environments where this migration already ran with "Admin"
        migrationBuilder.Sql("UPDATE roles SET name = 'Administrator', normalized_name = 'ADMINISTRATOR' WHERE id = 'b4a5b0c5-9c3a-4f0a-8e1f-6d2c3a1b2f10'");
        
        // Also handle legacy 'Admin' role if it exists under a different ID (move users and delete)
        migrationBuilder.Sql(@"
            DO $$
            DECLARE
                admin_role_id uuid;
                legacy_admin_role_id uuid;
            BEGIN
                SELECT id INTO admin_role_id FROM roles WHERE name = 'Administrator';
                SELECT id INTO legacy_admin_role_id FROM roles WHERE name = 'Admin' AND id != 'b4a5b0c5-9c3a-4f0a-8e1f-6d2c3a1b2f10';
                
                IF legacy_admin_role_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
                    UPDATE user_roles SET role_id = admin_role_id WHERE role_id = legacy_admin_role_id;
                    DELETE FROM roles WHERE id = legacy_admin_role_id;
                END IF;
            END $$;
        ");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
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

        migrationBuilder.InsertData(
            table: "roles",
            columns: new[] { "id", "concurrency_stamp", "created_at", "description", "name", "normalized_name" },
            values: new object[,]
            {
                    { new Guid("06970f04-b09a-7000-9879-1f1b7df06fed"), "9a491344-96bf-47bf-a0f6-283146b41713", new DateTime(2026, 1, 21, 15, 27, 7, 158, DateTimeKind.Utc).AddTicks(4745), "Administrator with full access", "Admin", "ADMIN" },
                    { new Guid("06970f04-b09d-7000-9858-7c19400d62b7"), "541da432-b916-442b-b660-13b186933495", new DateTime(2026, 1, 21, 15, 27, 7, 158, DateTimeKind.Utc).AddTicks(5166), "Mentor who can create and manage courses", "Mentor", "MENTOR" },
                    { new Guid("06970f04-b09d-7001-9b95-d70e7971f3fd"), "c4e7f281-f95c-4c8d-b371-4de5ebb1e847", new DateTime(2026, 1, 21, 15, 27, 7, 158, DateTimeKind.Utc).AddTicks(5179), "Student who can enroll in courses", "Student", "STUDENT" }
            });
    }
}
