using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using CC.Net.Entities;

namespace CC.Net.Services.Courses
{
    public enum CourseAccess
    {
        Public = 1,
        Everyone = Public,
        Private = 2,
    }
    public class CourseConfigDto
    {
        public string Name { get; set; }
        public string Desc { get; set; }
        public bool Disabled { get; set; }
        public CourseAccess Access { get; set; }
        public List<CourseYearDto> Courses { get; set; } = new List<CourseYearDto>();
        public List<string> Errors { get; set; } = new List<string>();
        
        [JsonIgnore]
        public string CourseDir { get; set; }
    }

    public class CourseYearDto
    {
        public string Course => _courseConfigDto?.Name;
        public string Year { get; set; }
        public List<SettingsConfigTeacher> Teachers { private get; set; } = new List<SettingsConfigTeacher>();


        public List<string> AllUsers() => Teachers
            .SelectMany(i => i.Students.Select(j => j.id))
            .Concat(Teachers.Select(i => i.Id))
            .Distinct()
            .ToList();
        
        public List<User> AllStudents() => Teachers
            .SelectMany(i => i.Students)
            .GroupBy(i => i.id)
            .Select(i => i.First())
            .ToList();

        public List<User> StudentsFor(string teacher) => Teachers
            .Where(i => i.Id == teacher)
            .SelectMany(i => i.Students)
            .GroupBy(i => i.id)
            .Select(i => i.First())
            .ToList();

        public List<SettingsConfigTeacher> TeachersFor(string student) => Teachers
            .Where(i => i.Students.Any(j => j.id == student))
            .ToList();
        
        public List<ProblemDto> Problems { get; set; } = new List<ProblemDto>();
        
        // --------------------------------------
        public CourseYearDto(CourseConfigDto courseConfigDto)
        {
            CourseConfigDto(courseConfigDto);
        }
        
        internal CourseConfigDto _courseConfigDto;

        public CourseConfigDto CourseConfigDto(CourseConfigDto item = null) => item == null
            ? _courseConfigDto
            : _courseConfigDto = item;
    }

    public class ProblemDto
    {
        public string Course => _courseYearDto?.Course;
        public string Year => _courseYearDto?.Year;
        public string Problem => Config.Id;
        public CourseProblem Config { get; set; }
        
        // --------------------------------------
        public ProblemDto(CourseYearDto courseYearDto)
        {
            CourseYearDto(courseYearDto);
        }
        internal CourseYearDto _courseYearDto;

        public CourseYearDto CourseYearDto(CourseYearDto item = null) => item == null
            ? _courseYearDto
            : _courseYearDto = item;

        public ProblemDto IncludeDescription()
        {
            var cloned = Config.Clone();
            cloned.ShowDescription = true;
            
            return new ProblemDto(_courseYearDto)
            {
                Config = cloned,
            };
        }
    }
}