using HabitPulse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HabitPulse.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<Completion> Completions => Set<Completion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Username).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
        });

        // Goal configuration
        modelBuilder.Entity<Goal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.IsMeasurable).HasDefaultValue(false);
            entity.Property(e => e.TargetValue).HasDefaultValue(0);
            entity.Property(e => e.Unit).HasMaxLength(20).HasDefaultValue("minutes");
            entity.Property(e => e.ScheduleDays).HasDefaultValueSql("'{0,1,2,3,4,5,6}'");
            entity.Property(e => e.SortOrder).HasDefaultValue(0);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity
                .HasOne(e => e.User)
                .WithMany(u => u.Goals)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Completion configuration
        modelBuilder.Entity<Completion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CompletedOn).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasIndex(e => new { e.GoalId, e.CompletedOn }).IsUnique();

            entity
                .HasOne(e => e.Goal)
                .WithMany(g => g.Completions)
                .HasForeignKey(e => e.GoalId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
