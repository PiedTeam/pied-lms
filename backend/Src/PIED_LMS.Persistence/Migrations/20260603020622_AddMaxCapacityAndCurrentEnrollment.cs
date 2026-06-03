using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class AddMaxCapacityAndCurrentEnrollment : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Use IF NOT EXISTS to handle databases where these columns may already exist
        migrationBuilder.Sql("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'courses' AND column_name = 'current_enrollment'
                ) THEN
                    ALTER TABLE courses ADD current_enrollment integer NOT NULL DEFAULT 0;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'courses' AND column_name = 'max_capacity'
                ) THEN
                    ALTER TABLE courses ADD max_capacity integer NOT NULL DEFAULT 0;
                END IF;
            END $$;
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "current_enrollment",
            table: "courses");

        migrationBuilder.DropColumn(
            name: "max_capacity",
            table: "courses");
    }
}
