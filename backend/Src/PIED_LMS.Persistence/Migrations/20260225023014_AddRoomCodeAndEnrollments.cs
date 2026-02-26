using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PIED_LMS.Persistence.Migrations;

/// <inheritdoc />
public partial class AddRoomCodeAndEnrollments : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTime>(
            name: "deleted_at",
            table: "exams",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "deleted_at",
            table: "exam_rooms",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "room_code",
            table: "exam_rooms",
            type: "character varying(8)",
            maxLength: 8,
            nullable: false,
            defaultValue: "");

        // Generate unique room codes for existing exam rooms
        migrationBuilder.Sql(@"
            DO $$
            DECLARE
                room_record RECORD;
                new_code TEXT;
                code_exists BOOLEAN;
            BEGIN
                FOR room_record IN SELECT id FROM exam_rooms WHERE room_code = '' LOOP
                    LOOP
                        -- Generate 8-character alphanumeric code (excluding 0, O, I, 1)
                        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || room_record.id::TEXT) FROM 1 FOR 8));
                        new_code := TRANSLATE(new_code, '01IO', '2345');
                        
                        -- Check if code already exists
                        SELECT EXISTS(SELECT 1 FROM exam_rooms WHERE room_code = new_code) INTO code_exists;
                        
                        -- If unique, update and exit loop
                        IF NOT code_exists THEN
                            UPDATE exam_rooms SET room_code = new_code WHERE id = room_record.id;
                            EXIT;
                        END IF;
                    END LOOP;
                END LOOP;
            END $$;
        ");

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

        migrationBuilder.CreateIndex(
            name: "ix_exam_rooms_room_code",
            table: "exam_rooms",
            column: "room_code",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_exam_room_enrollments_exam_room_id_student_id",
            table: "exam_room_enrollments",
            columns: new[] { "exam_room_id", "student_id" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_exam_room_enrollments_student_id",
            table: "exam_room_enrollments",
            column: "student_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "exam_room_enrollments");

        migrationBuilder.DropIndex(
            name: "ix_exam_rooms_room_code",
            table: "exam_rooms");

        migrationBuilder.DropColumn(
            name: "deleted_at",
            table: "exams");

        migrationBuilder.DropColumn(
            name: "deleted_at",
            table: "exam_rooms");

        migrationBuilder.DropColumn(
            name: "room_code",
            table: "exam_rooms");
    }
}
