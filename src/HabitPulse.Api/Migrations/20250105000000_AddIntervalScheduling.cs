using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HabitPulse.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIntervalScheduling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IntervalDays",
                table: "Goals",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "IntervalStartDate",
                table: "Goals",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IntervalDays",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "IntervalStartDate",
                table: "Goals");
        }
    }
}
