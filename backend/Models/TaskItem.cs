using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace TaskManager.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Task title is required")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Task title must be between 1 and 200 characters")]
        public string Title { get; set; } = string.Empty;

        public bool IsDone { get; set; }

        [Required]
        public int UserId { get; set; }

        // Exclude navigation property from validation
        [BindNever]
        public User User { get; set; } = null!;
    }
}