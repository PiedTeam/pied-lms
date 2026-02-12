using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class SyncModelChanges : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateTimeOffset>(
            name: "created_at",
            table: "test_rooms",
            type: "timestamp with time zone",
            nullable: false,
            defaultValueSql: "now()",
            oldClrType: typeof(DateTimeOffset),
            oldType: "timestamp with time zone");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateTimeOffset>(
            name: "created_at",
            table: "test_rooms",
            type: "timestamp with time zone",
            nullable: false,
            oldClrType: typeof(DateTimeOffset),
            oldType: "timestamp with time zone",
            oldDefaultValueSql: "now()");
    }
}
