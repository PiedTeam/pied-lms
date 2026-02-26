using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class RefactorTestCase_LinkToExam : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_test_cases_questions_question_id",
            table: "test_cases");

        migrationBuilder.DropIndex(
            name: "ix_test_cases_question_id_index",
            table: "test_cases");

        migrationBuilder.DropColumn(
            name: "question_id",
            table: "test_cases");

        migrationBuilder.AddColumn<Guid>(
            name: "exam_id",
            table: "test_cases",
            type: "uuid",
            nullable: false,
            defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

        migrationBuilder.CreateIndex(
            name: "ix_test_cases_exam_id_index",
            table: "test_cases",
            columns: new[] { "exam_id", "index" },
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "fk_test_cases_exams_exam_id",
            table: "test_cases",
            column: "exam_id",
            principalTable: "exams",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "fk_test_cases_exams_exam_id",
            table: "test_cases");

        migrationBuilder.DropIndex(
            name: "ix_test_cases_exam_id_index",
            table: "test_cases");

        migrationBuilder.DropColumn(
            name: "exam_id",
            table: "test_cases");

        migrationBuilder.AddColumn<int>(
            name: "question_id",
            table: "test_cases",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.CreateIndex(
            name: "ix_test_cases_question_id_index",
            table: "test_cases",
            columns: new[] { "question_id", "index" },
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "fk_test_cases_questions_question_id",
            table: "test_cases",
            column: "question_id",
            principalTable: "questions",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);
    }
}
