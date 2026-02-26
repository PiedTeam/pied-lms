using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class AddTestCaseEntity : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "test_cases",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                question_id = table.Column<int>(type: "integer", nullable: false),
                index = table.Column<int>(type: "integer", nullable: false),
                input_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                output_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                is_hidden = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_test_cases", x => x.id);
                table.ForeignKey(
                    name: "fk_test_cases_questions_question_id",
                    column: x => x.question_id,
                    principalTable: "questions",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_test_cases_question_id_index",
            table: "test_cases",
            columns: new[] { "question_id", "index" },
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "test_cases");
    }
}
