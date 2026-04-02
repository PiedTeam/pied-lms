using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class AddExplanationToQuestionAnswer : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "explanation",
            table: "question_answers",
            type: "text",
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "explanation",
            table: "question_answers");
    }
}
